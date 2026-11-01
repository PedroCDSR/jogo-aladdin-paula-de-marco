import * as Phaser from 'phaser';
import { LARGURA, ALTURA, TILE, CORES_CSS, FONTES } from '../config.js';
import { TEXTOS } from '../data/textos.js';
import { EVENTO } from '../data/evento.js';
import { lerMapa } from '../levels/leitor.js';
import { TESTE } from '../levels/teste.js';
import { ESPACO_PREVIA, ARENA } from '../levels/previas.js';
import { montarItajuba, texturaCeuTarde } from '../cenarios/itajuba.js';
import { montarEspaco } from '../cenarios/espaco.js';
import { montarChefe } from '../cenarios/chefe.js';
import { montarTapete } from '../cenarios/tapete.js';
import { montarPalco } from '../cenarios/palco.js';
import { criarPainel, criarBotao, criarTitulo, texturaPilulaHud, TEXTO_PAINEL } from '../ui/estilo.js';
import { BotaoSom } from '../ui/BotaoSom.js';

// Prévia dos cenários, para conferir a arte no celular antes de as fases existirem.
// Abrir com ?cenario=itajuba (ou espaco, chefe, tapete, final, ui). Tocar na tela passa para o próximo.
// Não faz parte do jogo: as fases de verdade usam as mesmas funções montarX() de src/cenarios/.
const ORDEM = ['itajuba', 'espaco', 'chefe', 'tapete', 'final', 'ui'];

export class Galeria extends Phaser.Scene {
  constructor() {
    super('Galeria');
  }

  create({ cenario }) {
    this.cenario = ORDEM.includes(cenario) ? cenario : ORDEM[0];
    this.atualizarCenario = null;
    this.percorrido = 0;
    const montar = {
      itajuba: () => this.previaItajuba(),
      espaco: () => this.previaEspaco(),
      chefe: () => this.previaChefe(),
      tapete: () => this.previaTapete(),
      final: () => this.previaFinal(),
      ui: () => this.previaUi(),
    };
    montar[this.cenario]();

    const g = TEXTOS.galeria;
    const rotulo = (y, txt, tam) =>
      this.add
        .text(LARGURA / 2, y, txt, { fontFamily: FONTES.titulo, fontSize: `${tam}px`, color: CORES_CSS.branco })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(3000)
        .setShadow(1, 1, CORES_CSS.roxo, 0, false, true);
    if (this.cenario !== 'ui') rotulo(this.cenario === 'final' ? 48 : 6, g.titulos[this.cenario], 8);
    rotulo(ALTURA - 10, g.proximo, 8);

    // tocar (ou seta para a direita) passa para o próximo cenário
    const proximo = () => {
      const i = (ORDEM.indexOf(this.cenario) + 1) % ORDEM.length;
      history.replaceState(null, '', `?cenario=${ORDEM[i]}`);
      this.scene.restart({ cenario: ORDEM[i] });
    };
    this.input.on('pointerup', (p, alvos) => alvos.length === 0 && proximo());
    this.input.keyboard?.on('keydown-RIGHT', proximo);
  }

  // tiles + colisão não importam aqui: só o visual
  tiles(linhas, nome, chave) {
    const mapa = lerMapa(linhas, nome);
    const tm = this.make.tilemap({ data: mapa.tiles, tileWidth: TILE, tileHeight: TILE });
    tm.createLayer(0, tm.addTilesetImage(chave, chave, TILE, TILE, 0, 0), 0, 0);
    return mapa;
  }

  jogadorEm(x, y, anim = 'parado', direita = true) {
    return this.add.sprite(x, y, 'jogador', 0).setOrigin(0.5, 1).setFlipX(!direita).play(anim).setDepth(10);
  }

