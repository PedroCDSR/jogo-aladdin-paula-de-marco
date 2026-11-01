// Cenário da Fase 1, Itajubá, desenhado em código (arte original, sem arquivos).
//
// Camadas, de trás para a frente:
//   céu de fim de tarde com sol (parado)
//   serra ao fundo (0,1)  →  morros com casinhas (0,25)  →  cidade apagada (0,5)   [parallax]
//   primeiro plano (anda junto com o jogador): casas coloniais, árvores (ipês), postes, bancos,
//   barracas debaixo dos toldos, a fonte e a fachada do Espaço Paula De Marco na saída.
import { LARGURA, ALTURA, TILE } from '../config.js';
import { criarTextura, criarTexturaQuadros, curvaPeriodica, sorteador } from './pincel.js';
import { CONTORNO as K, CEU_TARDE, SOL, ITAJUBA as C } from './cores.js';
import { TEXTOS } from '../data/textos.js';

const PERIODO = LARGURA * 2; // camadas de parallax repetem a cada 2 telas

// ---------- céu ----------
export function texturaCeuTarde(scene, chave = 'ceu_tarde', sol = { x: 372, y: 168, r: 20 }) {
  return criarTextura(scene, chave, LARGURA, ALTURA, (p) => {
    p.faixas(0, 0, LARGURA, ALTURA, CEU_TARDE);
    // sol baixo, com halo em anéis
    p.circulo(sol.x, sol.y, sol.r + 8, SOL.halo);
    p.circulo(sol.x, sol.y, sol.r + 3, SOL.borda);
    p.circulo(sol.x, sol.y, sol.r, SOL.miolo);
    // nuvens finas e compridas, cortando o sol
    const r = sorteador(11);
    for (let i = 0; i < 9; i++) {
      const w = r.entre(40, 110);
      const x = r.entre(-20, LARGURA - 20);
      const y = r.entre(40, 190);
      const cor = y > 140 ? '#FCE2C8' : '#F6CCE8';
      p.ret(x, y, w, 2, cor);
      p.ret(x + 8, y - 1, w - 22, 1, cor);
      p.ret(x + 14, y + 2, w - 30, 1, '#E9B3D8');
    }
  });
}

// ---------- serra e morros (repetem sem emenda) ----------
function texturaSerra(scene) {
  return criarTextura(scene, 'ita_serra', PERIODO, ALTURA, (p) => {
    const curva = curvaPeriodica(PERIODO, 150, [[2, 16, 0], [5, 7, 1.3], [11, 3, 0.4]]);
    p.silhueta(curva, C.serraLuz);
    p.silhueta((x) => curva(x) + 2, C.serra);
  });
}

function texturaMorros(scene) {
  return criarTextura(scene, 'ita_morros', PERIODO, ALTURA, (p) => {
    const curva = curvaPeriodica(PERIODO, 182, [[3, 14, 2], [7, 5, 0.5], [13, 2, 1]]);
    p.silhueta(curva, C.morro);
    // sombra do lado oposto ao sol
    p.silhueta((x) => curva(x) + 10 + 6 * Math.sin((x / PERIODO) * Math.PI * 6), C.morroSombra);
    const r = sorteador(5);
    // árvores (bolinhas escuras) e casinhas brancas com janela acesa, típicas dos morros de Itajubá
    for (let i = 0; i < 70; i++) {
      const x = r.entre(0, PERIODO - 6);
      const y = Math.round(curva(x)) + r.entre(3, 40);
      p.circulo(x, y, r.entre(1, 3), C.morroArvore);
    }
    for (let i = 0; i < 46; i++) {
      const x = r.entre(0, PERIODO - 8);
      const y = Math.round(curva(x + 3)) + r.entre(6, 50);
      p.ret(x, y + 1, 6, 4, C.casinha);
      p.ret(x - 1, y, 8, 1, C.casinhaTelhado);
      if (r() < 0.5) p.px(x + 2, y + 2, C.janelaAcesa);
    }
  });
}

