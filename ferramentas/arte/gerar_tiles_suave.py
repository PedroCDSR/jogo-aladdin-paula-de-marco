"""Gera os tiles 16x16 no estilo suave do Aladdin de SNES (Fase 1, Itajubá).

Medidas tiradas de references/estilo/sprites-spritedatabase/aladdin-snes/AladdinTown.gif:
- o chão de areia compactada NÃO tem grade de tijolos: é um tom de base com manchas pequenas
  (±15% de brilho), clareira no topo (2 px) e escurecimento gradual para baixo;
- bordas arredondadas nos blocos sólidos (canto "comido" em diagonal, sem contorno preto);
- toldo de pano com gomos redondos e ondas na barra;
- plataforma = viga de madeira clara que só aparece onde o mapa pede.

Uso: python3 ferramentas/arte/gerar_tiles_suave.py <repo> [pasta_previa]
Escreve src/art/tiles.js (matriz de texto, CLAUDE.md seção 7). Editável à mão.
"""
import sys, random

T = 16
PALETA = {
    'k': '#2E1A33',  # contorno (quase não usado aqui)
    '1': '#FAE9B4',  # areia clareada (topo iluminado)
    '2': '#F0D896',  # areia luz
    '3': '#E4C381',  # areia base (média)
    '4': '#CCA664',  # areia sombra
    '5': '#B08A50',  # areia fundo do bloco
    't': '#C89257',  # pedra da calçada, luz
    'u': '#A2713F',  # pedra da calçada, base
    's': '#7C5530',  # pedra da calçada, sombra / rejunte
    'l': '#DDA46A',  # madeira clara
    'w': '#B7793F',  # madeira
    'W': '#7E4D25',  # madeira escura
    'r': '#FFB0FA',  # toldo rosa (escola)
    'R': '#D57FCF',  # toldo rosa sombra
    'v': '#F9FCBB',  # toldo amarelo claro (escola)
    'V': '#D9D59A',  # toldo amarelo sombra
}


def novo():
    return [['.'] * T for _ in range(T)]


def hex2rgb(cod):
    """Aceita o caractere da PALETA ou um hex direto."""
    h = PALETA[cod] if cod in PALETA else cod
    return tuple(int(h[j:j + 2], 16) for j in (1, 3, 5))


def misturar(cor_base, cor_alvo, t):
    a, b = hex2rgb(PALETA[cor_base]), hex2rgb(PALETA[cor_alvo])
    r = tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))
    # aproxima da cor PALETA mais próxima entre as usadas no tile (mantém paleta fechada)
    melhor, dmin = cor_base, None
    for nome in ('1', '2', '3', '4', '5'):
        c = hex2rgb(PALETA[nome])
        d = sum((c[i] - r[i]) ** 2 for i in range(3))
        if dmin is None or d < dmin:
            melhor, dmin = nome, d
    return melhor


# ------------------------------------------------------------------ areia

def areia(m, y0, y1, rnd, topo_claro=True):
    """Preenche [y0, y1) com areia: base 3, manchas suaves, degradê vertical de 1 tom."""
    for y in range(y0, y1):
        prof = (y - y0) / max(1, y1 - y0 - 1)  # 0 no topo, 1 embaixo
        base = '2' if (prof < 0.25 and topo_claro) else ('3' if prof < 0.75 else '4')
        for x in range(T):
            c = base
            v = rnd.random()
            if v < 0.10:
                c = misturar(base, '4', 0.6)          # mancha escura
            elif v < 0.18:
                c = misturar(base, '1', 0.7)          # grão claro
            m[y][x] = c


def chao_topo():
    """Topo do chão: 2 px de clareira, bordas arredondadas dos dois lados, corpo de areia."""
    rnd = random.Random(11)
    m = novo()
    areia(m, 0, T, rnd)
    # clareira do topo (sol poente batendo de cima)
    for x in range(T):
        m[0][x] = '1'
        m[1][x] = '1' if rnd.random() > 0.25 else '2'
    # arredonda os cantos de cima: canto "comido" na diagonal (estilo SNES, sem contorno preto)
    m[0][0] = '.'
    m[0][T - 1] = '.'
    m[1][0] = '.'
    m[1][T - 1] = '.'
    # pontinho de cascalho encostando no chão (densidade baixa, como na referência)
    for _ in range(3):
        x, y = rnd.randrange(2, T - 2), rnd.randrange(6, T)
        m[y][x] = '4'
        if y + 1 < T:
            m[y + 1][x] = '5'
    return m


def chao():
    """Corpo do bloco: areia um pouco mais funda, sem rejunte; escurece no fim do tile."""
    rnd = random.Random(23)
    m = novo()
    areia(m, 0, T, rnd, topo_claro=False)
    # transição suave para o fundo do bloco (sem linha dura)
    for x in range(T):
        m[T - 1][x] = misturar('4', '5', 0.7)
    return m


