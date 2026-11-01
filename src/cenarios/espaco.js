// Cenário da Fase 2, Espaço Paula De Marco: estúdio de dança com espelhos, barras, janelas e mural.
// A parede é uma faixa de 384 px que se repete pela fase inteira, alinhada ao piso.
import { criarTextura } from './pincel.js';
import { CONTORNO as K, ESPACO as E, CEU_TARDE } from './cores.js';
import { TEXTOS } from '../data/textos.js';
import { TILE } from '../config.js';

const PERIODO = 384;
const ALT = 270;
const PISO = 240; // linha do piso dentro da textura

function texturaParede(scene) {
  const t = TEXTOS.cenarios;
  return criarTextura(scene, 'esp_parede', PERIODO, ALT, (p) => {
    // parede lisa com faixas suaves e teto com trilho de luz
    p.ret(0, 0, PERIODO, ALT, E.parede);
    p.ret(0, 0, PERIODO, 14, '#CFC2E6');
    p.ret(0, 14, PERIODO, 2, '#B6A6D6');
    p.ret(0, 150, PERIODO, PISO - 150, E.paredeSombra);
    p.ret(0, 150, PERIODO, 1, '#C9BCE0');
    // luminárias penduradas com cone de luz
    for (const lx of [96, 288]) {
      p.ret(lx, 16, 1, 10, K);
      p.ret(lx - 6, 26, 13, 5, '#6D6BD9');
      p.ret(lx - 4, 31, 9, 2, E.luz);
      p.ctx.fillStyle = 'rgba(255,248,216,0.18)';
      p.ctx.beginPath();
      p.ctx.moveTo(lx - 4, 33);
      p.ctx.lineTo(lx + 5, 33);
      p.ctx.lineTo(lx + 40, 140);
      p.ctx.lineTo(lx - 39, 140);
      p.ctx.fill();
    }

    // espelho grande (x 20..196) com moldura roxa e reflexos em diagonal
    const ex = 20, ey = 92, ew = 176, eh = PISO - 6 - ey;
    p.ret(ex - 2, ey - 2, ew + 4, eh + 4, E.espelhoMoldura);
    p.faixas(ex, ey, ew, eh, [E.espelho[2], E.espelho[1], E.espelho[0], E.espelho[1]]);
    // reflexo da parede de frente (faixa) e brilhos inclinados
    p.ret(ex, ey + 58, ew, 1, '#C9D4F6');
    for (const [bx, larg] of [[30, 10], [44, 3], [122, 14], [140, 4]]) {
      for (let y = 0; y < eh; y++) {
        const x = bx + Math.floor(y * 0.6);
        if (x + larg < ew) p.ret(ex + x, ey + eh - 1 - y, larg, 1, 'rgba(255,255,255,0.45)');
      }
    }
    for (let x = ex + 44; x < ex + ew; x += 44) p.ret(x, ey, 1, eh, '#A9B8E8'); // emendas dos espelhos

    // barras de balé (duas alturas) presas na parede por suportes
    for (const by of [190, 206]) {
      p.ret(12, by, 192, 4, K);
      p.ret(13, by + 1, 190, 2, E.barra);
      p.ret(13, by + 1, 190, 1, E.barraLuz);
    }
    for (const sx of [24, 104, 184]) {
      p.ret(sx, 186, 3, 26, E.barraSuporte);
      p.ret(sx - 2, 186, 7, 2, K);
      p.ret(sx - 2, 210, 7, 2, K);
    }

    // janela (x 212..276) mostrando o fim de tarde, com cortinas rosa
    const jx = 214, jy = 70, jw = 60, jh = 76;
    p.ret(jx - 3, jy - 3, jw + 6, jh + 6, K);
    p.faixas(jx, jy, jw, jh, CEU_TARDE.slice(2));
    p.circulo(jx + 44, jy + 58, 7, '#FFF6CF');
    p.ret(jx, jy + jh - 14, jw, 14, '#9576C0');
    p.ret(jx, jy + jh - 8, jw, 8, '#8064AD');
    for (let x = jx + 3; x < jx + jw - 3; x += 7) p.ret(x, jy + jh - 11, 4, 3, '#EADCF2');
    p.ret(jx + jw / 2 - 1, jy, 2, jh, K);
    p.ret(jx, jy + jh / 2 - 6, jw, 2, K);
    for (const [cx, dir] of [[jx - 8, 1], [jx + jw - 6, -1]]) {
      p.ret(cx, jy - 8, 14, jh + 22, '#FFB0FA');
      for (let x = 2; x < 14; x += 4) p.ret(cx + x, jy - 8, 1, jh + 22, '#E28ADB');
      p.ret(cx + (dir > 0 ? 10 : 0), jy - 8, 4, jh + 22, '#F6C9F3');
    }
    p.ret(jx - 12, jy - 12, jw + 24, 4, '#6D6BD9');
    p.ret(jx - 6, jy + jh + 3, jw + 12, 4, '#F3E6D2');
    // caixa de som e planta
    p.caixa(222, 190, 20, 30, '#4A3A66', K);
    p.circulo(232, 200, 5, '#2E2448');
    p.circulo(232, 213, 3, '#2E2448');
    p.ret(254, 214, 14, 20, '#B5543A');
    for (const [fx, fy] of [[256, 200], [262, 196], [260, 206], [266, 204], [252, 207]]) p.elipse(fx, fy, 4, 6, '#6CC24A');

    // mural (x 282..378): cartaz do espetáculo e fotos, com relógio em cima
    p.circulo(330, 44, 12, K);
    p.circulo(330, 44, 11, '#FFFFFF');
    p.ret(330, 36, 1, 8, K);
    p.ret(330, 44, 6, 1, K);
    p.caixa(284, 72, 92, 92, '#E6CFA6', K);
    // cartaz com os quadrados do logo
    p.caixa(290, 78, 44, 60, '#6D6BD9', K);
    for (let i = 0; i < 4; i++) p.ret(298 + i * 4, 84 + i * 4, 28 - i * 8, 28 - i * 8, ['#9E9EFF', '#FFB0FA', '#F9FCBB', '#6CC24A'][i]);
    p.texto(t.cartaz1, 312, 118, '#F9FCBB', 8, '"Patrick Hand"', 'center');
    p.texto(t.cartaz2, 312, 127, '#FFFFFF', 8, '"Patrick Hand"', 'center');
    // fotos presas com tachinha (sapatilha e tutu em silhueta, sem rostos)
    p.caixa(340, 78, 30, 24, '#F9FCBB', K);
    p.ret(346, 92, 14, 4, '#FFB0FA');
    p.ret(357, 88, 4, 4, '#FFB0FA');
    p.caixa(340, 108, 30, 24, '#C9EFC0', K);
    p.elipse(355, 122, 10, 3, '#FFB0FA');
    p.ret(354, 112, 2, 9, '#6D6BD9');
    p.caixa(290, 142, 80, 16, '#FFFFFF', K);
    for (let x = 294; x < 364; x += 6) p.ret(x, 148, 4, 1, '#9E9EFF');
    for (const [tx, ty] of [[312, 78], [355, 78], [355, 108], [330, 142]]) p.ret(tx - 1, ty - 1, 3, 3, '#F25C8A');
    // banco de madeira com mochilas
    p.ret(286, 212, 90, 4, K);
    p.ret(287, 213, 88, 2, E.barraLuz);
    p.ret(290, 216, 3, 18, K);
    p.ret(369, 216, 3, 18, K);
    p.arredondado(300, 196, 18, 16, 3, '#FFB0FA');
    p.arredondado(330, 200, 14, 12, 3, '#6CC24A');
    p.ret(306, 200, 6, 4, '#E28ADB');

    // pilastra entre os trechos (emenda da repetição) e rodapé
    p.ret(0, 16, 8, PISO - 16, '#DCD0EC');
    p.ret(PERIODO - 4, 16, 4, PISO - 16, '#DCD0EC');
    p.ret(0, PISO - 6, PERIODO, 6, E.rodape);
    p.ret(0, PISO - 6, PERIODO, 1, E.rodapeLuz);
    p.ret(0, PISO, PERIODO, ALT - PISO, E.rodape);
  });
}

// Monta o estúdio. linhaPiso = linha do mapa onde fica o piso principal (o topo do '#').
export function montarEspaco(scene, mapa, linhaPiso) {
  texturaParede(scene);
  const yPiso = linhaPiso * TILE;
  scene.cameras.main.setBackgroundColor(E.parede);
  scene.add
    .tileSprite(0, yPiso - PISO, mapa.larguraPx, ALT, 'esp_parede')
    .setOrigin(0)
    .setDepth(-100);
  return { atualizar() {} };
}