// cidade ao fundo: telhados, torres de igreja e antenas, em tons apagados
function texturaCidade(scene) {
  return criarTextura(scene, 'ita_cidade', PERIODO, ALTURA, (p) => {
    const r = sorteador(23);
    const base = 246;
    let x = 0;
    while (x < PERIODO) {
      const w = r.entre(3, 6) * 8;
      const alt = r.entre(24, 52);
      const parede = r.um(C.cidadeParedes);
      const topo = base - alt;
      p.ret(x, topo, Math.min(w, PERIODO - x), alt, parede);
      // telhado em água: uma faixa mais escura
      p.ret(x - 1, topo - 3, Math.min(w + 2, PERIODO - x), 3, C.cidadeTelhado);
      p.ret(x - 1, topo - 4, Math.min(w + 2, PERIODO - x), 1, C.cidadeContorno);
      // janelinhas
      for (let jy = topo + 6; jy < base - 8; jy += 12) {
        for (let jx = x + 4; jx < x + w - 4; jx += 9) {
          p.ret(jx, jy, 3, 5, r() < 0.35 ? C.janelaAcesa : C.cidadeContorno);
        }
      }
      x += w + r.entre(0, 6);
    }
    // igreja com duas torres (desenho genérico, não é a matriz real; ver PR)
    const igreja = (ix) => {
      const cor = '#EBD3DE';
      p.ret(ix, base - 70, 44, 70, cor);
      p.ret(ix + 4, base - 108, 10, 40, cor);
      p.ret(ix + 30, base - 108, 10, 40, cor);
      for (const tx of [ix + 4, ix + 30]) {
        p.ret(tx - 1, base - 110, 12, 2, C.cidadeContorno);
        p.ret(tx + 2, base - 118, 6, 8, C.cidadeTelhado);
        p.ret(tx + 4, base - 124, 2, 6, C.cidadeContorno);
        p.ret(tx + 3, base - 98, 4, 7, C.cidadeContorno);
      }
      p.ret(ix + 16, base - 84, 12, 2, C.cidadeTelhado);
      p.ret(ix + 18, base - 60, 8, 14, C.cidadeContorno);
      p.ret(ix + 18, base - 24, 8, 24, C.cidadeContorno);
    };
    igreja(300);
    // antena e palmeira
    p.ret(720, base - 96, 2, 96, C.cidadeContorno);
    p.ret(716, base - 80, 10, 1, C.cidadeContorno);
    p.ret(718, base - 64, 6, 1, C.cidadeContorno);
    p.px(720, base - 97, '#F25C8A');
    p.ret(0, base, PERIODO, ALTURA - base, C.cidadeContorno);
  });
}

// ---------- primeiro plano ----------

