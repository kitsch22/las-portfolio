/* ============================================================
   Transição entre páginas

   Como o site é estático e sem framework, trocar de página é um
   carregamento de documento de verdade: o header não "permanece"
   tecnicamente. A ilusão se sustenta porque a tela em branco cobre
   exatamente a área abaixo do header nas duas pontas, e o header é
   idêntico nas duas páginas — a troca acontece atrás da tela.

   Saída  (página que você deixa): sobe a tela, mede o HTML de
          destino, guarda início + duração na sessão e navega.
   Chegada (página que abre): o script inline do <head> já subiu a
          tela antes do primeiro quadro; aqui só seguramos o tempo
          que falta e revelamos.

   A duração é o tamanho do HTML de destino mapeado em 2s–4s.
   Mede-se o documento, não as imagens: é o que dá para saber antes
   de navegar, e é o que faz a página pesada esperar mais.
   ============================================================ */
(function(){
  'use strict';

  var CHAVE        = 'transicao';
  var MIN_MS       = 2000;
  var MAX_MS       = 4000;
  var CHARS_MIN    = 24000;   // ~ o tamanho da home
  var CHARS_MAX    = 70000;   // ~ o tamanho do sobre
  var PADRAO_MS    = 2600;    // quando não deu para medir
  var FADE_ENTRADA = 220;     // precisa bater com --transicao-entrada
  var FADE_SAIDA   = 420;     // precisa bater com --transicao-saida
  var TETO_EXTRA   = 2500;    // nunca segurar além disso depois do previsto
  var RITMO        = 420;     // um ponto a cada 420ms

  var calma = window.matchMedia('(prefers-reduced-motion: reduce)');
  var raiz  = document.documentElement;
  var tela  = document.querySelector('[data-transicao]');
  if(!tela) return;

  var texto   = tela.querySelector('[data-transicao-texto]');
  var relogio = null;
  var saindo  = false;

  /* ---------- as reticências digitando ---------- */
  function digitar(){
    var n = 0;
    parar();
    texto.textContent = '';
    relogio = setInterval(function(){
      n = (n + 1) % 4;                          // 0, 1, 2, 3 pontos
      texto.textContent = new Array(n + 1).join('.');
    }, RITMO);
  }
  function parar(){
    if(relogio){ clearInterval(relogio); relogio = null; }
  }

  /* ---------- duração a partir do peso do destino ---------- */
  function duracaoPara(tamanho){
    if(!tamanho) return PADRAO_MS;
    var t = (tamanho - CHARS_MIN) / (CHARS_MAX - CHARS_MIN);
    if(t < 0) t = 0;
    if(t > 1) t = 1;
    return Math.round(MIN_MS + t * (MAX_MS - MIN_MS));
  }

  /* Lê o corpo em vez do content-length: com gzip o cabeçalho traz o
     tamanho comprimido, e aí as duas páginas cairiam no mesmo balde.
     De quebra, o fetch aquece o cache e a navegação sai instantânea. */
  function medir(url){
    if(!window.fetch) return Promise.resolve(0);
    return fetch(url, { credentials:'same-origin' })
      .then(function(r){ return r.ok ? r.text() : ''; })
      .then(function(html){ return html.length; })
      .catch(function(){ return 0; });
  }

  /* ---------- que links entram na transição ---------- */
  function destinoInterno(a){
    if(a.hasAttribute('download')) return null;
    if(a.target && a.target !== '_self') return null;
    var u;
    try { u = new URL(a.getAttribute('href'), location.href); }
    catch(err){ return null; }
    if(u.origin !== location.origin) return null;
    if(u.pathname === location.pathname) return null;   // âncora na mesma página
    return u;
  }

  /* ---------- saída ---------- */
  function sair(href){
    saindo = true;

    var barra = document.querySelector('[data-topbar]');
    var alturaBarra = 0;
    if(barra){
      barra.classList.remove('is-hidden');   // o header precisa ficar
      alturaBarra = barra.offsetHeight;
    }

    var inicio = Date.now();
    raiz.classList.add('transicao-ativa');
    digitar();

    // dois quadros: um para o display:block valer, outro para o fade sair de opacity:0
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ tela.classList.add('is-visivel'); });
    });

    medir(href).then(function(tamanho){
      var duracao = duracaoPara(tamanho);
      try{
        sessionStorage.setItem(CHAVE, JSON.stringify({
          inicio: inicio, duracao: duracao, topbar: alturaBarra
        }));
      }catch(err){ /* janela privada: segue sem continuidade entre as páginas */ }

      // só navega depois que o fade de entrada fechou, senão a tela
      // da página nova aparece opaca no meio do fade e dá um salto
      var espera = Math.max(0, FADE_ENTRADA + 60 - (Date.now() - inicio));
      setTimeout(function(){ location.href = href; }, espera);
    });
  }

  document.addEventListener('click', function(e){
    if(calma.matches || saindo) return;
    if(e.defaultPrevented) return;
    if(e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if(!e.target || !e.target.closest) return;

    var a = e.target.closest('a[href]');
    if(!a) return;

    var destino = destinoInterno(a);
    if(!destino) return;

    e.preventDefault();
    sair(destino.href);
  });

  /* ---------- chegada ---------- */
  var dados = window.__transicao;
  if(raiz.classList.contains('transicao-ativa') && dados){
    delete window.__transicao;

    digitar();

    var alvo     = dados.inicio + dados.duracao;   // instante mínimo para revelar
    var teto     = alvo + TETO_EXTRA;              // nunca prender além disso
    var carregou = document.readyState === 'complete';
    var revelado = false;

    var revelar = function(){
      if(revelado) return;
      revelado = true;
      parar();
      tela.classList.add('is-saindo');
      setTimeout(function(){
        raiz.classList.remove('transicao-ativa', 'transicao-imediata');
        tela.classList.remove('is-saindo', 'is-visivel');
      }, FADE_SAIDA + 40);
    };

    var tentar = function(){
      if(revelado || !carregou) return;
      if(Date.now() < alvo) return;   // ainda no tempo mínimo; o outro timer chama de novo
      revelar();
    };

    if(!carregou){
      window.addEventListener('load', function(){ carregou = true; tentar(); });
    }
    setTimeout(tentar, Math.max(0, alvo - Date.now()) + 20);
    setTimeout(function(){ carregou = true; tentar(); }, Math.max(0, teto - Date.now()));

    // volta pelo histórico com a página restaurada do cache: derruba a tela
    window.addEventListener('pageshow', function(ev){
      if(ev.persisted) revelar();
    });
  }
})();
