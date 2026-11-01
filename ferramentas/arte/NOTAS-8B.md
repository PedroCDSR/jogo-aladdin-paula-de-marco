# Notas da Etapa 8B (cenários)

Branch: `etapa-8b-cenarios`, criada a partir do `origin/dev` de 01/11/2026 (que só tinha até a Etapa 2).
Ainda **não** foi juntada com o `dev` atual (Etapas 3, 6, 9...), não tem PR e não teve merge.

## Feito

Toda a arte é original e desenhada em código (canvas ou matriz de texto). Não usa nenhum arquivo de imagem, então não pesa no site.

- `src/cenarios/pincel.js`: ferramentas de pixel art (sorteio com semente fixa, retângulos, círculos, degradê em faixas, silhuetas que se repetem sem emenda, texto).
- `src/cenarios/cores.js`: cores dos cenários.
- `src/cenarios/itajuba.js` (Fase 1): céu de entardecer com sol e 3 camadas de parallax (serra 0,1, morros com casinhas 0,25, cidade 0,5). No primeiro plano: casas coloniais (térreas e sobrados, 6 cores), ipês roxo e amarelo, postes, bancos, barracas montadas sozinhas debaixo de cada sequência de `T`, fonte com água animada (`F`) e fachada do Espaço Paula De Marco na saída (`E`). Use `montarItajuba(scene, linhas, mapa)` e chame `.atualizar(cam)` a cada quadro.
- `src/cenarios/espaco.js` (Fase 2): parede do estúdio que se repete a cada 384 px, com espelhos, 2 barras, janela, mural com o cartaz do ALADDIN, luminárias, caixa de som e banco. Use `montarEspaco(scene, mapa, linhaPiso)`.
- `src/cenarios/chefe.js` (Fase 3): terraço à noite com lua, estrelas, Itajubá iluminada, colunas, arcos, estandartes e gaiola dourada (`chefe_gaiola`, quadro 0 fechada e 1 aberta). Use `montarChefe(scene)`.
- `src/cenarios/tapete.js` (Fase 4): céu do voo e 4 camadas (nuvens, serra, cidade com rio e ponte, telhados), mais a fachada do Teatro do Colégio G9 (`tap_teatro`). Use `montarTapete(scene)` e chame `.atualizar(pixelsVoados)`.
- `src/cenarios/palco.js` (Final): fundo com painel estrelado e os quadrados do logo, piso em perspectiva, ribalta, bambinela, cortinas de veludo rosa e roxo e canhão de luz. Use `montarPalco(scene).abrir(ms)`.
- `src/ui/estilo.js`: painel lilás com miolo claro e os quadrados do logo nos cantos, botões rosa, amarelo, verde e lilás (afundam ao tocar), título e pílula do HUD.
- `src/art/icones.js`: ícones 12×12 do HUD (coração, coração vazio, maçã, sapatilha, ingresso, pausa). O `Preload` cria a textura `icones`.
- Tiles por fase em `ferramentas/arte/gerar_tiles.py`, que gera `src/art/tiles.js`: `TILESETS.itajuba`, `.espaco` (piso de madeira, banco, colchonete) e `.chefe` (ladrilho roxo com dourado). O `Preload` cria `tiles`, `tiles_espaco` e `tiles_chefe`.
- `src/scenes/Galeria.js`: prévia aberta com `?cenario=itajuba|espaco|chefe|tapete|final|ui`. Tocar passa para o próximo. Mapas da prévia em `src/levels/previas.js` (a `ARENA`, de 30×17, pode servir para a Fase 3).
- `Teste.js` usa o cenário de Itajubá e o painel e botão novos. Textos novos em `TEXTOS.cenarios` e `TEXTOS.galeria`.
- Testado no Chromium (Playwright): build sem erros e console sem erros, só avisos do driver de vídeo no modo headless. `dist/` = 1,5 MB.

## Falta

1. Juntar o `origin/dev` atual. Conflitos prováveis: `Preload.js` (criação de tiles e cena inicial), `main.js` (lista de cenas), `textos.js`, `tiles.js`/`gerar_tiles.py` (se outra etapa mexeu nos tiles) e `Teste.js` (a Etapa 3 o removeu). Plugar `montarItajuba`, `montarEspaco`, `montarChefe`, `montarTapete` e `montarPalco` nas cenas reais (`Itajuba`, `Espaco`, `Chefe`, `Tapete`, `Final`) e trocar menus e HUD por `ui/estilo.js`.
2. Fazer as capturas de novo depois de juntar, abrir o PR contra o `dev` com o checklist e atualizar Status e "Próximo passo" no CLAUDE.md.
3. Redesenhar a fonte, a igreja e a fachada do Teatro G9 quando chegarem as fotos (`references/lugares/` está vazia; hoje os desenhos são genéricos).

## Arquivos desta etapa

`src/cenarios/*`, `src/ui/estilo.js`, `src/art/icones.js`, `src/scenes/Galeria.js`, `src/levels/previas.js`,
`ferramentas/arte/gerar_tiles.py` (e o `src/art/tiles.js` gerado por ele), além de mudanças pequenas em `Preload.js`, `main.js`,
`Teste.js`, `art/index.js` e `data/textos.js`.
