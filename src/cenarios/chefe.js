// Cenário da Fase 3, Resgate: terraço no alto de uma torre, à noite, com Itajubá iluminada lá embaixo.
// Arena de uma tela só (480x270). A gaiola da Tia Paula tem 2 quadros: fechada (0) e aberta (1).
import { LARGURA, ALTURA } from '../config.js';
import { criarTextura, criarTexturaQuadros, curvaPeriodica, sorteador } from './pincel.js';
import { CONTORNO as K, NOITE, LUA } from './cores.js';

// céu estrelado com lua crescente (função reaproveitada no palco)
export function pintarNoite(p, w, h, lua = { x: 92, y: 62, r: 24 }) {
  p.faixas(0, 0, w, h, NOITE);
  const r = sorteador(77);
  for (let i = 0; i < 90; i++) {
    const x = r.entre(0, w - 1);
    const y = r.entre(0, Math.floor(h * 0.7));
    p.px(x, y, r() < 0.3 ? '#F9FCBB' : '#D9C8F5');
  }
  // estrelas maiores em cruz
  for (let i = 0; i < 7; i++) {
    const x = r.entre(10, w - 10);
    const y = r.entre(8, Math.floor(h * 0.45));
    p.ret(x - 2, y, 5, 1, '#F9FCBB').ret(x, y - 2, 1, 5, '#F9FCBB').px(x, y, '#FFFFFF');
  }
  // lua crescente: círculo claro menos um círculo deslocado
  const { x: lx, y: ly, r: lr } = lua;
  for (let y = -lr - 6; y <= lr + 6; y++) {
    for (let x = -lr - 6; x <= lr + 6; x++) {
      const d = Math.hypot(x, y);
      const corte = Math.hypot(x - lr * 0.55, y - lr * 0.3);
      if (d <= lr && corte > lr * 0.85) p.px(lx + x, ly + y, d > lr - 3 ? LUA.sombra : LUA.clara);
      else if (d <= lr + 5 && d > lr && corte > lr * 0.85 && (x + y) % 2 === 0) p.px(lx + x, ly + y, 'rgba(255,241,184,0.35)');
    }
  }
}

function texturaArena(scene) {
  return criarTextura(scene, 'chefe_fundo', LARGURA, ALTURA, (p) => {
    pintarNoite(p, LARGURA, ALTURA);
    // Itajubá lá embaixo: morros escuros com luzes das casas
    const morro = curvaPeriodica(LARGURA, 196, [[2, 10, 0.6], [5, 4, 2]]);
    p.silhueta(morro, '#3A2466');
    const r = sorteador(9);
    for (let i = 0; i < 140; i++) {
      const x = r.entre(0, LARGURA - 1);
      const y = Math.round(morro(x)) + r.entre(2, 50);
      p.px(x, y, r() < 0.7 ? '#F9FCBB' : '#FFB0FA');
    }
    // mureta do terraço com balaústres
    p.ret(0, 204, LARGURA, 6, K);
    p.ret(0, 205, LARGURA, 4, '#7A50AE');
    p.ret(0, 205, LARGURA, 1, '#9C7BD0');
    for (let x = 4; x < LARGURA; x += 12) {
      p.ret(x, 210, 6, 30, K);
      p.ret(x + 1, 210, 4, 30, '#5E3A8E');
      p.ret(x + 2, 214, 2, 18, '#7A50AE');
      p.ret(x, 222, 6, 2, '#3A2160');
    }
    p.ret(0, 236, LARGURA, 4, '#3A2160');
    // colunas nas laterais, com capitel dourado, e arco recortado em cima
    for (const cx of [0, LARGURA - 28]) {
      p.ret(cx, 30, 28, 210, K);
      p.ret(cx + 2, 30, 24, 210, '#4B2C78');
      p.ret(cx + 6, 30, 4, 210, '#5E3A8E');
      p.ret(cx + 20, 30, 3, 210, '#3A2160');
      p.ret(cx - 2, 30, 32, 8, K);
      p.ret(cx - 1, 31, 30, 6, '#F2CE63');
      p.ret(cx - 1, 35, 30, 2, '#B58A2E');
    }
    // arco recortado: faixa roxa com recortes em semicírculo e friso dourado na borda
    for (let x = 0; x < LARGURA; x++) {
      const dx = (x - 28 + 320) % 32;
      const fundo = x < 28 || x >= LARGURA - 28 ? 30 : Math.round(30 - Math.sqrt(Math.max(0, 256 - (dx - 16) ** 2)));
      p.ret(x, 0, 1, fundo, '#3A2160');
      p.ret(x, fundo, 1, 2, '#F2CE63');
    }
    p.ret(0, 0, LARGURA, 6, '#2B1850');
    for (let x = 28; x <= LARGURA - 28; x += 32) p.circulo(x, 30, 3, '#F2CE63');
    // estandartes roxos com um losango dourado
    for (const bx of [118, 346]) {
      p.ret(bx, 22, 16, 44, '#6A2E7E');
      p.ret(bx, 66, 8, 4, '#6A2E7E');
      p.ret(bx + 8, 66, 8, 2, '#6A2E7E');
      p.ret(bx + 2, 22, 2, 44, '#8A3E9E');
      p.ret(bx + 6, 38, 4, 4, '#F2CE63');
      p.ret(bx + 7, 36, 2, 8, '#F2CE63');
      p.ret(bx + 5, 39, 6, 2, '#F2CE63');
    }
  });
}

// Gaiola dourada (40x64). Quadro 0 = fechada; quadro 1 = porta aberta.
export function texturaGaiola(scene) {
  return criarTexturaQuadros(scene, 'chefe_gaiola', 48, 72, 2, (p, q) => {
    const ouro = '#F2CE63';
    const ouroE = '#B58A2E';
    // argola e cúpula
    p.ret(22, 0, 4, 2, K).ret(21, 2, 2, 4, K).ret(25, 2, 2, 4, K).ret(22, 6, 4, 1, K);
    p.ret(23, 7, 2, 4, ouroE);
    for (let y = 0; y < 12; y++) {
      const meia = Math.floor(Math.sqrt(144 - (12 - y) ** 2) * 1.75);
      p.ret(24 - meia - 1, 11 + y, meia * 2 + 2, 1, K);
      p.ret(24 - meia, 11 + y, meia * 2, 1, y < 4 ? ouro : ouroE);
    }
    p.ret(2, 22, 44, 4, K);
    p.ret(3, 23, 42, 2, ouro);
    // grades
    for (let x = 4; x <= 42; x += 6) {
      const naPorta = x >= 16 && x <= 30;
      if (q === 1 && naPorta) continue;
      p.ret(x, 26, 2, 38, ouroE);
      p.px(x, 26, ouro);
    }
    p.ret(3, 44, 42, 2, ouroE);
    if (q === 1) {
      // porta aberta, virada para o lado
      for (let i = 0; i < 3; i++) p.ret(36 + i * 4, 30 + i, 1, 30, ouro);
      p.ret(36, 30, 10, 1, ouroE).ret(36, 59, 10, 1, ouroE);
    }
    // base
    p.ret(0, 64, 48, 8, K);
    p.ret(1, 65, 46, 5, ouro);
    p.ret(1, 68, 46, 2, ouroE);
  });
}

export function montarChefe(scene) {
  texturaArena(scene);
  texturaGaiola(scene);
  scene.add.image(0, 0, 'chefe_fundo').setOrigin(0).setScrollFactor(0).setDepth(-100);
  return { atualizar() {} };
}
