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
  var secoes = document.querySelectorAll('.obra');
  if(!secoes.length) return;

  // só esconde se o script rodar: sem JS, as seções aparecem inteiras
  document.documentElement.classList.add('empurra-pronto');

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  if(calm.matches || !('IntersectionObserver' in window)){
    secoes.forEach(function(s){ s.classList.add('is-dentro'); });
    return;
  }

  // a seção é mais alta que a janela, então o gatilho é uma fatia pequena:
  // 15% já significa que a borda de cima entrou bem no campo de visão
  var obs = new IntersectionObserver(function(entradas){
    entradas.forEach(function(e){
      if(!e.isIntersecting) return;
      e.target.classList.add('is-dentro');
      obs.unobserve(e.target);              // entra uma vez, como o resto do site
    });
  }, {threshold:.15, rootMargin:'0px 0px -12% 0px'});

  secoes.forEach(function(s){ obs.observe(s); });
})();

(function(){
  var veu     = document.querySelector('[data-scrim]');
  var contato = document.querySelector('[data-drawer]');
  var nda     = document.querySelector('[data-drawer-nda]');
  if(!veu || (!contato && !nda)) return;

  // as duas gavetas dividem o mesmo véu: só uma pode estar aberta
  var aberta = null;
  var ultimoFoco = null;

  function focaveis(g){
    return g.querySelectorAll('a[href], button, input, textarea, select');
  }

  function abrir(gaveta, origem){
    if(!gaveta || aberta === gaveta) return;
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

  // Cases sob NDA: aqui cada seção tem o seu botão, então o gatilho é
  // delegado e o nome do projeto vem do próprio atributo.
  var elProjeto = nda && nda.querySelector('[data-nda-projeto]');
  if(nda){
    document.addEventListener('click', function(e){
      var gatilho = e.target.closest('[data-restrito]');
      if(!gatilho) return;
      e.preventDefault();
      if(elProjeto) elProjeto.textContent = gatilho.dataset.restrito;
      abrir(nda, gatilho);
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
