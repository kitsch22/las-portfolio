(function(){
  var bar = document.querySelector('[data-topbar]');
  if(!bar) return;

  function measure(){
    document.documentElement.style.setProperty('--topbar-h', bar.offsetHeight + 'px');
  }

  var last = window.scrollY;
  var ticking = false;

  function update(){
    var y = window.scrollY;
    if(y <= 8){
      bar.classList.remove('is-hidden');            // no topo, sempre visível
    } else if(y > last + 5){
      bar.classList.add('is-hidden');               // descendo
    } else if(y < last - 5){
      bar.classList.remove('is-hidden');            // subindo
    }
    last = y;
    ticking = false;
  }

  window.addEventListener('scroll', function(){
    if(!ticking){ requestAnimationFrame(update); ticking = true; }
  }, {passive:true});

  window.addEventListener('resize', measure);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();

  // rolagem suave para as âncoras internas
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if(id.length < 2) return;
      var target = document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top:y, behavior: calm.matches ? 'auto' : 'smooth' });
      try { history.replaceState(null, '', id); } catch (err) { /* iframe sem mesma origem */ }
    });
  });
})();

(function(){
  var root = document.querySelector('.showcase');
  if(!root) return;

  var strip    = root.querySelector('[data-strip]');
  var rail     = root.querySelector('.rail');
  var metaTop  = root.querySelector('[data-meta-top]');
  var metaBot  = root.querySelector('[data-meta-bottom]');
  var elOrd    = metaTop.querySelector('[data-ordinal]');
  var elTitle  = metaTop.querySelector('[data-title]');
  var elCat    = metaBot.querySelector('[data-cat]');
  var elYear   = metaBot.querySelector('[data-year]');
  var elCur    = root.querySelector('[data-current]');
  var elCase   = root.querySelector('[data-case]');
  var elCaseT  = elCase.querySelector('[data-case-title]');
  var elCaseP  = elCase.querySelector('[data-case-text]');
  var elCaseL  = elCase.querySelector('[data-case-logo]');
  var elCaseA  = elCase.querySelector('.case__link');
  var elCaseS  = elCase.querySelector('[data-case-soon]');
  var elTotal  = root.querySelector('[data-total]');
  var trilho   = root.querySelector('[data-trilho]');

  // vitrine finita: sem clones, a lista é exatamente o que está no HTML
  var nodes = Array.prototype.slice.call(strip.children);
  var COUNT = nodes.length;
  var index = 0;
  var M = {};

  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)');

  var chevPrev = root.querySelector('.chev--prev');
  var chevNext = root.querySelector('.chev--next');

  // nas pontas a seta não leva a lugar nenhum; desabilitar evita clique morto
  function sincronizaSetas(){
    chevPrev.disabled = (index === 0);
    chevNext.disabled = (index === COUNT - 1);
  }

  function pad(n){ return (n < 10 ? '0' : '') + n; }

  function readMetrics(){
    var cs = getComputedStyle(root);
    M.w    = parseFloat(cs.getPropertyValue('--item-w'));
    M.aw   = parseFloat(cs.getPropertyValue('--item-aw'));
    M.gap  = parseFloat(cs.getPropertyValue('--item-gap'));
    M.cw   = parseFloat(cs.getPropertyValue('--case-w'))   || 0;
    M.cgap = parseFloat(cs.getPropertyValue('--case-gap')) || 0;
  }

  function place(animate){
    var group = M.aw + M.cgap + M.cw;
    var x = rail.clientWidth / 2 - group / 2 - index * (M.w + M.gap);
    if(!animate) strip.classList.add('no-anim');
    strip.style.transform = 'translate3d(' + x + 'px,0,0)';
    if(!animate){
      strip.offsetHeight; // força reflow
      requestAnimationFrame(function(){ strip.classList.remove('no-anim'); });
    }
  }

  var swappers = [metaTop, metaBot, elCase];
  var swapTimer = null;

  // some com o texto do item anterior, troca, e traz o novo
  function swap(){
    swappers.forEach(function(el){
      el.classList.remove('is-in');
      el.classList.add('is-out');
    });
    clearTimeout(swapTimer);
    swapTimer = setTimeout(function(){
      paintMeta();
      swappers.forEach(function(el){
        el.classList.remove('is-out');
        el.offsetHeight;
        el.classList.add('is-in');
      });
    }, 620);
  }

  function paintMeta(){
    var n = nodes[index];
    var ord = (index % COUNT) + 1;
    elOrd.textContent  = pad(ord) + '.';
    elTitle.textContent = n.dataset.title;
    elCat.textContent   = n.dataset.cat;
    elYear.textContent  = n.dataset.year;
    elCur.textContent   = pad(ord);
    elCaseT.textContent = n.dataset.title;
    elCaseP.innerHTML = n.dataset.desc;
    var logo = n.querySelector('.work__logo');
    elCaseL.innerHTML = logo ? logo.innerHTML : '';
    // com página própria, mostra o link; sem página, a tag "Em breve"
    var breve = n.dataset.soon !== undefined;
    // case sob NDA: o link continua lá, mas abre a gaveta em vez de navegar
    var restrito = n.dataset.restrito !== undefined;
    if(elCaseA){
      elCaseA.href = restrito ? '#' : (n.dataset.url || '#');
      elCaseA.hidden = breve;
      // o nome do projeto viaja no dataset; quem abre a gaveta lê daqui
      if(restrito) elCaseA.dataset.restrito = n.dataset.title;
      else delete elCaseA.dataset.restrito;
    }
    if(elCaseS) elCaseS.hidden = !breve;
  }

  function setActive(i){
    if(i < 0) i = 0;                      // a vitrine tem começo
    if(i > COUNT - 1) i = COUNT - 1;      // e tem fim
    if(i === index) return;
    nodes[index].classList.remove('is-active');
    index = i;
    nodes[index].classList.add('is-active');
    sincronizaSetas();
    swap();
    place(true);
  }

  // ---------- vitrine presa à rolagem da página ----------
  // Nada de sequestrar a roda: o trilho dá altura à seção e o quadro fica
  // parado enquanto ela passa. Assim vale rolagem nativa de qualquer origem
  // (roda, trackpad, teclado, toque, barra) e o usuário nunca fica preso.

  // quantos passos o trilho precisa ter, dado o número real de itens
  root.style.setProperty('--passos', COUNT - 1);

  // distância rolável enquanto o quadro está preso
  function alcance(){
    return Math.max(1, trilho.offsetHeight - window.innerHeight);
  }
  function topoTrilho(){
    return trilho.getBoundingClientRect().top + window.scrollY;
  }

  function indiceDaRolagem(){
    var p = (window.scrollY - topoTrilho()) / alcance();
    if(p < 0) p = 0; else if(p > 1) p = 1;
    return Math.round(p * (COUNT - 1));
  }

  // Clique, seta e teclado movem a PÁGINA até a posição do item. Se apenas
  // trocassem o índice, a próxima rolagem recalcularia e desfaria a troca.
  function irPara(i){
    if(i < 0) i = 0;
    if(i > COUNT - 1) i = COUNT - 1;
    window.scrollTo({
      top: topoTrilho() + (i / (COUNT - 1)) * alcance(),
      behavior: calmo.matches ? 'auto' : 'smooth'
    });
  }

  // sem trilho no HTML a navegação volta a ser direta, sem mexer na rolagem
  function vaiAte(i){ if(trilho) irPara(i); else setActive(i); }
  function step(dir){ vaiAte(index + dir); }

  // clique: o item vai para o centro
  nodes.forEach(function(node, i){
    node.addEventListener('click', function(){ vaiAte(i); });
  });

  // teclado
  rail.addEventListener('keydown', function(e){
    if(e.key === 'ArrowRight'){ e.preventDefault(); step(1); }
    if(e.key === 'ArrowLeft'){  e.preventDefault(); step(-1); }
  });

  chevPrev.addEventListener('click', function(){ step(-1); });
  chevNext.addEventListener('click', function(){ step(1); });

  var pedindo = false;
  if(trilho){
    window.addEventListener('scroll', function(){
      if(pedindo) return;
      pedindo = true;
      requestAnimationFrame(function(){
        setActive(indiceDaRolagem());
        pedindo = false;
      });
    }, {passive:true});
  }

  window.addEventListener('resize', function(){
    readMetrics();
    place(false);
    if(trilho) setActive(indiceDaRolagem());
  });

  elTotal.textContent = pad(COUNT);
  readMetrics();
  nodes[index].classList.add('is-active');
  sincronizaSetas();
  paintMeta();
  place(false);

  // Só agora o trilho ganha altura. Sem isto (JS desligado, ou um HTML antigo
  // sem o trilho) a seção fica no fluxo normal e a vitrine continua navegável
  // pelas setas, em vez de virar um bloco vazio travado no primeiro item.
  if(trilho){
    document.documentElement.classList.add('vitrine-presa');
    readMetrics();
    place(false);
    setActive(indiceDaRolagem());   // respeita a posição restaurada num reload
  }
})();

