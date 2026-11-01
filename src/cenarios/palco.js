// Cenário do Final: palco do teatro com cortinas que se abrem, bambinela em cima, ribalta e canhão de luz.
import { LARGURA, ALTURA } from '../config.js';
import { criarTextura, Pincel } from './pincel.js';
import { CONTORNO as K } from './cores.js';
import { pintarNoite } from './chefe.js';

const PISO = 212; // onde começa o piso do palco
// veludo nas cores da escola: do roxo escuro ao rosa claro (nada de vermelho de cinema)
const VELUDO = ['#5A2470', '#7A2E88', '#9E44A6', '#C463C3', '#E58EDC', '#C463C3', '#9E44A6', '#7A2E88'];

function texturaFundo(scene) {
  return criarTextura(scene, 'pal_fundo', LARGURA, ALTURA, (p) => {
    p.ret(0, 0, LARGURA, ALTURA, '#1E1236');
    // painel pintado no fundo do palco: noite estrelada com os quadrados do logo
    const pw = 400, ph = 170, px = 40, py = 40;
    p.ret(px - 2, py - 2, pw + 4, ph + 4, '#130B25');
    p.ctx.save();
    p.ctx.translate(px, py);
    pintarNoite(new Pincel(p.ctx, pw, ph), pw, ph, { x: 330, y: 40, r: 18 });
    p.ctx.restore();
    const cx = LARGURA / 2;
    const cores = ['#6D6BD9', '#9E9EFF', '#FFB0FA', '#F9FCBB'];
    for (let i = 0; i < 4; i++) {
      const lado = 96 - i * 22;
      p.arredondado(cx - lado / 2, 120 - lado / 2 + 10, lado, lado, 10 - i * 2, cores[i]);
    }
    // piso do palco em perspectiva
    p.ret(0, PISO, LARGURA, ALTURA - PISO, '#8A5A2E');
    for (let y = PISO; y < ALTURA; y += 6) p.ret(0, y, LARGURA, 1, '#6E4524');
    for (let i = -12; i <= 12; i++) {
      // tábuas convergindo para o centro
      for (let y = PISO; y < ALTURA - 14; y++) {
        const t = (y - PISO) / (ALTURA - PISO);
        const x = Math.round(cx + i * (16 + t * 30));
        if (x >= 0 && x < LARGURA) p.px(x, y, '#6E4524');
      }
    }
    p.ret(0, PISO, LARGURA, 2, '#C98D52');
    // boca de cena (borda da frente) e ribalta
    p.ret(0, ALTURA - 14, LARGURA, 14, K);
    p.ret(0, ALTURA - 13, LARGURA, 3, '#6D6BD9');
    for (let x = 20; x < LARGURA; x += 40) {
      p.ret(x, ALTURA - 18, 12, 5, K);
      p.ret(x + 1, ALTURA - 17, 10, 3, '#F9FCBB');
    }
    // pernas laterais (coxias)
    p.ret(0, 0, 30, ALTURA - 14, '#2A1846');
    p.ret(LARGURA - 30, 0, 30, ALTURA - 14, '#2A1846');
  });
}

// Uma folha de cortina (lado esquerdo). O lado direito é a mesma imagem espelhada.
function texturaCortina(scene) {
  const w = 248;
  const h = ALTURA - 14;
  return criarTextura(scene, 'pal_cortina', w, h, (p) => {
    const dobra = 16;
    for (let x = 0; x < w; x++) {
      const fase = x % dobra;
      const cor = VELUDO[Math.floor((fase / dobra) * VELUDO.length)];
      // a barra de baixo ondula um pouco, como tecido pesado
      const fundo = h - 6 + Math.round(2 * Math.sin((x / dobra) * Math.PI * 2));
      p.ret(x, 0, 1, fundo, cor);
      p.ret(x, fundo, 1, 3, '#F2CE63');
      p.ret(x, fundo + 3, 1, 1, '#B58A2E');
    }
    // franja de borda do lado de dentro
    p.ret(w - 3, 0, 3, h - 4, '#F2CE63');
    p.ret(w - 1, 0, 1, h - 4, '#B58A2E');
  });
}

// Bambinela: faixa de cima com gomos e franja dourada
function texturaBambinela(scene) {
  return criarTextura(scene, 'pal_bambinela', LARGURA, 44, (p) => {
    p.ret(0, 0, LARGURA, 18, VELUDO[1]);
    for (let x = 0; x < LARGURA; x++) {
      const gomo = 48;
      const dx = (x % gomo) - gomo / 2;
      const fundo = 18 + Math.round(18 * Math.sqrt(Math.max(0, 1 - (dx * dx) / ((gomo / 2) ** 2))));
      p.ret(x, 0, 1, fundo, VELUDO[(Math.floor(Math.abs(dx) / 5) + 1) % VELUDO.length]);
      p.ret(x, fundo, 1, 3, '#F2CE63');
      if (x % 3 === 0) p.ret(x, fundo + 3, 1, 3, '#B58A2E');
    }
    p.ret(0, 0, LARGURA, 3, '#3A1A50');
  });
}

function texturaLuz(scene) {
  return criarTextura(scene, 'pal_luz', 200, PISO + 30, (p) => {
    const ctx = p.ctx;
    const g = ctx.createLinearGradient(0, 0, 0, PISO + 30);
    g.addColorStop(0, 'rgba(255,248,216,0.05)');
    g.addColorStop(1, 'rgba(255,248,216,0.32)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(90, 0);
    ctx.lineTo(110, 0);
    ctx.lineTo(196, PISO + 18);
    ctx.lineTo(4, PISO + 18);
    ctx.fill();
    p.elipse(100, PISO + 18, 96, 10, 'rgba(255,248,216,0.25)');
  });
}

// Monta o palco. Devolve { abrir(duracaoMs) } para abrir as cortinas.
export function montarPalco(scene) {
  texturaFundo(scene);
  texturaCortina(scene);
  texturaBambinela(scene);
  texturaLuz(scene);
  scene.add.image(0, 0, 'pal_fundo').setOrigin(0).setDepth(-100);
  const luz = scene.add.image(LARGURA / 2, 0, 'pal_luz').setOrigin(0.5, 0).setDepth(50).setAlpha(0);
  const esq = scene.add.image(LARGURA / 2 + 8, 0, 'pal_cortina').setOrigin(1, 0).setDepth(60);
  const dir = scene.add.image(LARGURA / 2 - 8, 0, 'pal_cortina').setOrigin(1, 0).setFlipX(true).setDepth(60);
  // com flipX a origem continua do lado esquerdo do desenho: ajusta para a folha direita cobrir a metade direita
  dir.setOrigin(0, 0);
  scene.add.image(0, 0, 'pal_bambinela').setOrigin(0).setDepth(70);
  return {
    abrir(duracao = 1600) {
      scene.tweens.add({ targets: esq, x: 70, duration: duracao, ease: 'Sine.easeInOut' });
      scene.tweens.add({ targets: dir, x: LARGURA - 70, duration: duracao, ease: 'Sine.easeInOut' });
      scene.tweens.add({ targets: luz, alpha: 1, delay: duracao * 0.6, duration: 600 });
    },
  };
}