// Casa colonial (térrea ou sobrado). variante muda cores e detalhes.
function texturaCasa(scene, variante, sobrado) {
  const largura = sobrado ? 96 : 80;
  const altura = sobrado ? 112 : 72;
  return criarTextura(scene, `ita_casa_${sobrado ? 's' : 't'}${variante}`, largura, altura, (p) => {
    const r = sorteador(100 + variante * 7 + (sobrado ? 50 : 0));
    const parede = C.paredes[variante % C.paredes.length];
    const janela = C.janelas[(variante + (sobrado ? 1 : 0)) % C.janelas.length];
    const telhadoAlt = 12;
    const corpoY = telhadoAlt;
    // telhado de telha com beiral
    p.ret(2, 4, largura - 4, telhadoAlt - 4, C.telhado);
    p.ret(0, telhadoAlt - 2, largura, 3, C.telhadoSombra);
    for (let y = 5; y < telhadoAlt - 2; y += 2) {
      for (let x = 3 + (y % 4); x < largura - 3; x += 4) p.px(x, y, C.telhadoLuz);
    }
    p.ret(4, 3, largura - 8, 1, K);
    p.ret(2, 4, 1, telhadoAlt - 4, K);
    p.ret(largura - 3, 4, 1, telhadoAlt - 4, K);
    // paredes com contorno e sombra do beiral
    p.ret(3, corpoY, largura - 6, altura - corpoY, K);
    p.ret(4, corpoY, largura - 8, altura - corpoY, parede);
    p.ret(4, corpoY + 1, largura - 8, 3, C.paredeSombra);
    // cunhais (cantos brancos) e barrado embaixo
    p.ret(4, corpoY, 4, altura - corpoY, C.friso);
    p.ret(largura - 8, corpoY, 4, altura - corpoY, C.friso);
    p.ret(4, altura - 6, largura - 8, 6, C.paredeSombra);
    // janela com verga em arco e folhas de madeira coloridas
    const desenharJanela = (jx, jy, comVaranda) => {
      p.ret(jx - 2, jy - 3, 18, 26, C.friso);
      p.ret(jx, jy, 14, 20, K);
      p.ret(jx + 1, jy + 1, 12, 18, C.vidro);
      p.ret(jx + 2, jy + 2, 3, 6, C.vidroLuz);
      p.ret(jx + 6, jy + 1, 1, 18, K);
      // folhas abertas para os lados
      p.ret(jx - 6, jy, 5, 20, janela);
      p.ret(jx + 15, jy, 5, 20, janela);
      for (let y = jy + 2; y < jy + 19; y += 3) {
        p.ret(jx - 5, y, 3, 1, K);
        p.ret(jx + 16, y, 3, 1, K);
      }
      p.ret(jx - 1, jy - 4, 16, 2, C.friso);
      p.ret(jx + 2, jy - 6, 10, 2, C.friso);
      if (comVaranda) {
        p.ret(jx - 4, jy + 20, 22, 2, C.ferro);
        for (let x = jx - 4; x < jx + 18; x += 3) p.ret(x, jy + 14, 1, 6, C.ferro);
        p.ret(jx - 4, jy + 13, 22, 1, C.ferro);
      } else {
        p.ret(jx - 2, jy + 20, 18, 2, C.friso);
      }
    };
    // porta de madeira com bandeira (vidro em arco em cima)
    const desenharPorta = (dx) => {
      const topo = altura - 40;
      p.ret(dx - 2, topo - 4, 22, 44, C.friso);
      p.ret(dx, topo, 18, 40, K);
      p.ret(dx + 1, topo + 1, 16, 8, C.vidro);
      p.ret(dx + 3, topo + 2, 4, 3, C.vidroLuz);
      p.ret(dx + 1, topo + 10, 16, 30, C.madeira);
      p.ret(dx + 8, topo + 10, 1, 30, K);
      p.ret(dx + 3, topo + 13, 4, 10, C.madeiraLuz);
      p.ret(dx + 10, topo + 13, 4, 10, C.madeiraLuz);
      p.ret(dx + 3, topo + 27, 4, 10, C.madeiraLuz);
      p.ret(dx + 10, topo + 27, 4, 10, C.madeiraLuz);
      p.px(dx + 6, topo + 25, '#F2D04B');
      p.ret(dx - 2, altura - 2, 22, 2, C.pedra[2]);
    };
    if (sobrado) {
      // andar de cima com varandinhas, andar de baixo com porta e janela
      p.ret(4, 56, largura - 8, 2, C.friso);
      desenharJanela(16, 26, true);
      desenharJanela(64, 26, true);
      desenharPorta(14);
      desenharJanela(62, 72, false);
    } else {
      const portaX = r() < 0.5 ? 12 : largura - 30;
      desenharPorta(portaX);
      desenharJanela(portaX < 40 ? 50 : 18, 30, false);
    }
    // platibanda decorada (beirada de cima, comum no centro antigo)
    if (variante % 2 === 0) {
      p.ret(2, 0, largura - 4, 4, C.friso);
      p.ret(2, 0, largura - 4, 1, K);
      for (let x = 8; x < largura - 8; x += 12) p.ret(x, 1, 4, 2, parede);
    }
  });
}