(function(){
  var wrap = document.querySelector('[data-axes]');
  if(!wrap) return;

  var cards = Array.prototype.slice.call(wrap.querySelectorAll('[data-axis]'));
  var open = 0;
  var timer = null;
  var pinned = false;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var INTERVALO = 9500;

  function abrir(i){
    if(i === open) return;
    cards[open].classList.remove('is-open');
    open = i;
    cards[open].classList.add('is-open');
  }

  function tocar(){
    parar();
    if(calm.matches) return;                 // sem rotação automática
    timer = setInterval(function(){
      abrir((open + 1) % cards.length);
    }, INTERVALO);
  }

  function parar(){
    if(timer){ clearInterval(timer); timer = null; }
  }

  cards.forEach(function(card, i){
    card.addEventListener('click', function(){
      abrir(i);
      pinned = true;                          // clique fixa o card
      parar();
    });
    card.addEventListener('focus', function(){ abrir(i); });
  });

  wrap.addEventListener('pointerenter', parar);
  wrap.addEventListener('pointerleave', function(){
    pinned = false;
    tocar();
  });

  // só roda quando a seção está visível
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting && !pinned) tocar();
        else parar();
      });
    }, {threshold:.25}).observe(wrap);
  } else {
    tocar();
  }
})();

(function(){
  var alvos = document.querySelectorAll('[data-reveal]');
  if(!alvos.length) return;

  // só esconde se o script rodar: sem JS, a página aparece inteira
  document.documentElement.classList.add('reveal-ready');

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  function revelar(el){
    var atraso = parseInt(el.dataset.delay || 0, 10);
    el.style.transitionDelay = atraso + 'ms';
    el.classList.add('is-visible');
    // devolve a camada de composição depois da transição
    setTimeout(function(){
      el.style.filter = 'none';
      el.style.transitionDelay = '';
    }, atraso + 1500);
  }

  if(calm.matches || !('IntersectionObserver' in window)){
    alvos.forEach(function(el){ el.classList.add('is-visible'); });
    return;
  }

  var obs = new IntersectionObserver(function(entradas){
    entradas.forEach(function(e){
      if(!e.isIntersecting) return;
      revelar(e.target);
      obs.unobserve(e.target);
    });
  }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});

  alvos.forEach(function(el){ obs.observe(el); });
})();

