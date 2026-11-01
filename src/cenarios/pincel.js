// Ferramentas para desenhar cenários em pixel art direto num canvas (sem arquivos de imagem: peso zero no site).
//
// Tudo é desenhado com retângulos inteiros, para o pixel ficar nítido. Sorteios usam uma semente fixa,
// então o cenário sai sempre igual (não muda a cada vez que a página abre).

// Gerador de números "aleatórios" previsível (mulberry32).
export function sorteador(semente = 1) {
  let a = semente >>> 0;
  const r = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.entre = (min, max) => min + Math.floor(r() * (max - min + 1));
  r.um = (lista) => lista[Math.floor(r() * lista.length)];
  return r;
}

// Cria (uma vez só) uma textura de canvas e entrega o pincel para desenhar nela.
export function criarTextura(scene, chave, largura, altura, desenhar) {
  if (scene.textures.exists(chave)) return chave;
  const tex = scene.textures.createCanvas(chave, largura, altura);
  const p = new Pincel(tex.getContext(), largura, altura);
  desenhar(p);
  tex.refresh();
  return chave;
}

// Igual a criarTextura, mas a textura tem vários quadros do mesmo tamanho lado a lado (0, 1, 2...).
export function criarTexturaQuadros(scene, chave, largura, altura, n, desenharQuadro) {
  if (scene.textures.exists(chave)) return chave;
  const tex = scene.textures.createCanvas(chave, largura * n, altura);
  const ctx = tex.getContext();
  for (let i = 0; i < n; i++) {
    ctx.save();
    ctx.translate(i * largura, 0);
    desenharQuadro(new Pincel(ctx, largura, altura), i);
    ctx.restore();
  }
  tex.refresh();
  for (let i = 0; i < n; i++) tex.add(i, 0, i * largura, 0, largura, altura);
  return chave;
}

export class Pincel {
  constructor(ctx, largura, altura) {
    this.ctx = ctx;
    this.w = largura;
    this.h = altura;
  }

  ret(x, y, w, h, cor) {
    if (w <= 0 || h <= 0) return this;
    this.ctx.fillStyle = cor;
    this.ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    return this;
  }

  px(x, y, cor) {
    return this.ret(x, y, 1, 1, cor);
  }

  // retângulo com contorno de 1 px
  caixa(x, y, w, h, cor, contorno) {
    this.ret(x, y, w, h, contorno);
    return this.ret(x + 1, y + 1, w - 2, h - 2, cor);
  }

  // retângulo de cantos arredondados (raio pequeno, em degraus de pixel)
  arredondado(x, y, w, h, r, cor) {
    for (let i = 0; i < r; i++) {
      const recuo = r - Math.round(Math.sqrt(r * r - (r - i - 0.5) ** 2));
      this.ret(x + recuo, y + i, w - recuo * 2, 1, cor);
      this.ret(x + recuo, y + h - 1 - i, w - recuo * 2, 1, cor);
    }
    return this.ret(x, y + r, w, h - r * 2, cor);
  }

  // círculo cheio (pixelado)
  circulo(cx, cy, r, cor) {
    for (let y = -r; y <= r; y++) {
      const meia = Math.floor(Math.sqrt(r * r - y * y) + 0.3);
      this.ret(cx - meia, cy + y, meia * 2 + 1, 1, cor);
    }
    return this;
  }

  // elipse cheia
  elipse(cx, cy, rx, ry, cor) {
    for (let y = -ry; y <= ry; y++) {
      const meia = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))) + 0.3);
      this.ret(cx - meia, cy + y, meia * 2 + 1, 1, cor);
    }
    return this;
  }

  // degradê vertical em faixas, com pontilhado na passagem de uma cor para a outra (cara de 16 bits)
  faixas(x, y, w, h, cores) {
    const n = cores.length;
    const altFaixa = h / n;
    for (let i = 0; i < n; i++) {
      const y0 = Math.round(y + i * altFaixa);
      const y1 = Math.round(y + (i + 1) * altFaixa);
      this.ret(x, y0, w, y1 - y0, cores[i]);
      if (i > 0) {
        // 2 linhas de pontilhado com a cor de cima
        for (let xx = x; xx < x + w; xx++) {
          if (xx % 2 === 0) this.px(xx, y0, cores[i - 1]);
          if (xx % 4 === 1) this.px(xx, y0 + 1, cores[i - 1]);
        }
      }
    }
    return this;
  }

  // silhueta de serra: preenche de baixo até a curva alturaEm(x). Repete sem emenda se a curva repetir.
  silhueta(alturaEm, cor, x0 = 0, x1 = this.w, base = this.h) {
    for (let x = x0; x < x1; x++) {
      const topo = Math.round(alturaEm(x));
      this.ret(x, topo, 1, base - topo, cor);
    }
    return this;
  }

  // texto com fonte do jogo (já carregada antes do jogo começar)
  texto(t, x, y, cor, tamanho = 8, fonte = '"Press Start 2P"', alinhar = 'left') {
    const ctx = this.ctx;
    ctx.font = `${tamanho}px ${fonte}`;
    ctx.textBaseline = 'top';
    ctx.textAlign = alinhar;
    ctx.fillStyle = cor;
    ctx.fillText(t, x, y);
    ctx.textAlign = 'left';
    return this;
  }
}

// Curva periódica (soma de senos) que fecha no período, para camadas que se repetem sem emenda.
export function curvaPeriodica(periodo, base, ondas) {
  return (x) => base - ondas.reduce((s, [freq, amp, fase]) => s + amp * Math.sin((x / periodo) * Math.PI * 2 * freq + fase), 0);
}