def calcada_topo():
    """Calçada de pedras arredondadas (praça da fonte): fileira de pedras lisas, juntas finas."""
    rnd = random.Random(5)
    m = novo()
    areia(m, 0, T, rnd)
    # duas fiadas de pedra, topo com borda arredondada
    for x in range(T):
        m[0][x] = '.'
    for y in range(1, 7):
        for x in range(T):
            m[y][x] = 't' if y <= 3 else 'u'
    for x in range(T):
        m[1][x] = 't'
        m[6][x] = 's'
    # juntas verticais a cada ~8 px, deslocadas na segunda fiada
    for x in (7, 15):
        for y in range(2, 4):
            m[y][x] = 's'
    for x in (3, 11):
        for y in range(4, 6):
            m[y][x] = 's'
    # cantos das pedras arredondados (pixel diagonal "comido")
    for x in (0, 7, 15):
        m[1][x] = '.' if x == 0 else m[1][x]
    m[1][0] = 't'
    for y in range(2, 6):
        for x in range(T):
            if rnd.random() < 0.06:
                m[y][x] = 't' if m[y][x] == 'u' else 'u'
    return m


# ------------------------------------------------------------------ toldo

def toldo():
    """Toldo de barraca: lona listrada rosa/amarela com gomos, barra ondulada e franja."""
    m = novo()
    for y in range(0, 10):
        for x in range(T):
            listra = (x // 4) % 2
            # sombreado do gozo: mais escuro nas laterais de cada listra
            gx = x % 4
            esc = gx in (0, 3)
            if listra:
                m[y][x] = 'R' if (esc or y >= 7) else 'r'
            else:
                m[y][x] = 'V' if (esc or y >= 7) else 'v'
    for x in range(T):
        m[0][x] = 'k'
        # barra de baixo em ondas (gomos de 4 px descendo alternados)
        fundo = 10 + (1 if x % 4 in (1, 2) else 0)
        for y in range(10, fundo):
            m[y][x] = 'R' if (x // 4) % 2 else 'V'
        m[fundo][x] = 'k'
        # franja: pingo de tecido alternado sob a onda
        if x % 4 in (1, 2) and fundo + 1 < T:
            m[fundo + 1][x] = ('R', 'r', 'V', 'v')[(x // 4) % 2 * 2 + (0 if x % 4 == 1 else 1)]
    return m


# ------------------------------------------------------------------ plataforma

def plataforma():
    """Viga de madeira redonda (borda da feira/varanda): atravessa-se por baixo."""
    m = novo()
    for x in range(T):
        m[0][x] = 'k'
        m[1][x] = 'l'
        m[2][x] = 'l' if x % 6 != 0 else 'w'
        m[3][x] = 'w'
        m[4][x] = 'W'
        m[5][x] = 'k'
    # emendas da viga
    for x in (5, 11):
        m[2][x] = 'W'
        m[3][x] = 'W'
    # apoios pequenos embaixo (não chegam a ser colisão)
    for x in (2, 13):
        m[6][x] = 'W'
        m[7][x] = 'k'
    # cantos arredondados
    m[1][0] = 'k'
    m[1][T - 1] = 'k'
    return m


TILES = {
    'chaoTopo': chao_topo(),
    'chao': chao(),
    'plataforma': plataforma(),
    'toldo': toldo(),
}
ORDEM = ['vazio', 'chaoTopo', 'chao', 'plataforma', 'toldo']


def escrever_js(caminho):
    linhas = [
        '// Tiles 16x16 em matriz de texto (CLAUDE.md, seção 7). Cada caractere é uma cor da PALETA.',
        '// A ORDEM define o número de cada tile no mapa (0 = vazio).',
        '// Estilo suave (areia sem grade de tijolos, bordas arredondadas), medido em',
        '// references/estilo/sprites-spritedatabase/aladdin-snes/AladdinTown.gif. Gerado por gerar_tiles_suave.py.',
        '',
        'export const PALETA = {',
    ]
    linhas += [f"  '{k}': '{v}'," for k, v in PALETA.items()]
    linhas += ['};', '', f'export const TAMANHO = {T};', '', 'export const ORDEM = ' + repr(ORDEM) + ';', '', 'export const TILES = {']
    for nome in ORDEM[1:]:
        linhas.append(f'  {nome}: [')
        linhas += [f"    '{''.join(l)}'," for l in TILES[nome]]
        linhas.append('  ],')
    linhas.append('};')
    open(caminho, 'w').write('\n'.join(linhas) + '\n')


def previa(caminho, esc=6):
    try:
        from PIL import Image
    except ImportError:
        print('Pillow não instalado: sem prévia')
        return
    nomes = ORDEM[1:]
    img = Image.new('RGBA', (len(nomes) * (T + 4) * esc, T * 2 * esc), (158, 158, 255, 255))
    for i, n in enumerate(nomes):
        for rep in range(2):
            m = TILES[n] if not (n == 'chaoTopo' and rep == 1) else TILES['chao']
            for y, l in enumerate(m):
                for x, c in enumerate(l):
                    if c == '.':
                        continue
                    rgb = hex2rgb(c)
                    for yy in range(esc):
                        for xx in range(esc):
                            img.putpixel(((i * (T + 4) + x) * esc + xx, (rep * T + y) * esc + yy), rgb + (255,))
    img.save(caminho)


if __name__ == '__main__':
    repo = sys.argv[1]
    escrever_js(f'{repo}/src/art/tiles.js')
    if len(sys.argv) > 2:
        previa(f'{sys.argv[2]}/tiles-suave.png')
