// Ícones do HUD, 12x12, em matriz de texto (CLAUDE.md, seção 7). Mesmo contorno escuro do Aladdin.
// Pode editar à mão: cada caractere é uma cor da PALETA ('.' = transparente).

export const PALETA = {
  k: '#2E1A33',
  r: '#FF5A7A', // coração
  R: '#C73A5E',
  w: '#FFFFFF',
  m: '#E0453A', // maçã
  M: '#A8302A',
  g: '#6CC24A',
  G: '#47913A',
  b: '#7A4A2A',
  p: '#FFB0FA', // sapatilha (rosa da escola)
  P: '#D57FCF',
  y: '#F9FCBB', // ingresso (amarelo da escola)
  Y: '#D9D59A',
  l: '#9E9EFF',
  L: '#6D6BD9',
  v: '#B9A9D9', // coração vazio
};

export const TAMANHO = 12;

export const ORDEM = ['coracao', 'coracaoVazio', 'maca', 'sapatilha', 'ingresso', 'pausa'];

export const ICONES = {
  coracao: [
    '............',
    '.kkk...kkk..',
    'krrrk.krrrk.',
    'krwrrkrrrrk.',
    'krwrrrrrrrk.',
    'krrrrrrrrRk.',
    '.krrrrrrRk..',
    '..krrrrRk...',
    '...krrRk....',
    '....kRk.....',
    '.....k......',
    '............',
  ],
  coracaoVazio: [
    '............',
    '.kkk...kkk..',
    'kvvvk.kvvvk.',
    'kv..vkv...k.',
    'kv........k.',
    'kv........k.',
    '.kv......k..',
    '..kv....k...',
    '...kv..k....',
    '....kvk.....',
    '.....k......',
    '............',
  ],
  maca: [
    '.....b.gg...',
    '.....bgGg...',
    '..kkkbkkk...',
    '.kmmmmmmmk..',
    'kmwmmmmmmMk.',
    'kmwmmmmmmMk.',
    'kmmmmmmmmMk.',
    'kmmmmmmmMMk.',
    '.kmmmmmMMk..',
    '.kMmMMMMMk..',
    '..kkk.kkk...',
    '............',
  ],
  sapatilha: [
    '............',
    '..k......k..',
    '...k....k...',
    '....k..k....',
    '..kkkkkkkk..',
    '.kppkkkkppk.',
    'kpwpppppppPk',
    'kpppppppppPk',
    'kPpppppppPPk',
    '.kPPPPPPPPk.',
    '..kkkkkkkk..',
    '............',
  ],
  ingresso: [
    '............',
    'kkkkkkkkkkkk',
    'kyyyykyyyyyk',
    'kyLLykyyyyyk',
    '.yLLyky.L.y.',
    'kyyyykyLLLyk',
    'kyyyyky.L.yk',
    '.yyyyky...y.',
    'kYYYYkYYYYYk',
    'kkkkkkkkkkkk',
    '............',
    '............',
  ],
  pausa: [
    '............',
    '..kkk..kkk..',
    '..kwk..kwk..',
    '..kwk..kwk..',
    '..kwk..kwk..',
    '..kwk..kwk..',
    '..kwk..kwk..',
    '..kwk..kwk..',
    '..kwk..kwk..',
    '..kkk..kkk..',
    '............',
    '............',
  ],
};
