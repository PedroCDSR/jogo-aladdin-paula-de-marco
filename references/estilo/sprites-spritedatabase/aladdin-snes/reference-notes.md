# Notas · sprites do Sprite Database (Aladdin do SNES)

**Fonte:** https://spritedatabase.net/game/331 — Disney's Aladdin (SNES, Capcom/Disney, 1993).
Baixados em 01/11/2026. Os arquivos são sheets de sprites/fundos já recortados e montados pelos colaboradores do
site (não é extração direta de ROM feita por nós; nenhum `.sfc`/`.smc`/`.zip` entra no repositório).

## Regras de uso (por que esta pasta existe e o que ela **não** pode virar)

- **Uso permitido:** estudo de linguagem visual — escala real dos personagens, número de quadros por animação,
  paleta, contorno, luz e densidade de detalhe. É referência de **qualidade**, nunca de design (regra 3 do CLAUDE.md:
  os personagens do jogo seguem os figurinos do espetáculo da escola).
- **Uso proibido:** copiar estes pixels para dentro do jogo, importar estes GIF/PNG para `public/`, ou derivar
  frames quadro a quadro deles. São material com direitos da Disney/Capcom; o Sprite Database os oferece apenas
  "for private or non-commercial use" (rodapé do site). Nada daqui tem licença para uso comercial.
- Se algum dia for preciso usar pixels originais, isso só acontece com compra/licença registrada em `CREDITS.md`
  (hoje não é o caso).

## Inventário (13 arquivos)

| Arquivo | Nome no site | Dimensões | Tipo | Página |
|---|---|---|---|---|
| `Aladdin.gif` | Aladdin | 418 × 736 | GIF | https://spritedatabase.net/file/7387 |
| `Abu.gif` | Abu | 353 × 227 | GIF | https://spritedatabase.net/file/7388 |
| `Jasmine.gif` | Jasmine | 151 × 367 | GIF | https://spritedatabase.net/file/7389 |
| `Carpet.gif` | Carpet | 262 × 201 | GIF | https://spritedatabase.net/file/7390 |
| `Genie.gif` | Genie | 606 × 909 | GIF | https://spritedatabase.net/file/7392 |
| `Iago.gif` | Iago | 182 × 90 | GIF | https://spritedatabase.net/file/7391 |
| `Jafar.gif` | Jafar | 476 × 461 | GIF | https://spritedatabase.net/file/7393 |
| `Jafar2.gif` | Jafar (segunda forma) | 482 × 737 | GIF | https://spritedatabase.net/file/7394 |
| `NewWorld.gif` | A Whole New World | 213 × 311 | GIF | https://spritedatabase.net/file/7395 |
| `FruitVendor.png` | Fruit Vendor | 679 × 421 | PNG | https://spritedatabase.net/file/22803 |
| `SNES_Aladdin_Lv2Enemies.png` | Inimigos da fase 2 | 287 × 377 | PNG | https://spritedatabase.net/file/15148 |
| `AladdinTown.gif` | Fundo: Agrabah | 1170 × 214 | GIF | https://spritedatabase.net/file/7396 |
| `AladdinCastle.gif` | Fundo: Palácio | 782 × 214 | GIF | https://spritedatabase.net/file/7397 |

Colaboradores no site: Silver (sprites), Son Gohan (fundos), Omega (Fruit Vendor), Cyrus Annihilator (inimigos).

## O que medir aqui (uso nas etapas de arte)

- **Escala do herói:** em `Aladdin.gif`, meça o sprite parado em pé (cabelo ao pé, sem chapéu) contra a altura de
  tela do SNES (224 px). Confere/faixa a leitura da Etapa 8.0 (≈ 24–25% → nosso alvo de 21–22% em 480×270).
- **Quadros por animação:** o sheet mostra idle, corrida, pulo, queda, pendurar, agachar, dano etc. — contar os
  frames de cada ciclo para calibrar as animações de `src/art/jogador.js` e das Etapas 8A/8B.
- **Paleta e contorno:** amostrar as cores dos materiais (pele, túnica, calça, pano do tapete, metal) para conferir
  as rampas de 4 tons + contorno colorido descritas em `../../reference-notes.md`.
- **Fundos (`AladdinTown`, `AladdinCastle`):** camadas, ritmo de detalhe e cores de arenito/terracota — comparação
  com as cenas de rua e arena do chefe.
- **Chefes e elenco:** `Jafar`, `Jafar2`, `Genie`, `Jasmine`, `Abu`, `Iago` servem de padrão de volume e quantidade
  de frames para os personagens equivalentes do nosso jogo (nunca como modelo de roupa/rosto).

## Validação

Ao usar um sheet destes na validação de uma arte, anotar no `visual-reference-index.md` o arquivo e a medição feita
(ex.: "corrida: 8 frames no sheet → mantido"). A prancha comparativa continua sendo "referência × nossa" em
`ferramentas/arte/previas/`.
