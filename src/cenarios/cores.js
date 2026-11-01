// Cores dos cenários. Menus e HUD usam a paleta da escola (config.js); os cenários podem usar também
// os tons quentes de fim de tarde (CLAUDE.md, seção 7).

export const CONTORNO = '#2E1A33'; // o mesmo contorno escuro do Aladdin e dos tiles

// Céu de fim de tarde: lilás da escola no alto, rosa no meio, pêssego e laranja perto do horizonte.
export const CEU_TARDE = ['#8E8BEE', '#9E9EFF', '#B3A1F6', '#C6A3EC', '#DAA5DF', '#EAAAD2', '#F4B5C2', '#F8C4AE', '#FAD59C'];

export const SOL = { miolo: '#FFF6CF', borda: '#FCE59B', halo: '#FBD3A6' };

export const ITAJUBA = {
  serra: '#B596D9', // Serra da Mantiqueira, bem ao fundo
  serraLuz: '#C9AEE5',
  morro: '#9576C0', // morros mais perto, com casinhas
  morroSombra: '#8064AD',
  morroArvore: '#71579E',
  casinha: '#EADCF2',
  casinhaTelhado: '#C98AA6',
  janelaAcesa: '#F9FCBB',
  // cidade ao fundo (tons apagados, para não brigar com o primeiro plano)
  cidadeContorno: '#7A5A92',
  cidadeParedes: ['#D7A6B4', '#E2B696', '#C4A0CF', '#E9C7A3', '#D2B3D9'],
  cidadeTelhado: '#B1707F',
  // primeiro plano
  paredes: ['#F2C46B', '#F4A9BC', '#9FC8E3', '#A6DDBF', '#F3E6D2', '#C9B6F0'],
  paredeSombra: 'rgba(46,26,51,0.22)',
  friso: '#FFF7EA',
  telhado: '#B5543A',
  telhadoLuz: '#D0714D',
  telhadoSombra: '#83392A',
  janelas: ['#3E6FA8', '#3F8A63', '#8E4A86', '#A0582C'],
  vidro: '#2F2A4D',
  vidroLuz: '#6A6AC0',
  madeira: '#7E4D25',
  madeiraLuz: '#B7793F',
  ferro: '#3D2C4A',
  folhas: { roxo: ['#9A4FA0', '#C774C9', '#E9A2E4'], amarelo: ['#C99A1E', '#EDC948', '#FBEA8C'], verde: ['#3F7F38', '#6CC24A', '#9FDC7C'] },
  tronco: '#5E3A24',
  agua: ['#6E9BE0', '#9FC4F2', '#DDF0FF'],
  pedra: ['#E9D8C3', '#CDB59B', '#A38A74'],
};

export const ESPACO = {
  parede: '#EFE6F7',
  paredeSombra: '#DCD0EC',
  rodape: '#9C7BC4',
  rodapeLuz: '#B79AE0',
  espelho: ['#B9C9F4', '#D3DEFA', '#EEF3FF'],
  espelhoMoldura: '#6D6BD9',
  barra: '#C98D52',
  barraLuz: '#E6B57F',
  barraSuporte: '#8A8AA0',
  luz: '#FFF8D8',
};

export const NOITE = ['#2B1B4F', '#36225F', '#432A70', '#553382', '#6A3E93', '#8649A0', '#A657A6', '#C66BAA'];
export const LUA = { clara: '#FFF1B8', sombra: '#E8C77A' };
