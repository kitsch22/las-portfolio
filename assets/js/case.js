/* Página de case: barra do topo, entradas ao rolar e gaveta de contato.
   Os três blocos são os mesmos de home.js e sobre.js — a extração de um
   base.js comum continua pendente (ver README). */

(function(){
  var bar = document.querySelector('[data-topbar]');
  if(bar){
    function medir(){
      document.documentElement.style.setProperty('--topbar-h', bar.offsetHeight + 'px');
    }
    var ultimo = window.scrollY, agendado = false;
    function atualizar(){
      var y = window.scrollY;
      if(y <= 8) bar.classList.remove('is-hidden');
      else if(y > ultimo + 5) bar.classList.add('is-hidden');
      else if(y < ultimo - 5) bar.classList.remove('is-hidden');
      ultimo = y;
      agendado = false;
    }
    window.addEventListener('scroll', function(){
      if(!agendado){ requestAnimationFrame(atualizar); agendado = true; }
    }, {passive:true});
    window.addEventListener('resize', medir);
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
    medir();
  }

  var alvos = document.querySelectorAll('[data-reveal]');
  if(!alvos.length) return;
  document.documentElement.classList.add('reveal-ready');

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(calm.matches || !('IntersectionObserver' in window)){
    alvos.forEach(function(el){ el.classList.add('is-visible'); });
    return;
  }

  var obs = new IntersectionObserver(function(entradas){
    entradas.forEach(function(e){
      if(!e.isIntersecting) return;
      var el = e.target;
      var atraso = parseInt(el.dataset.delay || 0, 10);
      el.style.transitionDelay = atraso + 'ms';
      el.classList.add('is-visible');
      setTimeout(function(){
        el.style.filter = 'none';
        el.style.transitionDelay = '';
      }, atraso + 1500);
      obs.unobserve(el);
    });
  }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});

  alvos.forEach(function(el){ obs.observe(el); });
})();

(function(){
  var gaveta = document.querySelector('[data-drawer]');
  var veu    = document.querySelector('[data-scrim]');
  if(!gaveta || !veu) return;

  var gatilhos = document.querySelectorAll('[data-open-drawer]');
  var ultimoFoco = null;

  function focaveis(){
    return gaveta.querySelectorAll('a[href], button, input, textarea, select');
  }

  function abrir(origem){
    ultimoFoco = origem || document.activeElement;
    veu.hidden = false;
    gaveta.hidden = false;
    // um quadro para o navegador registrar o estado inicial antes de animar
    requestAnimationFrame(function(){
      veu.classList.add('is-open');
      gaveta.classList.add('is-open');
    });
    document.body.style.overflow = 'hidden';
    var primeiro = focaveis()[1] || focaveis()[0];
    if(primeiro) setTimeout(function(){ primeiro.focus(); }, 260);
  }

  function fechar(){
    veu.classList.remove('is-open');
    gaveta.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function(){
      veu.hidden = true;
      gaveta.hidden = true;
    }, 560);
    if(ultimoFoco) ultimoFoco.focus();
  }

  gatilhos.forEach(function(b){
    b.addEventListener('click', function(e){
      e.preventDefault();
      abrir(b);
    });
  });

  document.querySelectorAll('[data-close-drawer]').forEach(function(b){
    b.addEventListener('click', fechar);
  });
  veu.addEventListener('click', fechar);

  document.addEventListener('keydown', function(e){
    if(gaveta.hidden) return;
    if(e.key === 'Escape'){ fechar(); return; }
    if(e.key !== 'Tab') return;
    // prende o foco dentro da gaveta enquanto ela estiver aberta
    var lista = focaveis();
    if(!lista.length) return;
    var primeiro = lista[0], ultimo = lista[lista.length - 1];
    if(e.shiftKey && document.activeElement === primeiro){
      e.preventDefault(); ultimo.focus();
    } else if(!e.shiftKey && document.activeElement === ultimo){
      e.preventDefault(); primeiro.focus();
    }
  });
})();
