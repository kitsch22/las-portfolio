# Contexto para o Claude Code

Portfólio pessoal de Leonardo Alves da Silva (assina "Leonardo Silva", monograma LAS),
designer de produto e serviço. Site estático de duas páginas, sem framework,
sem build, sem dependências.

## Linguagem visual

Suíço/editorial, preto e branco, ortogonal. Referências: o pôster do Yohji Yamamoto,
um layout dos Mavericks e um cartaz "about me" tipográfico.

- **Tipografia**: Inter (Google Fonts), pesos 300/400/500/700 + itálico 400.
  Títulos grandes com `letter-spacing` negativo (-0.03 a -0.05em).
- **Sem cantos arredondados.** A única exceção é o botão circular de seta no hero.
  Botões, cards, imagens e a gaveta são todos retos — isso é deliberado.
- **Tokens** no `:root` de cada CSS: `--ink`, `--paper`, `--mute`, `--hair`,
  `--slot`, `--pad`, `--gutter`, `--frame`, `--ease`, `--dur`.
- **Grade**: 12 colunas, largura máxima 1440px.
- **Cor** aparece só em dois lugares: o verde das ilustrações do manifesto e os
  logos das marcas no hover.

## Convenções

- Comentários e nomes de variáveis em português.
- Classes em BEM solto (`.axis__panel`, `.brand--wide`).
- Animações sempre com `transform`/`opacity`, nunca `width`/`top`.
- Todo movimento respeita `prefers-reduced-motion`.
- As entradas ao rolar só escondem o conteúdo depois que o JS roda
  (classe `reveal-ready` no `<html>`): sem JS, a página aparece inteira.

## Armadilhas já encontradas

- **Colisão de nomes de classe entre seções.** `.meta` do hero atropelou `.meta`
  da vitrine e quebrou o layout. Prefixe por seção.
- **Especificidade.** `.hero > *:not(img)` anulava `position` de filhos novos.
- **Variáveis CSS em escopo errado.** `--ease` estava dentro de `.showcase`,
  então `var(--ease)` em outra seção era inválido e o navegador descartava a
  propriedade inteira. Tokens ficam no `:root`.
- **`opacity` em regra posterior** sobrescreve o estado escondido de um card.
  Use cor com alpha quando quiser só suavizar.

## Tarefas boas para começar

1. Extrair `assets/css/base.css` e `assets/js/base.js` com o que está duplicado
   entre as duas páginas (barra do topo, rodapé, gaveta, entradas ao rolar).
2. Trocar as imagens por `<picture>` com WebP e `loading="lazy"`.
3. Adicionar meta tags, Open Graph e favicon.