// Ipê (roxo ou amarelo): árvore muito comum no sul de Minas
function texturaIpe(scene, tipo) {
  return criarTextura(scene, `ita_ipe_${tipo}`, 56, 88, (p) => {
    const [escuro, medio, claro] = C.folhas[tipo];
    const r = sorteador(tipo === 'roxo' ? 3 : 4);
    // tronco com galhos
    p.ret(25, 40, 7, 48, K);
    p.ret(26, 40, 5, 48, C.tronco);
    p.ret(27, 44, 1, 40, '#7D5236');
    p.ret(18, 44, 9, 3, C.tronco);
    p.ret(31, 38, 10, 3, C.tronco);
    // copa em bolhas sobrepostas
    const bolhas = [[28, 26, 20], [14, 34, 12], [42, 32, 12], [20, 16, 12], [38, 16, 12], [28, 10, 10]];
    for (const [x, y, rr] of bolhas) p.circulo(x, y, rr + 1, K);
    for (const [x, y, rr] of bolhas) p.circulo(x, y, rr, escuro);
    for (const [x, y, rr] of bolhas) p.circulo(x - 2, y - 2, rr - 3, medio);
    for (let i = 0; i < 70; i++) {
      const x = r.entre(10, 46);
      const y = r.entre(2, 42);
      if (p.ctx.getImageData(x, y, 1, 1).data[3] > 0) p.px(x, y, r() < 0.5 ? claro : medio);
    }
    // flores caídas no chão
    for (let i = 0; i < 10; i++) p.px(r.entre(8, 48), 86 + r.entre(0, 1), claro);
  });
}

function texturaPoste(scene) {
  return criarTextura(scene, 'ita_poste', 16, 80, (p) => {
    p.ret(6, 14, 4, 66, K);
    p.ret(7, 14, 2, 66, C.ferro);
    p.ret(4, 74, 8, 6, K);
    p.ret(5, 75, 6, 5, C.ferro);
    // luminária antiga
    p.ret(3, 2, 10, 2, K);
    p.ret(2, 4, 12, 9, K);
    p.ret(3, 4, 10, 8, '#FFF3B0');
    p.ret(4, 5, 3, 6, '#FFFFFF');
    p.ret(5, 0, 6, 2, K);
    p.ret(6, 12, 4, 2, K);
  });
}

function texturaBanco(scene) {
  return criarTextura(scene, 'ita_banco', 40, 20, (p) => {
    p.ret(2, 0, 36, 3, K);
    p.ret(3, 1, 34, 1, C.madeiraLuz);
    p.ret(2, 6, 36, 4, K);
    p.ret(3, 7, 34, 2, C.madeiraLuz);
    p.ret(4, 3, 2, 3, C.ferro);
    p.ret(34, 3, 2, 3, C.ferro);
    p.ret(4, 10, 3, 10, C.ferro);
    p.ret(33, 10, 3, 10, C.ferro);
  });
}

// Fonte da praça: 3 tiles de largura (48 px), com água em 2 quadros.
// Desenho genérico de chafariz: ainda não há foto da fonte de Itajubá em references/lugares/.
export function texturaFonte(scene) {
  return criarTexturaQuadros(scene, 'ita_fonte', 48, 48, 2, (p, q) => {
    const [pc, pm, pe] = C.pedra;
    const [ae, am, ac] = C.agua;
    // bacia de baixo
    p.ret(0, 30, 48, 18, K);
    p.ret(1, 31, 46, 16, pm);
    p.ret(1, 31, 46, 3, pc);
    p.ret(1, 44, 46, 3, pe);
    for (let x = 6; x < 46; x += 10) p.ret(x, 35, 1, 9, pe);
    // água na bacia
    p.ret(3, 28, 42, 3, ae);
    p.ret(5, 28, 38, 1, am);
    // coluna e prato de cima
    p.ret(20, 14, 8, 16, K);
    p.ret(21, 14, 6, 16, pm);
    p.ret(22, 15, 2, 14, pc);
    p.ret(12, 12, 24, 5, K);
    p.ret(13, 12, 22, 3, pc);
    p.ret(13, 15, 22, 1, pe);
    p.ret(22, 4, 4, 8, K);
    p.ret(23, 4, 2, 8, pm);
    p.ret(21, 2, 6, 3, K);
    p.ret(22, 2, 4, 2, pc);
    // jatos de água (alternam a cada quadro)
    const s = q === 0 ? 0 : 1;
    p.ret(23, 0, 2, 2, ac);
    for (const lado of [-1, 1]) {
      const bx = 24 + lado * 12;
      for (let i = 0; i < 12; i++) {
        const x = bx + lado * Math.floor(i / 3);
        const y = 17 + i;
        if ((i + s) % 3 !== 0) p.px(x, y, i % 2 ? am : ac);
      }
      p.ret(24 + lado * 3 - 1, 1 + s, 2, 1, ac);
      p.ret(24 + lado * 6 - 1, 4 + s, 2, 1, am);
      p.ret(24 + lado * 9 - 1, 8 + s, 2, 1, am);
    }
    p.ret(10 + s * 2, 27, 2, 1, ac);
    p.ret(34 - s * 2, 27, 2, 1, ac);
  });
}