(function(){
  var veu       = document.querySelector('[data-scrim]');
  var contato   = document.querySelector('[data-drawer]');
  var nda       = document.querySelector('[data-drawer-nda]');
  if(!veu || (!contato && !nda)) return;

  // as duas gavetas dividem o mesmo véu: só uma pode estar aberta
  var aberta = null;
  var ultimoFoco = null;

  function focaveis(g){
    return g.querySelectorAll('a[href], button, input, textarea, select');
  }

  function abrir(gaveta, origem){
    if(!gaveta) return;
    if(aberta === gaveta) return;
    if(aberta) fecharAgora(aberta);
    ultimoFoco = origem || document.activeElement;
    aberta = gaveta;
    veu.hidden = false;
    gaveta.hidden = false;
    // um quadro para o navegador registrar o estado inicial antes de animar
    requestAnimationFrame(function(){
      veu.classList.add('is-open');
      gaveta.classList.add('is-open');
    });
    document.body.style.overflow = 'hidden';
    var lista = focaveis(gaveta);
    // pula o botão de fechar e vai para o primeiro campo ou ação
    var primeiro = lista[1] || lista[0];
    if(primeiro) setTimeout(function(){ primeiro.focus(); }, 260);
  }

  // troca de gaveta: esconde a anterior sem esperar a animação nem devolver o foco
  function fecharAgora(gaveta){
    gaveta.classList.remove('is-open');
    gaveta.hidden = true;
  }

  function fechar(){
    if(!aberta) return;
    var gaveta = aberta;
    aberta = null;
    veu.classList.remove('is-open');
    gaveta.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function(){
      veu.hidden = true;
      gaveta.hidden = true;
    }, 560);
    if(ultimoFoco) ultimoFoco.focus();
  }

  document.querySelectorAll('[data-open-drawer]').forEach(function(b){
    b.addEventListener('click', function(e){
      e.preventDefault();
      abrir(contato, b);
    });
  });

  // "Ler case completo" de um projeto sob NDA: avisa em vez de navegar.
  // O link é um só, reaproveitado pela vitrine, então um listener basta.
  var elCaseA  = document.querySelector('.case__link');
  var elProjeto = nda && nda.querySelector('[data-nda-projeto]');
  if(elCaseA && nda){
    elCaseA.addEventListener('click', function(e){
      var titulo = elCaseA.dataset.restrito;
      if(titulo === undefined) return;      // case aberto: segue para a página
      e.preventDefault();
      if(elProjeto) elProjeto.textContent = titulo;
      abrir(nda, elCaseA);
    });
  }

  document.querySelectorAll('[data-close-drawer]').forEach(function(b){
    b.addEventListener('click', fechar);
  });
  veu.addEventListener('click', fechar);

  document.addEventListener('keydown', function(e){
    if(!aberta) return;
    if(e.key === 'Escape'){ fechar(); return; }
    if(e.key !== 'Tab') return;
    // prende o foco dentro da gaveta enquanto ela estiver aberta
    var lista = focaveis(aberta);
    if(!lista.length) return;
    var primeiro = lista[0], ultimo = lista[lista.length - 1];
    if(e.shiftKey && document.activeElement === primeiro){
      e.preventDefault(); ultimo.focus();
    } else if(!e.shiftKey && document.activeElement === ultimo){
      e.preventDefault(); primeiro.focus();
    }
  });
})();
