"""Prévia de aprovação do novo visual suave (Fase 1, Itajubá) — sem tocar no código do jogo.

Monta uma cena 480x270 em PIL usando os tiles novos (gerar_tiles_suave.py) e o fundo suavizado
medido em references/estilo/sprites-spritedatabase/aladdin-snes/AladdinTown.gif:
- céu em degradê quente com bandas largas (dither), sol baixo;
- morros distantes em silhueta roxa clara;
- casario de Itajubá redesenhado em tons terrosos, recortado contra o céu (sem "parede" sólida);
- chão de areia compactada SEM grade de tijolos, bordas arredondadas;
- toldo de lona listrada com gomos;
- Aladdin 48x64 da Etapa 8.0 em pé no chão, na escala real.

Uso: python3 ferramentas/arte/previa_suave.py <repo> [pasta_saida]
Gera previas: ref_x_novo.png (referência SNES x nossa prévia) e cena-suave.png.
"""
import sys, os, random, re
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
import gerar_tiles_suave as GT

LARG, ALT = 480, 270
TILE = 16
CHAO_LIN = 15  # linha do mapa onde o topo do chão começa (igual ao ITAJUBA atual)
CHAO_Y = CHAO_LIN * TILE  # 240


def hex2rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


PAL = {k: hex2rgb(v) for k, v in GT.PALETA.items()}


def tile_img(matriz):
    im = Image.new('RGBA', (TILE, TILE), (0, 0, 0, 0))
    px = im.load()
    for y, lin in enumerate(matriz):
        for x, c in enumerate(lin):
            if c != '.':
                px[x, y] = PAL[c] + (255,)
    return im


# ---------------------------------------------------------------- céu

def ceu():
    im = Image.new('RGB', (LARG, ALT))
    d = ImageDraw.Draw(im)
    faixas = [  # (y0, y1, cor) — degradê largo do entardecer, medido na referência (terra quente + pêssego)
        (0, 60, (141, 121, 196)),   # lilás alto
        (60, 100, (176, 128, 186)),
        (100, 140, (214, 141, 150)),
        (140, 175, (238, 160, 118)),
        (175, 210, (247, 190, 122)),
        (210, ALT, (250, 209, 146)),
    ]
    for y0, y1, c in faixas:
        d.rectangle([0, y0, LARG, y1], fill=c)
    # dither leve entre as faixas para não parecer blocos duros
    rnd = random.Random(4)
    px = im.load()
    for (y0, y1, c) in faixas:
        yy = y0
        if yy == 0:
            continue
        outra = faixas[faixas.index((y0, y1, c)) - 1][2]
        for x in range(LARG):
            if rnd.random() < 0.5:
                px[x, yy] = outra
            if rnd.random() < 0.3 and yy + 1 < ALT:
                px[x, yy + 1] = outra if rnd.random() < 0.5 else c
    # sol baixo, halo suave (2 tons)
    sx, sy = 380, 150
    for r, cor in ((26, (255, 224, 150)), (18, (255, 238, 178)), (12, (255, 248, 205))):
        d.ellipse([sx - r, sy - r, sx + r, sy + r], fill=cor)
    return im


# ---------------------------------------------------------------- morros

def morros(base_im):
    d = ImageDraw.Draw(base_im)
    w = base_im.size[0]
    rnd = random.Random(9)

    def crista(base, amp, seed):
        ys = []
        r = random.Random(seed)
        y = base
        x = 0
        pts = [(0, base - r.randint(0, amp))]
        while x < w:
            x += rnd.randrange(28, 60)
            pts.append((min(x, w), base - rnd.randrange(0, amp)))
        return pts

    for (base, amp, cor) in ((176, 26, (203, 150, 170)), (196, 20, (178, 122, 152))):
        pts = [(0, ALT), (0, base)] + crista(base, amp, base) + [(w, base), (w, ALT)]
        d.polygon(pts, fill=cor)
    return base_im


# ---------------------------------------------------------------- casario (camada média)

PAREDES = [(243, 224, 190), (246, 210, 163), (238, 186, 158), (232, 199, 172), (246, 222, 186)]
TELHOS = [(196, 106, 66), (178, 92, 58)]
SOMBRA = (0.14)