  // câmera passeia de um lado para o outro do mapa, mostrando o parallax
  passear(mapa, duracao) {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, mapa.larguraPx, mapa.alturaPx);
    cam.scrollY = mapa.alturaPx - ALTURA;
    this.tweens.add({ targets: cam, scrollX: mapa.larguraPx - LARGURA, duration: duracao, yoyo: true, repeat: -1, hold: 800, ease: 'Sine.easeInOut' });
  }

  previaItajuba() {
    const mapa = this.tiles(TESTE, 'TESTE', 'tiles');
    const c = montarItajuba(this, TESTE, mapa);
    this.atualizarCenario = () => c.atualizar(this.cameras.main);
    const j = this.jogadorEm(mapa.inicio.x + 40, mapa.inicio.y, 'correndo');
    this.tweens.add({ targets: j, x: mapa.larguraPx - 60, duration: 22000, yoyo: true, repeat: -1, hold: 800, onYoyo: () => j.setFlipX(true), onRepeat: () => j.setFlipX(false) });
    this.passear(mapa, 22000);
  }

  previaEspaco() {
    const mapa = this.tiles(ESPACO_PREVIA, 'ESPACO', 'tiles_espaco');
    montarEspaco(this, mapa, 15);
    this.jogadorEm(80, 15 * TILE, 'parado');
    this.passear(mapa, 9000);
  }

  previaChefe() {
    const mapa = this.tiles(ARENA, 'ARENA', 'tiles_chefe');
    montarChefe(this);
    this.cameras.main.scrollY = mapa.alturaPx - ALTURA;
    // gaiola da Tia Paula no canto direito
    this.add.image(LARGURA - 52, 15 * TILE, 'chefe_gaiola', 0).setOrigin(0.5, 1).setDepth(5);
    this.jogadorEm(mapa.inicio.x + 20, 15 * TILE, 'parado');
  }

  previaTapete() {
    const c = montarTapete(this);
    // a fachada do teatro entra pela direita no fim do voo e para
    const teatro = this.add.image(LARGURA + 120, ALTURA, 'tap_teatro').setOrigin(0.5, 1).setScrollFactor(0).setDepth(-90);
    const j = this.jogadorEm(130, 140, 'pulando');
    this.tweens.add({ targets: j, y: 128, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.atualizarCenario = (dt) => {
      const chegada = 2400; // px voados até o teatro aparecer inteiro
      if (this.percorrido < chegada) this.percorrido += dt * 0.12;
      c.atualizar(this.percorrido);
      teatro.x = Math.round(Math.max(360, LARGURA + 120 - Math.max(0, this.percorrido - 1900) * 0.9));
    };
  }

  previaFinal() {
    const palco = montarPalco(this);
    this.time.delayedCall(700, () => palco.abrir());
  }

  previaUi() {
    const t = TEXTOS.galeria;
    this.add.image(0, 0, texturaCeuTarde(this)).setOrigin(0);
    // painel "sobre o espetáculo" com os dados do evento
    criarPainel(this, LARGURA / 2, 140, 300, 196);
    criarTitulo(this, LARGURA / 2, 62, t.exemploTitulo, 8, CORES_CSS.roxo).setShadow(0, 0);
    const linhas = [EVENTO.data, `Horário: ${EVENTO.horario}`, EVENTO.local];
    linhas.forEach((l, i) =>
      this.add.text(LARGURA / 2, 80 + i * 18, l, { fontFamily: FONTES.dialogo, fontSize: '16px', color: TEXTO_PAINEL }).setOrigin(0.5, 0),
    );
    criarBotao(this, LARGURA / 2, 160, t.exemploBotao1, { largura: 180, altura: 28 });
    criarBotao(this, LARGURA / 2 - 72, 196, t.exemploBotao2, { largura: 132, altura: 26, cor: 'amarelo' });
    criarBotao(this, LARGURA / 2 + 72, 196, 'INSTAGRAM', { largura: 132, altura: 26, cor: 'verde' });

    // HUD: corações, maçãs, sapatilhas e ingressos
    const hud = (x, w) => this.add.image(x, 6, texturaPilulaHud(this, w)).setOrigin(0, 0);
    hud(6, 50);
    [0, 0, 1].forEach((f, i) => this.add.image(12 + i * 14, 9, 'icones', f).setOrigin(0));
    const contador = (x, icone, n) => {
      hud(x, 46);
      this.add.image(x + 5, 9, 'icones', icone).setOrigin(0);
      this.add.text(x + 20, 11, `x${n}`, { fontFamily: FONTES.titulo, fontSize: '8px', color: CORES_CSS.branco }).setShadow(1, 1, CORES_CSS.roxo, 0, false, true);
    };
    contador(60, 2, 5);
    contador(110, 3, 12);
    contador(160, 4, 1);
    // pausa e som no canto direito
    this.add.image(LARGURA - 52, 20, texturaPilulaHud(this, 28, 28)).setOrigin(0.5);
    this.add.image(LARGURA - 52, 20, 'icones', 5);
    new BotaoSom(this, LARGURA - 20, 20);
  }

  update(agora, delta) {
    this.atualizarCenario?.(delta);
  }
}