// Fachada do Espaço Paula De Marco (fim da fase): rosa e lilás da escola, com placa e porta de vidro.
export function texturaFachadaEspaco(scene) {
  const t = TEXTOS.cenarios;
  return criarTextura(scene, 'ita_espaco', 128, 112, (p) => {
    p.ret(0, 8, 128, 104, K);
    p.ret(1, 9, 126, 103, '#FFC9F8');
    p.ret(1, 9, 126, 4, '#E39BDD');
    p.ret(1, 100, 126, 12, '#E39BDD');
    // platibanda lilás com os quadrados do logo
    p.ret(0, 0, 128, 10, K);
    p.ret(1, 1, 126, 8, '#9E9EFF');
    for (let x = 6; x < 124; x += 14) {
      p.ret(x, 2, 6, 6, '#6D6BD9');
      p.ret(x + 1, 3, 4, 4, '#FFB0FA');
      p.ret(x + 2, 4, 2, 2, '#F9FCBB');
    }
    // placa
    p.ret(4, 16, 120, 30, '#6D6BD9');
    p.ret(5, 17, 118, 28, '#F9FCBB');
    p.texto(t.placaEspaco1, 64, 20, '#6D6BD9', 8, '"Press Start 2P"', 'center');
    p.texto(t.placaEspaco2, 64, 31, '#6D6BD9', 12, '"Patrick Hand"', 'center');
    // porta de vidro dupla, com sapatilhas desenhadas no vidro
    p.ret(42, 56, 44, 56, K);
    p.ret(44, 58, 40, 54, '#B9C9F4');
    p.ret(63, 58, 2, 54, K);
    p.ret(46, 60, 4, 20, '#EEF3FF');
    p.ret(67, 60, 4, 20, '#EEF3FF');
    p.ret(58, 82, 2, 6, '#6D6BD9');
    p.ret(68, 82, 2, 6, '#6D6BD9');
    // laço de sapatilha em rosa no vidro
    p.ret(50, 92, 8, 3, '#FFB0FA');
    p.ret(57, 89, 3, 3, '#FFB0FA');
    p.ret(70, 92, 8, 3, '#FFB0FA');
    p.ret(68, 89, 3, 3, '#FFB0FA');
    // janelas laterais com cortina
    for (const jx of [8, 96]) {
      p.ret(jx, 58, 24, 32, K);
      p.ret(jx + 1, 59, 22, 30, '#2F2A4D');
      p.ret(jx + 1, 59, 7, 30, '#FFB0FA');
      p.ret(jx + 16, 59, 7, 30, '#FFB0FA');
      p.ret(jx + 9, 64, 6, 10, '#F9FCBB');
      p.ret(jx - 2, 90, 28, 3, '#F3E6D2');
      // vaso com flores
      p.ret(jx + 4, 93, 16, 6, '#B5543A');
      for (let x = jx + 5; x < jx + 19; x += 3) p.ret(x, 91, 2, 2, x % 2 ? '#6CC24A' : '#F9FCBB');
    }
  });
}

// ---------- montagem da fase ----------

// Topo do chão em cada coluna (linha do primeiro '#', ou -1 se for buraco)
function superficies(linhas) {
  const larg = linhas[0].length;
  const topo = [];
  for (let x = 0; x < larg; x++) {
    let achou = -1;
    for (let y = 0; y < linhas.length; y++) {
      if (linhas[y][x] === '#') {
        achou = y;
        break;
      }
    }
    topo.push(achou);
  }
  return topo;
}

