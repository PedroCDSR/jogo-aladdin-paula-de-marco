"""Gera os tiles 16x16 de cada fase como matrizes de texto.
Itajubá: chão de pedra quente, plataforma de madeira, toldo listrado nas cores da escola.
Espaço: piso de madeira do estúdio, banco de madeira, colchonete rosa.
Chefe: ladrilho roxo com friso dourado, plataforma mágica, toldo roxo e dourado.
Uso: python3 ferramentas/arte/gerar_tiles.py <repo> <pasta_previa>
"""
import sys, random

T = 16
PALETA = {
    'k': '#2E1A33',  # contorno
    '1': '#F4CF95',  # pedra clara (topo iluminado)
    '2': '#E0A86A',  # pedra média
    '3': '#C9824B',  # pedra (terracota)
    '4': '#9A5532',  # pedra escura
    '5': '#7C4128',  # rejunte
    'l': '#DDA46A',  # madeira clara
    'w': '#B7793F',  # madeira
    'W': '#7E4D25',  # madeira escura
    'r': '#FFB0FA',  # toldo rosa (escola)
    'R': '#D57FCF',  # toldo rosa sombra
    'v': '#F9FCBB',  # toldo amarelo claro (escola)
    'V': '#D9D59A',  # toldo amarelo sombra
    # Espaço (estúdio)
    'a': '#F3D29C',  # piso de madeira claro
    'b': '#DDAE72',  # piso de madeira
    'c': '#BE8650',  # piso de madeira escuro
    'd': '#8A5A2E',  # junta entre tábuas
    'e': '#8E77BE',  # base lilás embaixo do piso
    'f': '#715AA3',  # base lilás escura
    # Chefe (terraço do Jafar)
    'm': '#5E3A8E',  # ladrilho roxo
    'n': '#7A50AE',  # ladrilho roxo claro
    'o': '#3A2160',  # pedra roxa escura
    'g': '#F2CE63',  # dourado
    'G': '#B58A2E',  # dourado escuro
}


def vazio(c='.'):
    return [[c] * T for _ in range(T)]


def tijolos(m, y0, linhas_por_fiada=4, semente=1):
    """Fiadas de pedra com rejunte e manchas, deslocadas a cada fiada."""
    rnd = random.Random(semente)
    for y in range(y0, T):
        fiada = (y - y0) // linhas_por_fiada
        borda = (y - y0) % linhas_por_fiada == linhas_por_fiada - 1
        desloc = 0 if fiada % 2 == 0 else 4
        for x in range(T):
            if borda or (x + desloc) % 8 == 7:
                m[y][x] = '5'
            else:
                m[y][x] = '3'
                if (y - y0) % linhas_por_fiada == 0:
                    m[y][x] = '2'  # luz no alto de cada pedra
                if rnd.random() < 0.08:
                    m[y][x] = '4'


def chao_topo():
    m = vazio()
    tijolos(m, 4, semente=3)
    for x in range(T):
        m[0][x] = 'k'
        m[1][x] = '1'
        m[2][x] = '1' if x % 5 else '2'
        m[3][x] = '2'
    return m


def chao():
    m = vazio()
    tijolos(m, 0, semente=7)
    return m


def plataforma():
    m = vazio()
    for x in range(T):
        m[0][x] = 'k'
        m[1][x] = 'l'
        for y in (2, 3, 4):
            m[y][x] = 'w'
        m[5][x] = 'W'
        m[6][x] = 'k'
        if x in (0, 15):
            for y in range(1, 6):
                m[y][x] = 'W'
    # pregos e veio da madeira
    for x in (3, 12):
        m[3][x] = 'W'
    for x in range(5, 10):
        m[2][x] = 'l'
    # suportes embaixo
    for x in (2, 13):
        for y in range(7, 10):
            m[y][x] = 'W'
        m[10][x] = 'k'
    return m


