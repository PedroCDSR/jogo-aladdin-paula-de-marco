// Cenário da Fase 4, Tapete: voo sobre Itajubá ao entardecer, terminando na fachada do Teatro do Colégio G9.
// Camadas: céu (parado), nuvens (0,15), serra (0,25), cidade vista do alto com o rio (0,5), telhados (0,9).
// A fachada do teatro é uma imagem separada, colocada no fim do percurso.
import { LARGURA, ALTURA } from '../config.js';
import { criarTextura, curvaPeriodica, sorteador } from './pincel.js';
import { CONTORNO as K, SOL, ITAJUBA as C } from './cores.js';
import { TEXTOS } from '../data/textos.js';

const PERIODO = LARGURA * 2;
// mais baixo e mais quente que o céu da Fase 1: o voo acontece um pouco depois
const CEU_VOO = ['#7F7BE6', '#908CF4', '#A99EF5', '#C3A1E9', '#DCA3D6', '#EDA9C0', '#F6B5A6', '#FAC594', '#FCD68C'];

function texturaCeu(scene) {
  return criarTextura(scene, 'tap_ceu', LARGURA, ALTURA, (p) => {
    p.faixas(0, 0, LARGURA, ALTURA, CEU_VOO);
    const sx = 330, sy = 188, sr = 30;
    p.circulo(sx, sy, sr + 12, 'rgba(252,229,155,0.35)');
    p.circulo(sx, sy, sr + 5, SOL.halo);
    p.circulo(sx, sy, sr + 2, SOL.borda);
    p.circulo(sx, sy, sr, SOL.miolo);
    // listras de nuvem cortando o sol
    for (const [y, w] of [[176, 70], [186, 90], [198, 60]]) p.ret(sx - w / 2, y, w, 2, '#F6B5A6');
    const r = sorteador(41);
    for (let i = 0; i < 18; i++) p.px(r.entre(0, LARGURA), r.entre(4, 50), '#E8E4FF');
  });
}

function texturaNuvens(scene) {
  return criarTextura(scene, 'tap_nuvens', PERIODO, ALTURA, (p) => {
    const r = sorteador(8);
    for (let i = 0; i < 9; i++) {
      const x = (i * PERIODO) / 9 + r.entre(-20, 20);
      const y = r.entre(40, 140);
      const w = r.entre(50, 90);
      // nuvem fofa: bolhas com topo iluminado de rosa e base lilás
      const bolhas = [[0, 0, w / 2, 9], [-w / 4, 3, w / 4, 7], [w / 4, 2, w / 4, 8], [0, -5, w / 5, 7]];
      for (const [bx, by, rx, ry] of bolhas) p.elipse(Math.round(x + bx), y + by, Math.round(rx), ry, '#C9B2EE');
      for (const [bx, by, rx, ry] of bolhas) p.elipse(Math.round(x + bx), y + by - 2, Math.round(rx) - 2, ry - 2, '#F6CDE6');
      p.ret(x - w / 2 + 4, y + 7, w - 8, 2, '#B79FE3');
    }
  });
}

function texturaSerraVoo(scene) {
  return criarTextura(scene, 'tap_serra', PERIODO, ALTURA, (p) => {
    const curva = curvaPeriodica(PERIODO, 168, [[2, 18, 1], [5, 8, 0.2], [9, 3, 2]]);
    p.silhueta(curva, C.serraLuz);
    p.silhueta((x) => curva(x) + 3, C.serra);
  });
}

// Itajubá vista de cima: morros com casas, o rio Sapucaí refletindo o céu e a ponte
function texturaCidadeVoo(scene) {
  return criarTextura(scene, 'tap_cidade', PERIODO, ALTURA, (p) => {
    const r = sorteador(19);
    const curva = curvaPeriodica(PERIODO, 196, [[3, 10, 0.4], [7, 4, 1.7]]);
    p.silhueta(curva, C.morro);
    p.silhueta((x) => curva(x) + 12, C.morroSombra);
    // rio
    p.ret(0, 238, PERIODO, 10, '#B9A6EE');
    p.ret(0, 240, PERIODO, 1, '#F6CDE6');
    for (let x = 0; x < PERIODO; x += 9) p.ret(x + (x % 4), 244, 4, 1, '#E9D9FF');
    p.ret(0, 248, PERIODO, ALTURA - 248, C.morroSombra);
    // ponte
    const px = 540;
    p.ret(px, 232, 90, 3, '#EADCF2');
    for (let x = px + 6; x < px + 90; x += 20) p.ret(x, 235, 3, 13, '#EADCF2');
    // casinhas em fileiras, com janelas acesas
    for (let i = 0; i < 160; i++) {
      const x = r.entre(0, PERIODO - 10);
      const y = Math.round(curva(x + 4)) + r.entre(4, 36);
      if (y > 232) continue;
      const w = r.entre(6, 10);
      p.ret(x, y, w, 5, r.um(C.cidadeParedes));
      p.ret(x - 1, y - 1, w + 2, 2, C.cidadeTelhado);
      if (r() < 0.4) p.px(x + 2, y + 2, C.janelaAcesa);
    }
    // torres de igreja ao longe
    for (const tx of [210, 770]) {
      const base = Math.round(curva(tx)) + 10;
      p.ret(tx, base - 26, 6, 26, '#EBD3DE');
      p.ret(tx + 14, base - 26, 6, 26, '#EBD3DE');
      p.ret(tx, base - 14, 20, 14, '#EBD3DE');
      p.ret(tx + 1, base - 30, 4, 4, C.cidadeTelhado);
      p.ret(tx + 15, base - 30, 4, 4, C.cidadeTelhado);
    }
  });
}