// Monta o cenário de Itajubá numa cena. linhas = mapa em texto; mapa = resultado de lerMapa.
// Devolve { atualizar(camera) } para mover o parallax a cada quadro.
export function montarItajuba(scene, linhas, mapa) {
  texturaCeuTarde(scene);
  texturaSerra(scene);
  texturaMorros(scene);
  texturaCidade(scene);
  texturaFonte(scene);
  texturaFachadaEspaco(scene);
  texturaPoste(scene);
  texturaBanco(scene);
  texturaIpe(scene, 'roxo');
  texturaIpe(scene, 'amarelo');
  for (let v = 0; v < 6; v++) {
    texturaCasa(scene, v, false);
    texturaCasa(scene, v, true);
  }

  const fundo = -100; // profundidade: tudo do cenário fica atrás dos tiles (0) e do jogador
  scene.add.image(0, 0, 'ceu_tarde').setOrigin(0).setScrollFactor(0).setDepth(fundo);
  const camadas = [
    { chave: 'ita_serra', fator: 0.1 },
    { chave: 'ita_morros', fator: 0.25 },
    { chave: 'ita_cidade', fator: 0.5 },
  ].map((c, i) => ({
    ...c,
    obj: scene.add
      .tileSprite(0, 0, LARGURA, ALTURA, c.chave)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(fundo + 1 + i),
  }));

  decorar(scene, linhas, mapa, fundo + 10);

  // a água da fonte mexe
  if (!scene.anims.exists('fonte_agua')) {
    scene.anims.create({ key: 'fonte_agua', frames: [{ key: 'ita_fonte', frame: 0 }, { key: 'ita_fonte', frame: 1 }], frameRate: 4, repeat: -1 });
  }
  for (const o of mapa.objetos.filter((o) => o.tipo === 'fonte')) {
    // ancorada no canto inferior esquerdo (seção 10): o tile do 'F' é a coluna da esquerda
    scene.add.sprite(o.col * TILE, o.y, 'ita_fonte', 0).setOrigin(0, 1).setDepth(fundo + 30).play('fonte_agua');
  }
  for (const o of mapa.objetos.filter((o) => o.tipo === 'saida')) {
    // centrada na saída, mas sem passar do fim do mapa
    const x = Math.min(o.x, mapa.larguraPx - 64);
    scene.add.image(x, o.y, 'ita_espaco').setOrigin(0.5, 1).setDepth(fundo + 20);
  }

  const alturaExtra = mapa.alturaPx - ALTURA;
  return {
    atualizar(cam) {
      for (const c of camadas) {
        c.obj.tilePositionX = cam.scrollX * c.fator;
        // se o mapa for mais alto que a tela, as camadas sobem/descem um pouco com a câmera
        c.obj.y = Math.round((alturaExtra - cam.scrollY) * c.fator);
      }
    },
  };
}

