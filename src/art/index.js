// Registro da arte do jogo.
//
// PNGs finais: quando um PNG com os MESMOS tamanhos de quadro for colocado em public/assets/sprites/<nome>.png,
// adicione o nome em SPRITES_PNG (ex.: jogador: { largura: 32, altura: 48 }). O Preload carrega o PNG e
// ignora a matriz. A lista evita pedir arquivos que não existem (cada pedido gasta banda no Netlify).
export const SPRITES_PNG = {
  // jogador: { largura: 32, altura: 48 },
  // capivara: { largura: 32, altura: 48 },
};

import * as capivara from './capivara.js';
import * as jafar from './jafar.js';
import * as claudia from './claudia.js';
import * as paula from './paula.js';
import * as jasmine from './jasmine.js';
import * as genio from './genio.js';
import * as abu from './abu.js';
import * as sultao from './sultao.js';
import * as bailarina from './bailarina.js';
import * as tapete from './tapete.js';

export * as ArteJogador from './jogador.js';
export * as ArteTiles from './tiles.js';

// Personagens gerados por ferramentas/arte/gerar_personagens.py. A chave vira o nome da textura, e cada
// animação vira '<nome>-<animação>' (ex.: 'capivara-andando', 'jafar-vulneravel', 'paula-presa').
export const PERSONAGENS = { capivara, jafar, claudia, paula, jasmine, genio, abu, sultao, bailarina, tapete };