def casas(base_im, y_base):
    """Sobrados coloniais pequenos e claros, meio lavados (camada do meio do parallax)."""
    d = ImageDraw.Draw(base_im)
    rnd = random.Random(3)
    x = -10
    i = 0
    while x < base_im.size[0] + 20:
        larg = rnd.choice([40, 52, 34, 60])
        alt = rnd.choice([40, 52, 34, 46])
        topo = y_base - alt
        parede = PAREDES[i % len(PAREDES)]
        d.rectangle([x, topo, x + larg, y_base], fill=parede)
        # telhado de barro com beiral que sobra nas laterais
        telho = TELHOS[i % 2]
        d.polygon([(x - 3, topo), (x + 7, topo - 9), (x + larg - 7, topo - 9), (x + larg + 3, topo)], fill=telho)
        d.rectangle([x - 3, topo, x + larg + 3, topo + 2], fill=(154, 76, 48))
        # janelas: só a moldura clara e vão escuro (densidade baixa, como na referência)
        n = max(2, larg // 20)
        for c in range(n):
            jx = x + int(((c + 0.5) * larg) / n) - 4
            jy = topo + 10
            d.rectangle([jx, jy, jx + 8, jy + 10], fill=(120, 84, 70))
            d.rectangle([jx, jy, jx + 8, jy + 2], fill=(96, 64, 54))
        # sombra lateral direita (luz vem da esquerda)
        s = ImageDraw.Draw(base_im)
        d.rectangle([x + larg - 4, topo + 2, x + larg, y_base], fill=tuple(int(v * (1 - SOMBRA)) for v in parede))
        x += larg + rnd.choice([2, 6, 10])
        i += 1
    # velas/luzes quentes pequenas (arcos de luz da feira ao longe)
    return base_im


# ---------------------------------------------------------------- barraca completa

def barraca():
    """Barraca da feira: toldo novo + balcão de madeira + frutas, tudo combinando com o tile."""
    im = Image.new('RGBA', (48, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # postes
    for xx in (2, 44):
        d.rectangle([xx, 10, xx + 3, 60], fill=(124, 85, 48))
        d.rectangle([xx, 10, xx + 1, 60], fill=(160, 116, 70))
    # balcão
    d.rectangle([0, 42, 47, 58], fill=(140, 96, 56))
    d.rectangle([0, 42, 47, 45], fill=(180, 130, 80))
    d.rectangle([0, 55, 47, 58], fill=(104, 70, 40))
    # frutas
    rnd = random.Random(7)
    cores = [(224, 84, 58), (247, 164, 58), (108, 194, 74)]
    for fx in range(4, 44, 7):
        c = cores[rnd.randrange(3)]
        d.ellipse([fx, 34, fx + 6, 40], fill=c)
        d.ellipse([fx + 1, 35, fx + 3, 37], fill=tuple(min(255, v + 40) for v in c))
    # toldo por cima (3 tiles)
    td = tile_img(GT.TILES['toldo'])
    for k in range(3):
        im.alpha_composite(td, (k * 16, 0))
    return im


def carregar_matrizes(caminho):
    """Lê um arquivo JS de arte em matriz (PALETA + blocos 'nome': [ 'linha', ... ]) em Python."""
    texto = open(caminho, encoding='utf-8').read()
    pal_src = re.search(r"PALETA\s*=\s*\{(.*)\};", texto, re.S).group(1)
    pal = dict(re.findall(r"'(.)':\s*'(#[0-9A-Fa-f]{6})'", pal_src))
    corpo = re.search(r"QUADROS\s*=\s*\{(.*)\n\};", texto, re.S).group(1)
    frames = {}
    for key in re.finditer(r"^  (\w+): \[\s*\n(.*?)\n  \],", corpo, re.M | re.S):
        linhas = re.findall(r"'([.\w]+)'", key.group(2))
        if linhas:
            frames[key.group(1)] = linhas
    return pal, frames


def jogador_frame(repo):
    try:
        pal, frames = carregar_matrizes(os.path.join(repo, 'src/art/jogador.js'))
        linhas = frames.get('parado1')
        w = len(linhas[0]); h = len(linhas)
        im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        px = im.load()
        for y, lin in enumerate(linhas):
            for x, c in enumerate(lin):
                if c != '.' and c in pal:
                    px[x, y] = hex2rgb(pal[c]) + (255,)
        return im
    except Exception as e:
        print('aviso: jogador não carregado:', e)
        return None


# ---------------------------------------------------------------- cena

def montar_cena(repo):
    img = ceu()
    morros(img)

    # camada das casas: desenhada numa faixa RGBA recortada contra o céu
    faixa_alt = 120
    tmp = Image.new('RGB', (LARG, faixa_alt), (0, 0, 0))
    casas(tmp, faixa_alt)
    datas = list(tmp.getdata())
    masc = Image.new('L', tmp.size)
    m = masc.load()
    for yy in range(faixa_alt):
        for xx in range(LARG):
            m[xx, yy] = 255 if datas[yy * LARG + xx] != (0, 0, 0) else 0
    img.paste(tmp, (0, CHAO_Y - faixa_alt - 4), masc)

    d = ImageDraw.Draw(img)
    t_topo = tile_img(GT.TILES['chaoTopo']).convert('RGB')
    t_corpo = tile_img(GT.TILES['chao']).convert('RGB')
    t_plat = tile_img(GT.TILES['plataforma']).convert('RGB')

    # chão: topo + corpo; buraco entre colunas 84..86 como no mapa ITAJUBA atual
    for col in range(LARG // TILE + 1):
        if 84 <= col <= 87:
            continue
        img.paste(t_topo, (col * TILE, CHAO_Y))
        img.paste(t_corpo, (col * TILE, CHAO_Y + TILE))
        img.paste(t_corpo, (col * TILE, CHAO_Y + 2 * TILE))
    # paredes do buraco: areia mais escura exposta, topo arredondado
    for bx in (84 * TILE, 88 * TILE - 4):
        d.rectangle([bx, CHAO_Y, bx + 4, CHAO_Y + 30], fill=(178, 122, 74))
        d.rectangle([bx, CHAO_Y, bx + 4, CHAO_Y + 2], fill=(202, 150, 96))

    # plataforma de madeira flutuante (varanda) à direita
    for col in range(12):
        img.paste(t_plat, (250 + col * TILE, 150))

    # barracas da feira
    b = barraca()
    img.paste(b.convert('RGB'), (96, CHAO_Y - 64), b.split()[3])
    img.paste(b.convert('RGB'), (208, CHAO_Y - 64), b.split()[3])

    # sombra de contato leve sob os objetos
    d.rectangle([96, CHAO_Y, 144, CHAO_Y + 2], fill=(196, 158, 96))
    d.rectangle([208, CHAO_Y, 256, CHAO_Y + 2], fill=(196, 158, 96))

    # fonte da praça (silhueta simples de pedra clara com água)
    fx = 400
    d.rectangle([fx, CHAO_Y - 14, fx + 56, CHAO_Y], fill=(206, 176, 132))
    d.rectangle([fx, CHAO_Y - 14, fx + 56, CHAO_Y - 11], fill=(232, 206, 158))
    d.rectangle([fx + 24, CHAO_Y - 34, fx + 30, CHAO_Y - 14], fill=(206, 176, 132))
    d.ellipse([fx + 16, CHAO_Y - 40, fx + 38, CHAO_Y - 32], fill=(232, 206, 158))
    d.rectangle([fx + 2, CHAO_Y - 12, fx + 54, CHAO_Y - 6], fill=(122, 186, 206))
    d.rectangle([fx + 6, CHAO_Y - 10, fx + 14, CHAO_Y - 8], fill=(196, 232, 240))

    # jogador na escala real
    pj = jogador_frame(repo)
    if pj:
        img.paste(pj.convert('RGB'), (40, CHAO_Y - 64), pj.split()[3])
        d.ellipse([44, CHAO_Y - 2, 84, CHAO_Y + 3], fill=(196, 158, 96))

    return img


def montagens(repo, saida):
    cena = montar_cena(repo).resize((LARG * 2, ALT * 2), Image.NEAREST)
    cena.save(os.path.join(saida, 'cena-suave-grande.png'))
    cena.resize((LARG, ALT)).save(os.path.join(saida, 'cena-suave.png'))

    # comparação com o antes (tiles de tijolo antigos ainda no git) — usar imagem salva hoje?
    # prancha: referência SNES x nova prévia, mesma altura
    ref = Image.open(os.path.join(repo, 'references/estilo/sprites-spritedatabase/aladdin-snes/AladdinTown.gif')).convert('RGB')
    ref = ref.crop((0, 0, 390, 214)).resize((int(390 * (ALT * 2 / 214)), ALT * 2), Image.NEAREST)
    wref, _ = ref.size
    board = Image.new('RGB', (wref + LARG * 2 + 12, ALT * 2 + 22), (46, 26, 51))
    board.paste(ref, (0, 22))
    board.paste(cena, (wref + 12, 22))
    d = ImageDraw.Draw(board)
    d.text((4, 6), 'REFERENCIA SNES (AladdinTown)', fill=(255, 255, 255))
    d.text((wref + 16, 6), 'NOSSA PREVIA - estilo suave', fill=(255, 240, 180))
    board.save(os.path.join(saida, 'ref_x_novo.png'))

    # amostra dos tiles ampliada
    nomes = ['chaoTopo', 'chao', 'plataforma', 'toldo']
    esc = 8
    big = Image.new('RGB', (len(nomes) * (TILE + 2) * esc, TILE * esc), (158, 158, 255))
    for i, n in enumerate(nomes):
        t = tile_img(GT.TILES[n]).convert('RGB').resize((TILE * esc, TILE * esc), Image.NEAREST)
        big.paste(t, (i * (TILE + 2) * esc, 0))
    big.save(os.path.join(saida, 'tiles-suave-zoom.png'))
    print('gerado:', os.listdir(saida))


if __name__ == '__main__':
    repo = sys.argv[1] if len(sys.argv) > 1 else '/workspace'
    saida = sys.argv[2] if len(sys.argv) > 2 else os.path.join(repo, 'ferramentas/arte/previas')
    os.makedirs(saida, exist_ok=True)
    montagens(repo, saida)
