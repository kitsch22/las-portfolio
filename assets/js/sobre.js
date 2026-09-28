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
  var secao = document.querySelector('[data-quote]');
  if(!secao) return;

  // cada "design" significa uma coisa diferente na frase
  var partes = [
    {t:'design', n:1},
    {t:' is to '},
    {t:'design', n:2},
    {t:' a '},
    {t:'design', n:3},
    {t:' to\u00A0produce a '},
    {t:'design', n:4}
  ];
  var plano = partes.map(function(p){ return p.t; }).join('');
  var total = plano.length;

  function montar(n){
    var html = '', usado = 0;
    for(var i = 0; i < partes.length; i++){
      var p = partes[i], resta = n - usado;
      if(resta <= 0) break;
      var texto = p.t.slice(0, resta);
      if(p.n){
        html += '<i>' + texto + '</i>';
        if(texto.length === p.t.length) html += '<sup>' + p.n + '</sup>';
      } else {
        html += texto;
      }
      usado += texto.length;
    }
    return html;
  }

  var fantasma = secao.querySelector('[data-ghost]');
  var destino  = secao.querySelector('[data-typed]');
  fantasma.innerHTML = montar(total);   // reserva o espaço exato

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  function digitar(){
    if(calm.matches){
      destino.innerHTML = montar(total);
      secao.classList.add('is-done');
      return;
    }
    var i = 0;
    (function passo(){
      destino.innerHTML = montar(++i);
      if(i < total){
        var pausa = /[ \u00A0]/.test(plano[i - 1]) ? 150 : 52;
        setTimeout(passo, pausa);
      } else {
        setTimeout(function(){ secao.classList.add('is-done'); }, 420);
      }
    })();
  }

  if(!('IntersectionObserver' in window)){ digitar(); return; }

  var obs = new IntersectionObserver(function(entradas){
    entradas.forEach(function(e){
      if(!e.isIntersecting) return;
      obs.unobserve(e.target);
      digitar();
    });
  }, {threshold:.4});

  obs.observe(secao);
})();

(function(){
  var secao = document.querySelector('[data-says]');
  if(!secao) return;

  // substituir pelos depoimentos reais
  var lista = [
    {
      texto:[
        'Falar do Léo é fácil mas também é difícil. Fácil por ser um cara incrível, talento puro, coração bom, e uma pessoa extremamente agradável de se conviver. E difícil, pois vão faltar palavras para descrever seu talento e alcance na empresa e nos times que atua. Ter o Léo na jornada é certeza de um cara que vai subir a régua, cuidar do Cliente e dos Colaboradores.'
      ],
      nome:'Dario Gargaglioni',
      cargo:'CEO na AP Digital Services, consultoria onde trabalhei por bons anos'
    },
    {
      texto:[
        'Leonardo é um profissional diferenciado. Possui excelente comunicação, posicionamento estratégico e encontra de forma ágil novas soluções. Super antenado às tendências de mercado, contribui muito com insights valiosos.'
      ],
      nome:'Mariana Santos',
      cargo:'Business Partner, trabalhamos juntos em equipes diferentes'
    },
    {
      texto:[
        'Trabalhar com o Leo foi uma experiência muito enriquecedora. Desde o início, ele sempre esteve disponível para ajudar, trazendo feedbacks valiosos que contribuíram muito para o meu desenvolvimento e para a evolução do time. Sua capacidade de explicar assuntos técnicos com clareza fazia toda a diferença no dia a dia, garantindo que todos estivessem alinhados e pudessem contribuir da melhor forma possível. Além disso, sua empatia tornava o ambiente muito mais colaborativo e motivador.'
      ],
      nome:'Ana Neves',
      cargo:'Senior Product Designer, atendemos juntos a Raízen'
    },
    {
      texto:[
        'Existem pessoas que entram na sua vida apenas para serem mais uma. Existem outras que entram para fazer a diferença. Tive o grande prazer de ter o Leonardo como líder técnico de UX e ele foi um verdadeiro divisor de águas na minha carreira. Sempre com uma escuta ativa e comentários pertinentes, o Leonardo consegue entender todo o cenário dos desafios que enfrentamos e nos direciona para as melhores soluções. Além disso, ele é o tipo de líder que se preocupa com sua entrega, mas também, e principalmente, com seu bem-estar.'
      ],
      nome:'Luiz Barcelos',
      cargo:'Senior Content Designer, atendemos juntos a Yara Fertilizantes'
    },
    {
      texto:[
        'Um profissional de design talentoso e apaixonado que tive o privilégio de conhecer no Shell Box e, posteriormente, de trocar experiências quando ambos trabalhamos como líderes de Design. Leozinho combina expertise técnica, criatividade e visão estratégica de forma bem amarrada. Sua liderança inspiradora, comunicação clara e &ldquo;papo bom&rdquo; motivam equipes a alcançar resultados excepcionais. Leozinho é uma referência na área, sempre atualizado e disposto a compartilhar conhecimento, tornando-o um ativo inestimável para qualquer organização que busque excelência em design.'
      ],
      nome:'Seymour Ícaro',
      cargo:'Product Designer Especialista, atuamos juntos no produto ShellBox'
    }
  ];

  var texto = secao.querySelector('[data-quote-text]');
  var nome  = secao.querySelector('[data-quote-name]');
  var cargo = secao.querySelector('[data-quote-role]');
  var barra = secao.querySelector('[data-progress]');
  var atual = 0, trocando = false;

  barra.style.width = (100 / lista.length) + '%';

  function marcar(){
    barra.style.transform = 'translateX(' + (atual * 100) + '%)';
  }

  function pintar(i){
    var d = lista[i];
    texto.innerHTML = d.texto.map(function(par){ return '<p>' + par + '</p>'; }).join('');
    nome.textContent  = d.nome;
    cargo.textContent = d.cargo;
  }

  function ir(passo){
    if(trocando) return;
    trocando = true;
    secao.classList.add('is-out');
    setTimeout(function(){
      atual = (atual + passo + lista.length) % lista.length;
      pintar(atual);
      marcar();
      secao.classList.remove('is-out');
      trocando = false;
    }, 280);
  }

  secao.querySelector('[data-prev]').addEventListener('click', function(){ ir(-1); });
  secao.querySelector('[data-next]').addEventListener('click', function(){ ir(1); });

  pintar(0);
  marcar();
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