// telhados bem perto, passando rápido embaixo do tapete
function texturaTelhados(scene) {
  return criarTextura(scene, 'tap_telhados', PERIODO, ALTURA, (p) => {
    const r = sorteador(31);
    let x = 0;
    while (x < PERIODO) {
      const w = r.entre(5, 9) * 8;
      const topo = r.entre(238, 252);
      const cor = r() < 0.5 ? C.telhado : '#A84A47';
      for (let i = 0; i < 8; i++) p.ret(x + i, topo + 8 - i, Math.min(w - i * 2, PERIODO - x - i), 1, K);
      p.ret(x, topo + 1, Math.min(w, PERIODO - x), ALTURA - topo, cor);
      for (let ty = topo + 3; ty < ALTURA; ty += 3) {
        for (let tx = x + (ty % 6 === 0 ? 0 : 2); tx < Math.min(x + w, PERIODO); tx += 4) p.px(tx, ty, C.telhadoLuz);
      }
      p.ret(x, topo, Math.min(w, PERIODO - x), 1, K);
      // caixa d'água ou antena em algumas casas
      if (r() < 0.35 && x + 12 < PERIODO) p.caixa(x + 8, topo - 10, 12, 10, '#5FA3C9', K);
      else if (r() < 0.4) p.ret(x + w / 2, topo - 18, 1, 18, K).ret(x + w / 2 - 5, topo - 14, 11, 1, K);
      x += w;
    }
  });
}

// Fachada do Teatro do Colégio G9 (desenho genérico: falta foto em references/lugares/).
export function texturaTeatro(scene) {
  const t = TEXTOS.cenarios;
  return criarTextura(scene, 'tap_teatro', 208, 184, (p) => {
    // prédio
    p.ret(0, 20, 208, 164, K);
    p.ret(1, 21, 206, 163, '#EDE6F3');
    p.ret(1, 21, 206, 6, '#D6CBE3');
    for (let x = 8; x < 200; x += 20) p.ret(x, 27, 1, 60, '#D6CBE3');
    // letreiro no topo com lâmpadas
    p.ret(30, 0, 148, 30, K);
    p.ret(31, 1, 146, 28, '#6D6BD9');
    for (let x = 34; x < 176; x += 6) {
      p.px(x, 3, '#F9FCBB');
      p.px(x, 26, '#F9FCBB');
    }
    p.texto(t.teatro1, 104, 6, '#F9FCBB', 8, '"Press Start 2P"', 'center');
    p.texto(t.teatro2, 104, 16, '#FFFFFF', 8, '"Press Start 2P"', 'center');
    // marquise
    p.ret(10, 92, 188, 8, K);
    p.ret(11, 93, 186, 5, '#FFB0FA');
    for (let x = 14; x < 196; x += 8) p.ret(x, 98, 4, 2, '#F9FCBB');
    // janelas de cima com luz quente
    for (let x = 16; x < 196; x += 30) {
      p.ret(x, 40, 18, 40, K);
      p.ret(x + 1, 41, 16, 38, '#F7C97E');
      p.ret(x + 1, 41, 16, 6, '#FBE3A8');
      p.ret(x + 8, 41, 1, 38, K);
    }
    // portas de vidro com luz de dentro
    p.ret(54, 108, 100, 66, K);
    p.ret(55, 109, 98, 65, '#FBD38C');
    for (let x = 55; x < 153; x += 24) p.ret(x + 23, 109, 2, 65, K);
    p.ret(58, 112, 6, 30, '#FFF0C8');
    p.ret(82, 112, 6, 30, '#FFF0C8');
    // cartazes do espetáculo nos dois lados
    for (const cx of [12, 162]) {
      p.ret(cx, 108, 34, 50, K);
      p.ret(cx + 1, 109, 32, 48, '#6D6BD9');
      for (let i = 0; i < 3; i++) p.ret(cx + 5 + i * 4, 113 + i * 4, 24 - i * 8, 24 - i * 8, ['#9E9EFF', '#FFB0FA', '#F9FCBB'][i]);
      p.texto(t.cartaz1, cx + 17, 139, '#F9FCBB', 8, '"Patrick Hand"', 'center');
      p.texto(t.cartaz2, cx + 17, 147, '#FFFFFF', 7, '"Patrick Hand"', 'center');
    }
    // escadaria
    p.ret(40, 174, 128, 4, '#CDB59B');
    p.ret(30, 178, 148, 6, '#A38A74');
    p.ret(40, 174, 128, 1, K);
  });
}

export function montarTapete(scene) {
  texturaCeu(scene);
  texturaNuvens(scene);
  texturaSerraVoo(scene);
  texturaCidadeVoo(scene);
  texturaTelhados(scene);
  texturaTeatro(scene);
  scene.add.image(0, 0, 'tap_ceu').setOrigin(0).setScrollFactor(0).setDepth(-100);
  const camadas = [
    ['tap_nuvens', 0.15],
    ['tap_serra', 0.25],
    ['tap_cidade', 0.5],
    ['tap_telhados', 0.9],
  ].map(([chave, fator], i) => ({
    fator,
    obj: scene.add.tileSprite(0, 0, LARGURA, ALTURA, chave).setOrigin(0).setScrollFactor(0).setDepth(-99 + i),
  }));
  return {
    // percorrido = quantos pixels o tapete já voou (rolagem automática)
    atualizar(percorrido) {
      for (const c of camadas) c.obj.tilePositionX = percorrido * c.fator;
    },
  };
}
