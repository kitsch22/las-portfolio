# Portfólio — Leonardo Silva

Site estático, sem build. Abra `index.html` no navegador e já funciona.

## Estrutura

```
.
├── index.html          # home: hero, vitrine de trabalhos, manifesto, rodapé
├── trabalhos.html      # trabalhos: um case por seção, foto de fundo e fade escuro à esquerda
├── sobre.html          # sobre: retrato, "sobre mim", marcas, citação, repertório, depoimentos
├── case-shellbox.html  # case aberto do ShellBox Empresas
├── assets/
│   ├── css/home.css       # estilos da home
│   ├── css/trabalhos.css  # estilos da página de trabalhos
│   ├── css/sobre.css      # estilos do sobre
│   ├── css/case.css       # estilos das páginas de case
│   ├── js/home.js         # vitrine, sanfona, barra do topo, entradas, gavetas
│   ├── js/trabalhos.js    # barra do topo, entradas, gavetas (contato e NDA)
│   ├── js/sobre.js        # depoimentos, citação digitada, barra do topo, entradas, gaveta
│   └── img/               # fotos, ilustrações e logos
└── vercel.json         # URLs limpas (/sobre em vez de /sobre.html)
```

## Rodar localmente

Qualquer servidor estático serve. Sem servidor, as fontes do Google e os
`fetch` funcionam, mas é melhor usar um:

```bash
npx serve .
# ou
python3 -m http.server 8000
```

## Publicar na Vercel

```bash
npm i -g vercel
vercel          # primeira vez: cria o projeto
vercel --prod   # publica
```

Ou conecte o repositório no painel da Vercel. Não há build step:
framework preset **Other**, output directory **.** (raiz).

## Pendências conhecidas

- [ ] `home.css`, `trabalhos.css`, `sobre.css` e `case.css` repetem o mesmo bloco
      de tokens, barra do topo, rodapé e gaveta de contato. Já são quatro cópias:
      extrair para `assets/css/base.css` virou a dívida mais cara do projeto.
- [ ] Mesma coisa no JS: barra do topo, entradas ao rolar e gaveta estão
      duplicadas nos quatro arquivos.
- [ ] **O formulário de contato não funciona.** Ele posta para
      `https://formspree.io/f/SEU_ID`, que não existe: quem preenche não chega
      a lugar nenhum. Criar a conta no Formspree (ou similar) e trocar o
      `action` nas quatro páginas. Enquanto isso, o caminho de contato que
      funciona é o e-mail e o LinkedIn da gaveta de NDA.
- [ ] O Simplex Marketplace não tem logo; a seção dele usa só o título.
- [ ] O link "política de privacidade" na gaveta aponta para `#`.
- [ ] Os fundos da página de trabalhos (`fundo-*.avif/webp/jpg`) saem dos
      originais em paisagem de 1264x848, que é o teto disponível. Em telas 4K
      ainda ampliam ~3x. Com os originais do banco de imagens em resolução
      máxima, regerar.
- [ ] O logo da Raízen é um PNG embutido dentro de um SVG. Se houver a versão
      vetorial de verdade, vale trocar.
- [ ] Sem `<meta description>`, Open Graph ou favicon.