// Espalha casas, árvores, postes e bancos pelo chão, e monta barracas debaixo dos toldos.
function decorar(scene, linhas, mapa, prof) {
  const topo = superficies(linhas);
  const larg = linhas[0].length;
  const ocupado = new Array(larg).fill(false);
  const r = sorteador(mapa.nome.length * 97 + larg);

  // não decorar perto da fonte, da saída nem embaixo dos toldos
  const reservar = (c0, c1) => {
    for (let c = Math.max(0, c0); c <= Math.min(larg - 1, c1); c++) ocupado[c] = true;
  };
  for (const o of mapa.objetos) {
    if (o.tipo === 'fonte') reservar(o.col - 1, o.col + 3);
    if (o.tipo === 'saida') reservar(o.col - 5, o.col + 4);
  }
  reservar(mapa.inicio.col - 1, mapa.inicio.col + 1);

  // barracas: cada sequência de 'T' vira o teto de uma barraca de feira
  linhas.forEach((linha, y) => {
    let x = 0;
    while (x < larg) {
      if (linha[x] !== 'T') {
        x++;
        continue;
      }
      let fim = x;
      while (fim + 1 < larg && linha[fim + 1] === 'T') fim++;
      barraca(scene, linhas, x, fim, y, topo, prof + 5, r);
      reservar(x - 1, fim + 1);
      x = fim + 1;
    }
  });

  // itens de decoração: [textura, largura em tiles]
  const casas = [];
  for (let v = 0; v < 6; v++) casas.push([`ita_casa_t${v}`, 5], [`ita_casa_s${v}`, 6]);
  const miudos = [['ita_ipe_roxo', 4], ['ita_ipe_amarelo', 4], ['ita_poste', 1], ['ita_banco', 3]];

  // casas só no nível principal da rua (o mais comum); em cima de muros e degraus, só árvore, poste e banco
  const contagem = {};
  topo.forEach((t) => t > 0 && (contagem[t] = (contagem[t] || 0) + 1));
  const rua = Number(Object.entries(contagem).sort((a, b) => b[1] - a[1])[0][0]);

  let c = 0;
  let vezCasa = true;
  while (c < larg) {
    if (topo[c] !== rua) vezCasa = false;
    const [chave, w] = vezCasa ? r.um(casas) : r.um(miudos);
    const cols = Array.from({ length: w }, (_, i) => c + i);
    const linhaChao = topo[c];
    const cabe =
      c + w <= larg &&
      linhaChao > 0 &&
      cols.every((cc) => topo[cc] === linhaChao && !ocupado[cc]) &&
      // não encostar em muro mais alto logo ao lado (a casa ficaria "dentro" do muro)
      ![c - 1, c + w].some((cc) => cc >= 0 && cc < larg && topo[cc] >= 0 && topo[cc] < linhaChao);
    if (!cabe) {
      c++;
      continue;
    }
    const tex = scene.textures.get(chave).getSourceImage();
    const x = c * TILE + (w * TILE - tex.width) / 2;
    scene.add.image(Math.round(x), linhaChao * TILE, chave).setOrigin(0, 1).setDepth(prof + (vezCasa ? 0 : 2));
    cols.forEach((cc) => (ocupado[cc] = true));
    c += w + (vezCasa ? r.entre(0, 1) : r.entre(1, 2));
    vezCasa = !vezCasa || r() < 0.25;
  }
}

// Barraca de feira debaixo de um toldo: postes de madeira e balcão com frutas e flores.
function barraca(scene, linhas, x0, x1, linhaToldo, topo, prof, r) {
  // chão embaixo do toldo (o primeiro '#' abaixo dele)
  let chao = -1;
  for (let y = linhaToldo + 1; y < linhas.length; y++) {
    if (linhas[y][x0] === '#') {
      chao = y;
      break;
    }
  }
  if (chao < 0) return;
  const g = scene.add.graphics().setDepth(prof);
  const yTopo = linhaToldo * TILE + 12;
  const yChao = chao * TILE;
  const esq = x0 * TILE + 2;
  const dir = (x1 + 1) * TILE - 6;
  const f = (cor, x, y, w, h) => g.fillStyle(Number('0x' + cor.slice(1)), 1).fillRect(x, y, w, h);
  // postes
  for (const px of [esq, dir]) {
    f(K, px, yTopo, 4, yChao - yTopo);
    f(C.madeiraLuz, px + 1, yTopo, 2, yChao - yTopo);
  }
  // balcão
  const bw = dir - esq - 4;
  const by = yChao - 18;
  f(K, esq + 4, by, bw, 18);
  f(C.madeira, esq + 5, by + 1, bw - 2, 17);
  f(C.madeiraLuz, esq + 5, by + 1, bw - 2, 3);
  for (let x = esq + 9; x < esq + bw; x += 8) f(K, x, by + 5, 1, 13);
  // cestos com frutas e flores (cores variadas, sem repetir a maçã vermelha do jogo)
  const frutas = ['#F28C28', '#F2D04B', '#6CC24A', '#FFB0FA', '#B06AD6'];
  for (let x = esq + 6; x < esq + bw - 6; x += 10) {
    f('#C98D52', x, by - 4, 9, 4);
    const cor = r.um(frutas);
    f(cor, x + 1, by - 7, 3, 3);
    f(cor, x + 5, by - 7, 3, 3);
    f(cor, x + 3, by - 9, 3, 3);
  }
}
