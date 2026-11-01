// Estilo de menus, painéis, botões e HUD, na paleta da escola (CLAUDE.md, seção 7).
//
// Painel: fundo lilás, borda roxa, filete interno claro e, nos cantos, os quadrados concêntricos do logo.
// Botão: rosa (principal), amarelo ou verde, com sombra roxa embaixo; afunda ao tocar.
// As texturas são desenhadas em código e criadas uma vez por tamanho.
import { CORES_CSS, FONTES } from '../config.js';
import { criarTextura, criarTexturaQuadros } from '../cenarios/pincel.js';

const ROXO_ESCURO = '#4B49A8';
const CLARO = '#D6D6FF'; // lilás bem claro (miolo dos painéis)
// cor de texto sobre painel: roxo da escola um pouco mais escuro, para ler bem no celular
export const TEXTO_PAINEL = ROXO_ESCURO;

const CORES_BOTAO = {
  rosa: { fundo: CORES_CSS.rosa, luz: '#FFD6FC', sombra: '#D57FCF', texto: CORES_CSS.roxo },
  amarelo: { fundo: CORES_CSS.amarelo, luz: '#FFFFFF', sombra: '#D9D59A', texto: CORES_CSS.roxo },
  verde: { fundo: CORES_CSS.verde, luz: '#9FDC7C', sombra: '#47913A', texto: CORES_CSS.branco },
  lilas: { fundo: CORES_CSS.lilas, luz: '#C3C3FF', sombra: '#7F7FE0', texto: CORES_CSS.branco },
};

// quadradinhos concêntricos do logo (detalhe dos cantos)
function marca(p, x, y) {
  p.ret(x, y, 7, 7, CORES_CSS.roxo);
  p.ret(x + 1, y + 1, 5, 5, CORES_CSS.rosa);
  p.ret(x + 2, y + 2, 3, 3, CORES_CSS.amarelo);
  p.px(x + 3, y + 3, CORES_CSS.verde);
}

export function texturaPainel(scene, w, h) {
  return criarTextura(scene, `ui_painel_${w}x${h}`, w, h, (p) => {
    p.arredondado(0, 3, w, h - 3, 6, ROXO_ESCURO); // sombra
    p.arredondado(0, 0, w, h - 3, 6, CORES_CSS.roxo);
    p.arredondado(2, 2, w - 4, h - 7, 5, CORES_CSS.lilas);
    // miolo mais claro, para o texto roxo ter contraste
    p.arredondado(8, 8, w - 16, h - 19, 3, CLARO);
    // filete interno claro
    p.ret(6, 5, w - 12, 1, '#C3C3FF');
    p.ret(6, h - 9, w - 12, 1, '#8585F0');
    p.ret(5, 6, 1, h - 15, '#C3C3FF');
    p.ret(w - 6, 6, 1, h - 15, '#8585F0');
    marca(p, 4, 4);
    marca(p, w - 11, 4);
    marca(p, 4, h - 14);
    marca(p, w - 11, h - 14);
  });
}

// Painel na tela (imagem). x, y = centro.
export function criarPainel(scene, x, y, w, h) {
  return scene.add.image(x, y, texturaPainel(scene, w, h));
}

function texturaBotao(scene, w, h, cor) {
  const c = CORES_BOTAO[cor];
  // quadro 0 = normal, quadro 1 = apertado (sem sombra, 2 px mais baixo)
  return criarTexturaQuadros(scene, `ui_botao_${w}x${h}_${cor}`, w, h, 2, (p, q) => {
    const desce = q === 1 ? 3 : 0;
    if (q === 0) p.arredondado(0, 3, w, h - 3, 5, ROXO_ESCURO);
    p.arredondado(0, desce, w, h - 3, 5, CORES_CSS.roxo);
    p.arredondado(2, desce + 2, w - 4, h - 7, 4, c.fundo);
    p.ret(5, desce + 3, w - 10, 2, c.luz);
    p.ret(5, desce + h - 8, w - 10, 1, c.sombra);
  });
}

// Botão com texto. Devolve um container; aoTocar é chamado quando o dedo sai do botão
// (o navegador só libera tela cheia, WhatsApp e compartilhar nesse momento).
export function criarBotao(scene, x, y, texto, { largura = 140, altura = 30, cor = 'rosa', tamanho = 8, aoTocar } = {}) {
  const chave = texturaBotao(scene, largura, altura, cor);
  const fundo = scene.add.image(0, 0, chave, 0);
  const rotulo = scene.add
    .text(0, -2, texto, { fontFamily: FONTES.titulo, fontSize: `${tamanho}px`, color: CORES_BOTAO[cor].texto })
    .setOrigin(0.5);
  const botao = scene.add.container(x, y, [fundo, rotulo]).setSize(largura, altura);
  botao.setInteractive({ useHandCursor: true });
  const soltar = () => {
    fundo.setFrame(0);
    rotulo.y = -2;
  };
  botao.on('pointerdown', () => {
    fundo.setFrame(1);
    rotulo.y = 1;
  });
  botao.on('pointerout', soltar);
  botao.on('pointerup', () => {
    soltar();
    aoTocar?.();
  });
  return botao;
}

// Título com sombra roxa (Press Start 2P), usado em menus e telas de texto.
export function criarTitulo(scene, x, y, texto, tamanho = 16, cor = CORES_CSS.branco) {
  return scene.add
    .text(x, y, texto, { fontFamily: FONTES.titulo, fontSize: `${tamanho}px`, color: cor })
    .setOrigin(0.5)
    .setShadow(2, 2, CORES_CSS.roxo, 0, false, true);
}

// Fundo do HUD: pílula lilás semitransparente com borda roxa.
export function texturaPilulaHud(scene, w, h = 18) {
  return criarTextura(scene, `ui_hud_${w}x${h}`, w, h, (p) => {
    p.arredondado(0, 0, w, h, Math.floor(h / 2) - 1, 'rgba(109,107,217,0.9)');
    p.arredondado(1, 1, w - 2, h - 2, Math.floor(h / 2) - 2, 'rgba(158,158,255,0.85)');
  });
}