def toldo():
    m = vazio()
    for y in range(0, 11):
        for x in range(T):
            listra = (x // 4) % 2
            m[y][x] = ('r', 'v')[listra]
            if y >= 8:
                m[y][x] = ('R', 'V')[listra]
    for x in range(T):
        m[0][x] = 'k'
        # borda de baixo em ondas (gomos)
        fundo = 11 + (1 if x % 4 in (1, 2) else 0)
        for y in range(11, fundo):
            m[y][x] = ('R', 'V')[(x // 4) % 2]
        m[fundo][x] = 'k'
    return m


def piso_madeira(topo):
    """Tábuas de madeira corridas (estúdio de dança). topo=True põe a borda iluminada."""
    m = vazio()
    for y in range(T):
        tabua = y // 4
        for x in range(T):
            junta = (x + (0 if tabua % 2 == 0 else 7)) % 16 == 15
            if y % 4 == 3 or junta:
                m[y][x] = 'd'
            else:
                m[y][x] = ('b', 'a', 'b', 'c')[tabua % 4] if y % 4 != 0 else 'a'
    if topo:
        for x in range(T):
            m[0][x] = 'k'
            m[1][x] = 'a'
    else:
        # embaixo do piso: base lilás (aparece só em degraus e no fundo do mapa)
        for y in range(T):
            for x in range(T):
                m[y][x] = 'f' if (y % 6 == 5 or x % 8 == 7) else 'e'
    return m


def banco_estudio():
    m = plataforma()
    for x in range(1, 15):
        m[1][x] = 'a'
        for y in (2, 3, 4):
            m[y][x] = 'b'
        m[5][x] = 'c'
    return m


def colchonete():
    m = vazio()
    for y in range(4, 12):
        for x in range(T):
            m[y][x] = 'r' if y < 10 else 'R'
    for x in range(T):
        m[3][x] = 'k'
        m[12][x] = 'k'
        if x % 5 == 2:
            m[7][x] = 'R'
    return m


def ladrilho_topo():
    m = vazio()
    for y in range(T):
        for x in range(T):
            m[y][x] = 'm' if ((x // 4) + (y // 4)) % 2 == 0 else 'n'
            if (x % 4 == 0 and y % 4 == 0):
                m[y][x] = 'o'
    for x in range(T):
        m[0][x] = 'k'
        m[1][x] = 'g'
        m[2][x] = 'g' if x % 4 else 'G'
        m[3][x] = 'G'
        m[4][x] = 'o'
    return m


def pedra_roxa():
    m = vazio()
    for y in range(T):
        fiada = y // 4
        for x in range(T):
            borda = y % 4 == 3 or (x + (0 if fiada % 2 == 0 else 4)) % 8 == 7
            m[y][x] = 'o' if borda else ('n' if y % 4 == 0 else 'm')
    return m


def plataforma_magica():
    m = vazio()
    for x in range(1, 15):
        m[0][x] = 'k'
        m[1][x] = 'g'
        m[2][x] = 'n'
        m[3][x] = 'n'
        m[4][x] = 'm'
        m[5][x] = 'G'
        m[6][x] = 'k'
    for y in range(1, 6):
        m[y][0] = 'k'
        m[y][15] = 'k'
    # brilho mágico pingando embaixo
    for x, h in ((3, 9), (8, 11), (12, 8)):
        for y in range(7, h):
            if y % 2:
                m[y][x] = 'g'
    return m


def toldo_roxo():
    m = toldo()
    troca = {'r': 'n', 'R': 'm', 'v': 'g', 'V': 'G'}
    return [[troca.get(c, c) for c in linha] for linha in m]


ORDEM = ['vazio', 'chaoTopo', 'chao', 'plataforma', 'toldo']
TILESETS = {
    'itajuba': {'chaoTopo': chao_topo(), 'chao': chao(), 'plataforma': plataforma(), 'toldo': toldo()},
    'espaco': {'chaoTopo': piso_madeira(True), 'chao': piso_madeira(False), 'plataforma': banco_estudio(), 'toldo': colchonete()},
    'chefe': {'chaoTopo': ladrilho_topo(), 'chao': pedra_roxa(), 'plataforma': plataforma_magica(), 'toldo': toldo_roxo()},
}
TILES = TILESETS['itajuba']


def escrever_js(caminho):
    linhas = [
        '// Tiles 16x16 em matriz de texto (CLAUDE.md, seção 7). Cada caractere é uma cor da PALETA.',
        "// A ORDEM define o número de cada tile no mapa (0 = vazio).",
        '',
        'export const PALETA = {',
    ]
    linhas += [f"  '{k}': '{v}'," for k, v in PALETA.items()]
    linhas += ['};', '', f'export const TAMANHO = {T};', '', 'export const ORDEM = ' + repr(ORDEM) + ';', '']
    linhas.append('// Um conjunto de tiles por fase, todos com a mesma ORDEM (o mesmo mapa serve para qualquer um).')
    linhas.append('export const TILESETS = {')
    for fase, tiles in TILESETS.items():
        linhas.append(f'  {fase}: {{')
        for nome in ORDEM[1:]:
            linhas.append(f'    {nome}: [')
            linhas += [f"      '{''.join(l)}'," for l in tiles[nome]]
            linhas.append('    ],')
        linhas.append('  },')
    linhas.append('};')
    linhas += ['', '// compatibilidade: os tiles de Itajubá', 'export const TILES = TILESETS.itajuba;']
    open(caminho, 'w').write('\n'.join(linhas) + '\n')


def previa(caminho, esc=6):
    try:
        from PIL import Image
    except ImportError:
        print('Pillow não instalado: sem prévia')
        return
    nomes = ORDEM[1:]
    sets = list(TILESETS.values())
    img = Image.new('RGBA', (len(nomes) * (T + 4) * esc, len(sets) * (T * 2 + 4) * esc), (158, 158, 255, 255))
    for s_i, tiles in enumerate(sets):
        for i, n in enumerate(nomes):
            for rep in range(2):
                m = tiles[n] if not (n == 'chaoTopo' and rep == 1) else tiles['chao']
                for y, l in enumerate(m):
                    for x, c in enumerate(l):
                        if c == '.':
                            continue
                        rgb = tuple(int(PALETA[c][j:j + 2], 16) for j in (1, 3, 5))
                        oy = s_i * (T * 2 + 4) + rep * T + y
                        img.paste(rgb + (255,), ((i * (T + 4) + x) * esc, oy * esc, (i * (T + 4) + x + 1) * esc, (oy + 1) * esc))
    img.save(caminho)


if __name__ == '__main__':
    escrever_js(f'{sys.argv[1]}/src/art/tiles.js')
    previa(f'{sys.argv[2]}/tiles.png')
