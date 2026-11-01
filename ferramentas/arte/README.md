# Geradores de arte

Scripts que **montam** as matrizes de `src/art/` a partir de partes (cabeça, túnica, braços, pernas) e poses.
O jogo usa só as matrizes; os scripts servem para redesenhar rápido (por exemplo, quando chegarem as fotos dos
figurinos). Também dá para editar as matrizes à mão, sem rodar nada.

Precisa de Python 3. O Pillow é opcional: serve só para gerar a imagem de prévia.

```bash
python3 ferramentas/arte/gerar_jogador.py . /tmp
```

```bash
python3 ferramentas/arte/gerar_tiles.py . /tmp
```

```bash
python3 ferramentas/arte/gerar_tapete.py . /tmp
```

```bash
python3 ferramentas/arte/gerar_objetos.py . /tmp
```

```bash
python3 ferramentas/arte/gerar_personagens.py . ferramentas/arte/previas
```

`gerar_personagens.py` (Etapa 8A) escreve um arquivo por personagem em `src/art/` (capivara, jafar, claudia, paula,
jasmine, genio, abu, sultao, bailarina, tapeteMagico), cada um com `PALETA`, `QUADROS` e `ANIMACOES`. O `Preload` cria
a textura `<nome>` e as animações `<nome>-<animação>` sozinho: para um personagem novo, basta gerar o arquivo e
registrar em `PERSONAGENS` (`src/art/index.js`). Com o Pillow, também salva `previas/folha-personagens.png`.
`pixel.py` tem as peças comuns (quadro, formas, contorno, saída em JS e prévia).

**Tia Paula:** a aparência ainda não foi definida. Para trocar, mude só o bloco `APARENCIA_PAULA` no
`gerar_personagens.py` (pele, estilo e cor do cabelo, cor do vestido, detalhe, óculos) e rode o gerador.

**Vitrine:** abra o jogo com `?galeria` no endereço para ver todas as animações em tamanho 2x.

O mapa da Fase 1 tem o seu próprio gerador:

```bash
python3 ferramentas/mapas/gerar_itajuba.py > src/levels/itajuba.js
```

Rodar um gerador **sobrescreve** a matriz correspondente em `src/art/`: edições feitas à mão nela se perdem.
