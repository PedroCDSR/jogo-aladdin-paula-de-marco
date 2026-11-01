import * as Phaser from 'phaser';
import { LARGURA, ALTURA, CORES, CORES_CSS, FONTES } from '../config.js';
import { TEXTOS } from '../data/textos.js';
import { ArteJogador, PERSONAGENS } from '../art/index.js';

// Vitrine de personagens: mostra todas as animações, em tamanho 2x, para conferir a arte.
// Abre com ?galeria no endereço (ex.: http://localhost:5173/?galeria). Não faz parte do jogo.
// ?galeria=2 abre direto na página 2 (útil para capturas de tela automáticas).

// Animações do Aladdin (criadas no Preload com nomes sem prefixo)
const ANIM_JOGADOR = ['parado', 'correndo', 'pulando', 'caindo', 'arremessando', 'dano', 'sentado'];

// Páginas: cada uma lista personagens; todas as animações de cada um entram na página.
const PAGINAS = [['jogador', 'capivara'], ['jafar', 'paula', 'claudia'], ['jasmine', 'genio', 'abu', 'sultao', 'bailarina', 'tapeteMagico']];

const ESCALA = 2;
const COLUNAS = 6;

export class Galeria extends Phaser.Scene {
  constructor() {
    super('Galeria');
  }

  create() {
    const inicial = parseInt(new URLSearchParams(window.location.search).get('galeria'), 10);
    this.pagina = Number.isFinite(inicial) ? Phaser.Math.Clamp(inicial - 1, 0, PAGINAS.length - 1) : 0;
    this.cameras.main.setBackgroundColor(CORES_CSS.lilas);
    this.itens = this.add.container(0, 0);

    this.rodape = this.add
      .text(LARGURA / 2, ALTURA - 4, '', { fontFamily: FONTES.dialogo, fontSize: '12px', color: CORES_CSS.roxo })
      .setOrigin(0.5, 1);

    this.input.on('pointerdown', (p) => this.virar(p.x < LARGURA / 3 ? -1 : 1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.virar(1));
    this.input.keyboard?.on('keydown-LEFT', () => this.virar(-1));
    this.montar();
  }

  virar(d) {
    this.pagina = (this.pagina + d + PAGINAS.length) % PAGINAS.length;
    this.montar();
  }

  // Lista (textura, animação) de uma página
  celulas() {
    const lista = [];
    for (const nome of PAGINAS[this.pagina]) {
      const anims = nome === 'jogador' ? ANIM_JOGADOR : Object.keys(PERSONAGENS[nome].ANIMACOES);
      for (const a of anims) {
        lista.push({ nome, anim: nome === 'jogador' ? a : `${nome}-${a}`, rotulo: a });
      }
    }
    return lista;
  }

  montar() {
    this.itens.removeAll(true);
    const lista = this.celulas();
    const linhas = Math.ceil(lista.length / COLUNAS);
    const larguraCel = LARGURA / COLUNAS;
    const alturaCel = Math.min(118, (ALTURA - 24) / linhas);
    lista.forEach((c, i) => {
      const col = i % COLUNAS;
      const lin = Math.floor(i / COLUNAS);
      const x = larguraCel * (col + 0.5);
      const yBase = alturaCel * (lin + 1) - 20; // pés dos personagens
      // chão de referência (onde os pés tocam)
      this.itens.add(this.add.rectangle(x, yBase, larguraCel - 8, 1, CORES.roxo, 0.5));
      const spr = this.add.sprite(x, yBase, c.nome).setOrigin(0.5, 1).setScale(ESCALA);
      if (c.nome === 'tapeteMagico') spr.setScale(1);
      spr.play(c.anim);
      // animações que tocam uma vez: repetir para dar para ver
      if (spr.anims.currentAnim?.repeat === 0) {
        spr.on('animationcomplete', () => this.time.delayedCall(600, () => spr.active && spr.play(c.anim)));
      }
      const nome = TEXTOS.galeria.nomes[c.nome];
      const rotulo = this.add
        .text(x, yBase + 3, `${nome}\n${c.rotulo}`, {
          fontFamily: FONTES.dialogo,
          fontSize: '10px',
          color: '#2E1A33',
          align: 'center',
          lineSpacing: -3,
        })
        .setOrigin(0.5, 0);
      this.itens.add([spr, rotulo]);
    });
    this.rodape.setText(`${TEXTOS.galeria.titulo} ${this.pagina + 1}/${PAGINAS.length} · ${TEXTOS.galeria.dica}`);
  }
}
