import * as Phaser from 'phaser';
import { TILE } from '../config.js';
import { SPRITES_PNG, ArteJogador, ArteTiles, ArteIcones } from '../art/index.js';
import { texturaDeQuadros } from '../art/matriz.js';

// Prepara texturas e animações antes do jogo começar.
export class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    for (const [nome, q] of Object.entries(SPRITES_PNG)) {
      this.load.spritesheet(nome, `assets/sprites/${nome}.png`, { frameWidth: q.largura, frameHeight: q.altura });
    }
  }

  create() {
    // Jogador: matriz -> textura (só se não veio PNG)
    const J = ArteJogador;
    texturaDeQuadros(this, 'jogador', J.ORDEM.map((n) => J.QUADROS[n]), J.PALETA, J.LARGURA, J.ALTURA);

    // Tiles: um conjunto por fase ('tiles' = Itajubá, 'tiles_espaco', 'tiles_chefe'); o 0 fica vazio
    const T = ArteTiles;
    for (const [fase, tiles] of Object.entries(T.TILESETS)) {
      const chave = fase === 'itajuba' ? 'tiles' : `tiles_${fase}`;
      texturaDeQuadros(this, chave, T.ORDEM.map((n) => tiles[n] || null), T.PALETA, TILE, TILE);
    }

    // Ícones do HUD (12x12)
    const I = ArteIcones;
    texturaDeQuadros(this, 'icones', I.ORDEM.map((n) => I.ICONES[n]), I.PALETA, I.TAMANHO, I.TAMANHO);

    this.criarAnimacoes();
    // ?cenario=itajuba (ou espaco, chefe, tapete, final, ui) abre a prévia dos cenários, para conferir no celular
    const cenario = new URLSearchParams(location.search).get('cenario');
    if (cenario) this.scene.start('Galeria', { cenario });
    else this.scene.start('Teste');
  }

  criarAnimacoes() {
    const i = (nome) => ArteJogador.ORDEM.indexOf(nome);
    const quadros = (...nomes) => nomes.map((n) => ({ key: 'jogador', frame: i(n) }));
    const anim = (key, frames, frameRate, repeat = -1) => this.anims.create({ key, frames, frameRate, repeat });
    anim('parado', quadros('parado1', 'parado2'), 2);
    anim('correndo', quadros('correndo1', 'correndo2', 'correndo3', 'correndo4', 'correndo5', 'correndo6'), 12);
    anim('pulando', quadros('pulando'), 1);
    anim('caindo', quadros('caindo'), 1);
    anim('arremessando', quadros('arremessando1', 'arremessando2'), 14, 0);
    anim('dano', quadros('dano'), 1);
  }
}
