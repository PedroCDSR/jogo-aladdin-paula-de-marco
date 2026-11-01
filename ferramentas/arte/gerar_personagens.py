"""Gera os personagens do jogo (design ORIGINAL) como matrizes de texto, um arquivo por personagem em src/art/.

Personagens: capivara, Jafar, Tia Claudia, Tia Paula, Jasmine, Gênio, Abu, Sultão, bailarina e o tapete mágico.
Quadros de 32x48 (o tapete usa 64x24). Todos olham para a DIREITA; o jogo espelha quando precisa.

Uso: python3 ferramentas/arte/gerar_personagens.py <repo> <pasta_previa>
"""
import sys
import math
from pixel import Quadro, escrever_js, imagem

# Cores da escola (CLAUDE.md, seção 7)
ROSA, LILAS, AMARELO, ROXO, VERDE = '#FFB0FA', '#9E9EFF', '#F9FCBB', '#6D6BD9', '#6CC24A'
CONTORNO = '#2E1A33'

# =====================================================================================
# Pessoas (Tia Claudia, Tia Paula, Jasmine, Sultão, bailarina)
# =====================================================================================

# Chaves de cor comuns às pessoas. Cada personagem troca os valores, não as letras.
# k contorno · s/S pele · h/H cabelo · a/A roupa de cima · c/C roupa de baixo · b/B sapato ou detalhe
# y/Y dourado · w branco · e olho · m boca · p bochecha · o óculos
PELE_CLARA = {'s': '#F0C29B', 'S': '#CF9A72'}
PELE_MORENA = {'s': '#D9956A', 'S': '#B06E46'}


def cabelo_tras(q, cx, cy, estilo):
    if estilo == 'chanel':  # liso, na altura do queixo
        q.elipse(cx, cy, 6.3, 6, 'h')
        q.ret(cx - 6, cy, cx - 2, cy + 6, 'h')
        q.ret(cx + 4, cy + 1, cx + 6, cy + 6, 'h')
    elif estilo == 'coque':  # preso, com coque atrás e em cima
        q.elipse(cx, cy - 0.5, 5.8, 5.5, 'h')
        q.elipse(cx - 4, cy - 6, 2.8, 2.6, 'h')
        q.px(cx - 5, cy - 7, 'H')
    elif estilo == 'tranca':  # comprido, trança grossa caindo nas costas
        q.elipse(cx, cy, 6, 5.8, 'h')
        for i in range(7):
            q.elipse(cx - 5 + (i % 2) * 0.6, cy + 4 + i * 2.6, 2, 1.6, 'h' if i % 2 else 'H')
        q.ret(cx - 6, cy + 22, cx - 4, cy + 23, 'b')  # laço na ponta
    elif estilo == 'curto':
        q.elipse(cx, cy - 1, 5.6, 5, 'h')


def cabelo_frente(q, cx, cy, estilo):
    if estilo == 'chanel':  # franja reta
        q.ret(cx - 4, cy - 5, cx + 5, cy - 2, 'h')
        q.px(cx + 1, cy - 4, 'H'); q.px(cx + 2, cy - 4, 'H')
    elif estilo in ('coque', 'tranca'):  # repartido de lado
        q.ret(cx - 4, cy - 5, cx + 5, cy - 3, 'h')
        q.px(cx + 3, cy - 2, 'h'); q.px(cx + 4, cy - 2, 'h'); q.px(cx - 3, cy - 2, 'h')
        q.px(cx, cy - 4, 'H'); q.px(cx + 1, cy - 4, 'H')
    elif estilo == 'curto':
        q.ret(cx - 4, cy - 5, cx + 4, cy - 3, 'h')


def rosto(q, cx, cy, olhos='abertos', boca='sorriso', oculos=False, bochecha=True):
    q.elipse(cx + 0.5, cy + 1, 4.6, 5, 's')
    q.ret(cx - 4, cy + 1, cx - 4, cy + 3, 'S')  # sombra na lateral do rosto
    e1, e2 = cx - 1, cx + 3
    if olhos == 'abertos':
        for ex in (e1, e2):
            q.px(ex, cy + 1, 'e'); q.px(ex, cy + 2, 'e')
    elif olhos == 'feliz':  # ^ ^
        for ex in (e1, e2):
            q.px(ex - 1, cy + 2, 'e'); q.px(ex, cy + 1, 'e'); q.px(ex + 1, cy + 2, 'e')
    elif olhos == 'fechados':
        for ex in (e1, e2):
            q.px(ex - 1, cy + 2, 'e'); q.px(ex, cy + 2, 'e')
    elif olhos == 'preocupado':
        for ex in (e1, e2):
            q.px(ex, cy + 1, 'e'); q.px(ex, cy + 2, 'e')
        q.px(e1 - 1, cy - 1, 'e'); q.px(e1, cy - 1, 'e')  # sobrancelhas levantadas no meio
        q.px(e2, cy - 1, 'e'); q.px(e2 + 1, cy - 1, 'e')
    if oculos:  # armação quadrada em volta de cada olho + ponte
        for ex in (e1, e2):
            for x in range(ex - 1, ex + 2):
                q.px(x, cy, 'o'); q.px(x, cy + 3, 'o')
        # laterais só por fora (a ponte fica no meio): assim sobra pele entre as lentes e o rosto não some
        q.ret(e1 - 2, cy + 1, e1 - 2, cy + 2, 'o'); q.ret(e2 + 2, cy + 1, e2 + 2, cy + 2, 'o')
        q.px(cx + 1, cy + 1, 'o')
        for ex in (e1, e2):  # lente clarinha em volta do olho
            q.px(ex + (1 if ex == e1 else -1), cy + 1, 'v'); q.px(ex + (1 if ex == e1 else -1), cy + 2, 'v')
    if bochecha:
        q.px(cx - 2, cy + 4, 'p'); q.px(cx + 4, cy + 4, 'p')
    if boca == 'sorriso':
        q.px(cx, cy + 4, 'm'); q.px(cx + 1, cy + 5, 'm'); q.px(cx + 2, cy + 4, 'm')
    elif boca == 'aberta':
        q.ret(cx, cy + 4, cx + 2, cy + 5, 'm')
    elif boca == 'o':
        q.px(cx + 1, cy + 4, 'm'); q.px(cx + 1, cy + 5, 'm')
    elif boca == 'reta':
        q.ret(cx, cy + 5, cx + 2, cy + 5, 'm')
    q.ret(cx, cy + 6, cx + 1, cy + 7, 'S')  # pescoço


def membro(q, a, b, c, larg, cor, cor2=None, corte=1.0):
    """Dois segmentos (ombro-cotovelo-mão ou quadril-joelho-pé). cor2 pinta o 2º segmento a partir de 'corte'."""
    q.linha(*a, *b, larg, cor)
    if cor2 is None:
        q.linha(*b, *c, larg, cor)
    else:
        mx, my = b[0] + (c[0] - b[0]) * corte, b[1] + (c[1] - b[1]) * corte
        q.linha(*b, mx, my, larg, cor)
        q.linha(mx, my, *c, larg, cor2)


def mao(q, p, cor='s'):
    q.elipse(p[0], p[1], 1.5, 1.5, cor)


def pessoa(o, braco_t, braco_f, pernas=None, dy=0, olhos='abertos', boca='sorriso', extra=None, sentada=False):
    """o: estilo da personagem (dicionário). braco_*: (cotovelo, mão). pernas: ((joelho_t, pe_t), (joelho_f, pe_f))."""
    q = Quadro()
    cx, cy = 16, 11 + dy
    if pernas is None:
        pernas = (((14, 38), (14, 45)), ((18, 38), (18, 45)))
    ombro_t, ombro_f = (12, 20 + dy), (20, 20 + dy)
    manga = o.get('manga')  # cor da manga (None = braço de fora)

    cabelo_tras(q, cx, cy, o['cabelo'])

    # braço de trás
    membro(q, ombro_t, *braco_t, 3, manga or 'S', 'S' if manga else None, o.get('corte_manga', 0.5))
    mao(q, braco_t[1], 'S')

    # pernas
    baixo = o['baixo']
    for i, (joelho, pe) in enumerate(pernas):
        quadril = (14 + 4 * i, 30 + dy)
        if sentada:
            quadril = (13 + 3 * i, 38)
        if baixo == 'calca':
            membro(q, quadril, joelho, pe, 4, 'c' if i else 'C')
        elif baixo == 'bufante':  # calça larga presa no tornozelo
            membro(q, quadril, joelho, (pe[0], pe[1] - 2), 6, 'c' if i else 'C')
            q.linha(pe[0], pe[1] - 2, *pe, 3, 's' if i else 'S')
        else:  # vestido, saia ou tutu: perna de meia-calça ou pele
            membro(q, quadril, joelho, pe, 3, o.get('perna', 's') if i else o.get('perna_s', 'S'))
        q.ret(pe[0] - 1, pe[1], pe[0] + 2, pe[1] + 1, 'b' if i else 'B')  # sapato

    # roupa de baixo (por cima das pernas)
    if baixo == 'vestido':
        if sentada:  # saia cobrindo o colo até o joelho
            q.trapezio(29 + dy, 39, 16, 5, 16, 6, 'a', 'A')
            q.ret(12, 37, 23, 40, 'a'); q.ret(12, 40, 23, 40, 'A')
        else:
            q.trapezio(29 + dy, 39, 16, 5, 16, 8, 'a', 'A')
            q.ret(9, 39, 23, 39, 'A')
    elif baixo == 'saia':
        q.trapezio(29 + dy, 37, 16, 5, 16, 7, 'c', 'C')
    elif baixo == 'tutu':
        q.trapezio(29 + dy, 33 + dy, 16, 6, 16, 11, 'c', 'C')
        for x in range(6, 27, 3):
            q.px(x, 33 + dy, 'C')
    elif baixo in ('calca', 'bufante'):
        q.ret(12, 29 + dy, 20, 31 + dy, 'c')

    # tronco
    q.trapezio(19 + dy, 30 + dy, 16, 4, 16, 5, 'a', 'A')
    if o.get('cinto'):
        q.ret(11, 28 + dy, 21, 29 + dy, o['cinto'])
    if o.get('gola'):
        q.px(16, 19 + dy, 's'); q.px(17, 19 + dy, 's'); q.px(16, 20 + dy, 's'); q.px(17, 20 + dy, 's'); q.px(17, 21 + dy, 's')
    if o.get('detalhe_tronco'):
        o['detalhe_tronco'](q, dy)

    # cabeça
    rosto(q, cx, cy, olhos, boca, o.get('oculos', False))
    cabelo_frente(q, cx, cy, o['cabelo'])
    if o.get('cabeca'):
        o['cabeca'](q, cx, cy)

    # braço da frente
    membro(q, ombro_f, *braco_f, 3, manga or 's', 's' if manga else None, o.get('corte_manga', 0.5))
    mao(q, braco_f[1])
    if extra:
        extra(q)
    q.contorno()
    return q.texto()


# Braços prontos (cotovelo, mão)
B_T_BAIXO = ((11, 25), (11, 29))
B_F_BAIXO = ((21, 25), (21, 29))
B_F_BAIXO2 = ((21, 25), (22, 29))
B_F_FRENTE = ((24, 23), (28, 22))
B_F_CIMA = ((23, 15), (24, 10))
B_T_CIMA = ((9, 15), (8, 10))
B_F_CINTURA = ((24, 24), (21, 28))
B_T_CINTURA = ((8, 24), (11, 28))


# -------------------------------------------------------------------------------------
# Tia Claudia: staff do Espaço. Cabelo preto chanel com franja, óculos, camiseta rosa do Espaço,
# calça jeans, tênis. Entrega os ingressos (amarelo-claro da escola).
# -------------------------------------------------------------------------------------
PAL_CLAUDIA = {'k': CONTORNO, **PELE_CLARA, 'h': '#1E1620', 'H': '#3C3046',
               'a': ROSA, 'A': '#D57FCF', 'c': '#5B6FB5', 'C': '#42528C', 'b': '#FFFFFF', 'B': '#D6D6E8',
               'y': AMARELO, 'Y': '#D9D59A', 'w': '#FFFFFF', 'e': '#2A1A1C', 'm': '#9A4040', 'p': '#F2A3B0',
               'o': '#3A2448', 'v': '#FFF4F0'}


def estampa_staff(q, dy):
    """Pequeno coração lilás no peito (camiseta do Espaço)."""
    q.px(18, 23 + dy, 'w'); q.px(19, 23 + dy, 'w'); q.px(18, 24 + dy, 'w')


O_CLAUDIA = {'cabelo': 'chanel', 'baixo': 'calca', 'oculos': True, 'detalhe_tronco': estampa_staff}


def ingresso(px, py):
    def f(q):
        q.ret(px - 2, py - 3, px + 3, py, 'y')
        q.ret(px - 2, py - 3, px - 2, py, 'Y')
        q.px(px + 1, py - 2, 'Y'); q.px(px + 1, py - 1, 'Y')
    return f


def gerar_claudia():
    Q = {}
    Q['parado1'] = pessoa(O_CLAUDIA, B_T_BAIXO, B_F_BAIXO)
    Q['parado2'] = pessoa(O_CLAUDIA, ((11, 26), (11, 30)), ((21, 26), (22, 30)), dy=1)
    Q['falando'] = pessoa(O_CLAUDIA, B_T_BAIXO, ((24, 22), (25, 18)), boca='aberta')
    Q['entregando'] = pessoa(O_CLAUDIA, B_T_BAIXO, B_F_FRENTE, olhos='feliz', boca='aberta', extra=ingresso(28, 22))
    anim = {'parado': (['parado1', 'parado2'], 2, -1), 'falando': (['parado1', 'falando'], 4, -1),
            'entregando': (['entregando'], 1, 0)}
    return PAL_CLAUDIA, Q, anim


# -------------------------------------------------------------------------------------
# Tia Paula De Marco: diretora. Aparência A DEFINIR: design neutro e fácil de trocar.
# Troque só o bloco APARENCIA_PAULA (cores e estilo do cabelo) quando chegar a foto/descrição.
# -------------------------------------------------------------------------------------
APARENCIA_PAULA = {
    'pele': PELE_CLARA,
    'cabelo': 'coque',          # 'coque', 'chanel', 'tranca' ou 'curto'
    'cor_cabelo': '#6B3E26',    # castanho
    'brilho_cabelo': '#8F5A3A',
    'vestido': ROXO,            # roxo da escola
    'vestido_sombra': '#5352A8',
    'detalhe': ROSA,            # lenço rosa
    'oculos': False,
}
A = APARENCIA_PAULA
PAL_PAULA = {'k': CONTORNO, **A['pele'], 'h': A['cor_cabelo'], 'H': A['brilho_cabelo'],
             'a': A['vestido'], 'A': A['vestido_sombra'], 'c': A['vestido'], 'C': A['vestido_sombra'],
             'b': '#3A2A44', 'B': '#2A1E33', 'y': AMARELO, 'Y': '#D9D59A', 'r': A['detalhe'], 'R': '#D57FCF',
             'w': '#FFFFFF', 'e': '#2A1A1C', 'm': '#9A4040', 'p': '#F2A3B0', 'o': '#4A2E5A'}


def lenco(q, dy):
    q.ret(13, 19 + dy, 20, 20 + dy, 'r')
    q.ret(13, 20 + dy, 20, 20 + dy, 'R')
    q.linha(13, 20 + dy, 12, 24 + dy, 2, 'r')


O_PAULA = {'cabelo': A['cabelo'], 'baixo': 'vestido', 'oculos': A['oculos'], 'detalhe_tronco': lenco,
           'perna': 's', 'perna_s': 'S', 'cinto': 'R'}


def gerar_paula():
    Q = {}
    Q['parado1'] = pessoa(O_PAULA, B_T_BAIXO, B_F_BAIXO)
    Q['parado2'] = pessoa(O_PAULA, ((11, 26), (11, 30)), ((21, 26), (22, 30)), dy=1)
    # presa na gaiola: mãos para cima segurando as grades, cara de preocupada
    Q['presa1'] = pessoa(O_PAULA, ((9, 17), (9, 13)), ((23, 17), (23, 13)), olhos='preocupado', boca='o')
    Q['presa2'] = pessoa(O_PAULA, ((9, 18), (9, 14)), ((23, 18), (23, 14)), olhos='preocupado', boca='aberta', dy=1)
    # no palco: braço para cima anunciando o espetáculo
    Q['acenando1'] = pessoa(O_PAULA, B_T_BAIXO, B_F_CIMA, olhos='feliz', boca='aberta')
    Q['acenando2'] = pessoa(O_PAULA, B_T_BAIXO, ((24, 15), (27, 11)), olhos='feliz', boca='sorriso')
    # sentada no tapete
    Q['sentada'] = pessoa(O_PAULA, ((11, 32), (12, 36)), ((22, 31), (25, 35)), dy=6,
                          pernas=(((21, 41), (26, 42)), ((22, 40), (28, 41))), olhos='feliz', sentada=True)
    anim = {'parado': (['parado1', 'parado2'], 2, -1), 'presa': (['presa1', 'presa2'], 3, -1),
            'acenando': (['acenando1', 'acenando2'], 4, -1), 'sentada': (['sentada'], 1, -1)}
    return PAL_PAULA, Q, anim


# -------------------------------------------------------------------------------------
# Jasmine: princesa dançarina. Trança comprida com laço, flor amarela no cabelo, blusa lilás,
# calça bufante rosa, faixa amarela. Animação de dança (braços alternados).
# -------------------------------------------------------------------------------------
PAL_JASMINE = {'k': CONTORNO, **PELE_MORENA, 'h': '#1E1620', 'H': '#3C3046',
               'a': LILAS, 'A': '#7B7BD6', 'c': ROSA, 'C': '#D57FCF', 'b': AMARELO, 'B': '#D9D59A',
               'y': AMARELO, 'Y': '#E0C46A', 'w': '#FFFFFF', 'e': '#2A1A1C', 'm': '#9A4040', 'p': '#E98A8A',
               'o': '#4A2E5A'}


def flor(q, cx, cy):
    for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)):
        q.px(cx - 3 + dx, cy - 4 + dy, 'y')
    q.px(cx - 3, cy - 4, 'Y')


O_JASMINE = {'cabelo': 'tranca', 'baixo': 'bufante', 'cabeca': flor, 'cinto': 'y'}


def gerar_jasmine():
    Q = {}
    Q['danca1'] = pessoa(O_JASMINE, B_T_CIMA, B_F_CINTURA, olhos='feliz',
                         pernas=(((14, 38), (14, 45)), ((19, 38), (21, 45))))
    Q['danca2'] = pessoa(O_JASMINE, B_T_CINTURA, B_F_CIMA, olhos='feliz', dy=-1,
                         pernas=(((13, 38), (12, 45)), ((18, 38), (18, 45))))
    anim = {'parado': (['danca1', 'danca2'], 2, -1)}
    return PAL_JASMINE, Q, anim


# -------------------------------------------------------------------------------------
# Sultão: baixinho e redondo, barba branca, coroa dourada (sem turbante), capa rosa, túnica verde.
# -------------------------------------------------------------------------------------
PAL_SULTAO = {'k': CONTORNO, **PELE_CLARA, 'h': '#F4F4F4', 'H': '#CFCFE0',
              'a': VERDE, 'A': '#47913A', 'c': VERDE, 'C': '#47913A', 'b': '#7A4A2A', 'B': '#5A3420',
              'y': '#F7D35A', 'Y': '#C9A13A', 'r': ROSA, 'R': '#D57FCF', 'w': '#FFFFFF', 'e': '#2A1A1C',
              'm': '#9A4040', 'p': '#F2A3B0', 'o': '#4A2E5A'}


def sultao():
    def frame(dy, bt, bf, olhos):
        q = Quadro()
        cx, cy = 16, 17 + dy
        # capa rosa atrás
        q.trapezio(24 + dy, 44, 15, 5, 14, 9, 'r', 'R')
        # pernas curtas
        for i in range(2):
            q.ret(13 + 5 * i, 40, 15 + 5 * i, 44, 'C' if i == 0 else 'c')
            q.ret(12 + 5 * i, 45, 16 + 5 * i, 46, 'B' if i == 0 else 'b')
        # barriga redonda
        q.elipse(16, 33 + dy * 0.5, 8, 8, 'a')
        q.elipse(14, 33 + dy * 0.5, 4, 7, 'A')
        q.elipse(17, 33 + dy * 0.5, 6, 7, 'a')
        q.ret(9, 34, 23, 35, 'y')  # cinto dourado
        q.px(16, 34, 'Y'); q.px(16, 35, 'Y')
        # cabeça
        q.elipse(cx + 0.5, cy, 4.5, 4.6, 's')
        q.ret(cx - 4, cy, cx - 4, cy + 2, 'S')
        # barba branca grande
        q.elipse(cx + 0.5, cy + 5, 5, 4, 'h')
        q.elipse(cx - 1, cy + 6, 2, 2, 'H')
        # bigode
        q.ret(cx - 1, cy + 2, cx + 3, cy + 2, 'h')
        for ex in (cx - 1, cx + 3):
            if olhos == 'feliz':
                q.px(ex - 1, cy, 'e'); q.px(ex, cy - 1, 'e'); q.px(ex + 1, cy, 'e')
            else:
                q.px(ex, cy - 1, 'e'); q.px(ex, cy, 'e')
        q.px(cx - 2, cy + 1, 'p'); q.px(cx + 4, cy + 1, 'p')
        q.px(cx + 1, cy + 1, 'S')  # nariz
        # coroa dourada de 3 pontas
        q.ret(cx - 4, cy - 5, cx + 5, cy - 4, 'y')
        for x in (cx - 4, cx, cx + 4):
            q.ret(x, cy - 8, x + 1, cy - 6, 'y')
        q.px(cx, cy - 5, 'r'); q.px(cx + 1, cy - 5, 'r')  # pedra rosa
        q.ret(cx - 4, cy - 4, cx + 5, cy - 4, 'Y')
        # braços curtinhos
        q.linha(10, 28 + dy, *bt, 3, 'A'); mao(q, bt, 'S')
        q.linha(22, 28 + dy, *bf, 3, 'a'); mao(q, bf)
        q.contorno()
        return q.texto()
    Q = {'parado1': frame(0, (8, 33), (24, 33), 'abertos'), 'parado2': frame(1, (7, 30), (25, 25), 'feliz')}
    anim = {'parado': (['parado1', 'parado2'], 2, -1)}
    return PAL_SULTAO, Q, anim


# -------------------------------------------------------------------------------------
# Bailarina (aluna do Espaço, sem rosto de ninguém): coque, collant lilás, tutu rosa, sapatilhas.
# Correndo: é ela quem chega avisando que o Jafar levou a Tia Paula.
# -------------------------------------------------------------------------------------
PAL_BAILARINA = {'k': CONTORNO, **PELE_MORENA, 'h': '#4A2A1C', 'H': '#6E4632',
                 'a': LILAS, 'A': '#7B7BD6', 'c': ROSA, 'C': '#D57FCF', 'b': ROSA, 'B': '#D57FCF',
                 'y': AMARELO, 'Y': '#D9D59A', 'w': '#FFFFFF', 'e': '#2A1A1C', 'm': '#9A4040', 'p': '#E98A8A',
                 'o': '#4A2E5A', 't': '#F7D9EE', 'T': '#E3B8D6'}
O_BAILARINA = {'cabelo': 'coque', 'baixo': 'tutu', 'perna': 't', 'perna_s': 'T'}


def gerar_bailarina():
    Q = {}
    # ponta: na meia ponta, braços em "quinta posição" (arredondados em cima)
    Q['parado1'] = pessoa(O_BAILARINA, ((7, 12), (12, 3)), ((25, 12), (20, 3)), olhos='feliz',
                          pernas=(((15, 38), (15, 44)), ((17, 38), (17, 44))))
    Q['parado2'] = pessoa(O_BAILARINA, ((8, 22), (5, 19)), ((24, 22), (27, 19)), olhos='feliz',
                          pernas=(((15, 38), (15, 45)), ((18, 38), (18, 45))))
    Q['correndo1'] = pessoa(O_BAILARINA, ((9, 24), (6, 22)), ((24, 22), (27, 18)), boca='aberta', olhos='preocupado',
                            pernas=(((11, 38), (8, 42)), ((20, 37), (23, 45))))
    Q['correndo2'] = pessoa(O_BAILARINA, ((12, 25), (14, 29)), ((21, 25), (19, 29)), boca='aberta', olhos='preocupado',
                            dy=1, pernas=(((14, 39), (13, 45)), ((18, 37), (16, 42))))
    Q['correndo3'] = pessoa(O_BAILARINA, ((9, 22), (6, 18)), ((24, 24), (27, 22)), boca='aberta', olhos='preocupado',
                            pernas=(((20, 37), (23, 45)), ((11, 38), (8, 42))))
    anim = {'parado': (['parado1', 'parado2'], 2, -1),
            'correndo': (['correndo1', 'correndo2', 'correndo3', 'correndo2'], 10, -1)}
    return PAL_BAILARINA, Q, anim


# =====================================================================================
# Capivara (inimigo fofo de Itajubá)
# =====================================================================================
PAL_CAPIVARA = {'k': '#3B2418', 'a': '#B5794A', 'A': '#8C5A34', 'l': '#D9A877', 'n': '#4A2C1C',
                'e': '#2A1A1C', 'w': '#FFFFFF', 'p': '#F2A3B0', 'r': '#E04848', 'R': '#A82E3A', 'g': VERDE,
                'z': '#FFFFFF', 'Z': LILAS}


def capivara(passo=0, dy=0, olhos='abertos', comendo=False, dormindo=False, zz=0):
    """Capivara de lado: corpo de barril, cabeça quadradona na frente, perninhas curtas."""
    q = Quadro()
    base = 46
    if dormindo:
        # deitada: corpo baixo e comprido, cabeça apoiada no chão
        q.elipse(14, base - 5, 11, 5, 'a')
        q.elipse(12, base - 3, 9, 2.2, 'A')
        q.ret(20, base - 8, 29, base - 1, 'a')
        q.elipse(24, base - 8, 4, 2, 'a')
        q.ret(21, base - 2, 29, base - 1, 'A')
        q.ret(28, base - 6, 29, base - 4, 'n')  # nariz
        q.px(21, base - 10, 'A'); q.px(22, base - 10, 'A')  # orelha
        q.ret(23, base - 6, 25, base - 6, 'e')  # olho fechado
        q.px(26, base - 4, 'p')
        q.elipse(9, base - 8, 3, 1.5, 'l')  # brilho nas costas
        # zzz subindo
        for i, (zx, zy, t) in enumerate(((24, 31, 3), (27, 25, 4), (22, 19, 5))):
            if i > zz:
                break
            q.ret(zx, zy, zx + t - 1, zy, 'z')
            for j in range(1, t - 1):
                q.px(zx + t - 1 - j, zy + j, 'z')
            q.ret(zx, zy + t - 1, zx + t - 1, zy + t - 1, 'z')
        q.contorno()
        q.trocar('z', 'z')
        return q.texto()

    if comendo:
        # sentada, de pé nas patas de trás, segurando a maçã com as da frente
        q.elipse(13, base - 9, 8, 8, 'a')
        q.elipse(11, base - 8, 5, 6, 'A')
        q.elipse(15, base - 9, 4, 6, 'l')  # barriguinha clara
        q.ret(8, base - 2, 12, base, 'A'); q.ret(15, base - 2, 19, base, 'a')  # patas de trás
        hy = base - 23 + dy
        q.ret(11, hy, 22, hy + 9, 'a')
        q.elipse(16, hy, 5.5, 2, 'a')
        q.ret(21, hy + 3, 22, hy + 5, 'n')
        q.px(12, hy - 2, 'A'); q.px(13, hy - 2, 'A'); q.px(13, hy - 3, 'A')
        q.ret(11, hy + 8, 22, hy + 9, 'A')
        # olhos ^^ e bochecha
        q.px(16, hy + 3, 'e'); q.px(17, hy + 2, 'e'); q.px(18, hy + 3, 'e')
        q.px(15, hy + 5, 'p'); q.px(16, hy + 5, 'p')
        # maçã na boca, segurada pelas patinhas
        my = hy + 10 - dy
        q.elipse(22, my, 2.6, 2.4, 'r')
        q.px(21, my - 1, 'w')
        q.px(22, my + 2, 'R'); q.px(23, my + 1, 'R')
        q.px(22, my - 3, 'n'); q.px(23, my - 4, 'g')
        if dy:  # mordida: falta um pedacinho
            q.px(24, my - 1, '.'); q.px(24, my, '.')
        q.linha(17, base - 13, 20, my + 1, 2, 'a')
        q.contorno()
        return q.texto()

    # andando
    by = base - 7 + dy
    # perninhas (4), alternando
    pos = [(8, 0), (12, 1), (19, 0), (23, 1)]
    for i, (x, fase) in enumerate(pos):
        lev = 1 if (fase == passo % 2) and passo in (1, 3) else 0
        avan = (1 if fase == (passo // 2) % 2 else -1) if passo in (1, 3) else 0
        cor = 'A' if i % 2 == 0 else 'a'
        q.ret(x + avan, by + 3, x + 2 + avan, base - lev, cor)
    # corpo de barril
    q.elipse(15, by - 1, 11, 6.5, 'a')
    q.elipse(13, by + 2, 9, 3, 'A')
    q.elipse(11, by - 5, 5, 1.5, 'l')  # brilho
    # cabeça quadradona, um pouco acima e à frente
    hx, hy = 21, by - 11
    q.ret(hx, hy + 1, hx + 8, hy + 9, 'a')
    q.elipse(hx + 4, hy + 1, 4.5, 2, 'a')
    q.ret(hx + 1, hy + 8, hx + 8, hy + 9, 'A')
    q.ret(hx + 7, hy + 3, hx + 8, hy + 5, 'n')  # nariz
    q.px(hx + 1, hy - 1, 'A'); q.px(hx + 2, hy - 1, 'A'); q.px(hx + 2, hy - 2, 'A')  # orelha
    if olhos == 'abertos':
        q.px(hx + 5, hy + 3, 'e'); q.px(hx + 5, hy + 4, 'e'); q.px(hx + 4, hy + 3, 'w')
    else:
        q.ret(hx + 4, hy + 4, hx + 5, hy + 4, 'e')
    q.px(hx + 4, hy + 6, 'p'); q.px(hx + 5, hy + 6, 'p')
    q.px(hx + 7, hy + 7, 'n')  # boquinha
    q.contorno()
    return q.texto()


def gerar_capivara():
    Q = {}
    for i, dy in enumerate((0, 1, 0, 1)):
        Q[f'andando{i + 1}'] = capivara(passo=i, dy=dy)
    Q['comendo1'] = capivara(comendo=True)
    Q['comendo2'] = capivara(comendo=True, dy=1)
    Q['dormindo1'] = capivara(dormindo=True, zz=0)
    Q['dormindo2'] = capivara(dormindo=True, zz=1)
    Q['dormindo3'] = capivara(dormindo=True, zz=2)
    Q['tonta'] = capivara(olhos='fechados', dy=1)
    anim = {'andando': ([f'andando{i}' for i in range(1, 5)], 6, -1),
            'comendo': (['comendo1', 'comendo2'], 4, -1),
            'dormindo': (['dormindo1', 'dormindo2', 'dormindo3'], 2, -1),
            'tonta': (['tonta'], 1, 0)}
    return PAL_CAPIVARA, Q, anim


# =====================================================================================
# Jafar (chefe): túnica comprida roxo-escura com barra verde, colete vinho, turbante vinho com pedra
# amarela e pena verde, bigode enrolado e cavanhaque. Flutua sobre uma nuvem de fumaça lilás.
# =====================================================================================
PAL_JAFAR = {'k': '#1E1226', 's': '#E0A878', 'S': '#B57A50', 'h': '#1A1018', 'H': '#3A2A36',
             'a': '#4B2A6B', 'A': '#341C4D', 'v': '#8E2B5A', 'V': '#661D40', 'g': VERDE, 'G': '#47913A',
             'y': '#F7D35A', 'Y': '#C9A13A', 'f': LILAS, 'F': '#7B7BD6', 'e': '#2A1A1C', 'w': '#FFFFFF',
             'm': '#5A1E2A', 'r': ROSA, 'R': '#D57FCF', 'l': AMARELO}


def jafar(dy=0, braco='baixo', tonto=False, fumaca=0):
    q = Quadro()
    cx, cy = 17, 9 + dy
    # fumaça embaixo (no lugar dos pés)
    for i, (fx, fy, r) in enumerate(((12, 42, 3), (17, 44, 3.4), (22, 42, 2.6), (15, 46, 2), (20, 46, 1.8))):
        dx = 1 if (i + fumaca) % 2 else 0
        q.elipse(fx + dx, fy, r, r * 0.8, 'f' if i % 2 == 0 else 'F')
    # túnica comprida, abrindo para baixo
    q.trapezio(17 + dy, 40, 16, 5, 17, 9, 'a', 'A')
    q.ret(8, 39, 26, 40, 'g'); q.ret(8, 40, 26, 40, 'G')  # barra verde
    # colete vinho por cima, aberto na frente
    q.trapezio(17 + dy, 29 + dy, 15, 5, 15, 6, 'v', 'V')
    q.ret(17, 18 + dy, 18, 29 + dy, 'a')
    q.ret(10, 28 + dy, 23, 29 + dy, 'y')  # cinto dourado
    # gola alta em leque (verde)
    q.trapezio(13 + dy, 17 + dy, 12, 1, 12, 3, 'g', 'G')
    # braço de trás (manga larga)
    if braco == 'cima':
        q.linha(11, 19 + dy, 7, 12 + dy, 4, 'A'); mao(q, (6, 10 + dy), 'S')
    else:
        q.linha(11, 19 + dy, 9, 28 + dy, 4, 'A'); mao(q, (9, 31 + dy), 'S')
    # cabeça (rosto mais comprido)
    q.elipse(cx + 0.5, cy + 2, 4, 5, 's')
    q.ret(cx - 3, cy + 2, cx - 3, cy + 4, 'S')
    # turbante alto e pontudo
    q.elipse(cx, cy - 3, 5.5, 3, 'v')
    q.trapezio(cy - 9, cy - 4, cx + 1, 1, cx, 4, 'v', 'V')
    q.ret(cx - 5, cy - 2, cx + 5, cy - 2, 'V')
    q.elipse(cx + 1, cy - 3, 1.3, 1.3, 'y')  # pedra
    q.px(cx + 1, cy - 4, 'l')
    q.linha(cx + 1, cy - 5, cx - 3, cy - 11, 2, 'g')  # pena verde
    # sobrancelhas, olhos, bigode enrolado, cavanhaque
    if tonto:  # olhos em espiral (x) e boca torta
        for ex in (cx - 1, cx + 3):
            q.px(ex - 1, cy, 'e'); q.px(ex + 1, cy, 'e'); q.px(ex, cy + 1, 'e')
            q.px(ex - 1, cy + 2, 'e'); q.px(ex + 1, cy + 2, 'e')
        q.px(cx, cy + 6, 'm'); q.px(cx + 1, cy + 5, 'm'); q.px(cx + 2, cy + 6, 'm')
    else:
        q.px(cx - 2, cy, 'h'); q.px(cx - 1, cy, 'h')  # sobrancelhas em V (bravo, mas de desenho)
        q.px(cx + 4, cy, 'h'); q.px(cx + 3, cy, 'h')
        q.px(cx - 1, cy + 1, 'e'); q.px(cx + 3, cy + 1, 'e')
        q.ret(cx, cy + 6, cx + 2, cy + 6, 'm')
    q.ret(cx, cy + 4, cx + 2, cy + 4, 'h')
    q.px(cx - 1, cy + 3, 'h'); q.px(cx + 3, cy + 3, 'h')  # pontas do bigode viradas para cima
    q.ret(cx, cy + 7, cx + 1, cy + 9, 'h')  # cavanhaque
    # braço da frente
    if braco == 'cima':
        q.linha(21, 19 + dy, 25, 12 + dy, 4, 'a'); mao(q, (26, 10 + dy))
        # bola de magia rosa
        q.elipse(27, 6 + dy, 3, 3, 'r'); q.elipse(27, 6 + dy, 1.5, 1.5, 'l'); q.px(26, 5 + dy, 'w')
    else:
        q.linha(21, 19 + dy, 24, 27 + dy, 4, 'a'); mao(q, (25, 30 + dy))
    if tonto:  # estrelinhas girando em volta do turbante
        for (sx, sy) in ((7, 4), (27, 2), (24, 10)):
            q.px(sx, sy, 'l'); q.px(sx - 1, sy, 'y'); q.px(sx + 1, sy, 'y'); q.px(sx, sy - 1, 'y'); q.px(sx, sy + 1, 'y')
    q.contorno()
    return q.texto()


def gerar_jafar():
    Q = {'flutuando1': jafar(0, fumaca=0), 'flutuando2': jafar(1, fumaca=1),
         'lancando': jafar(0, braco='cima'),
         'vulneravel1': jafar(1, tonto=True, fumaca=0), 'vulneravel2': jafar(2, tonto=True, fumaca=1)}
    anim = {'flutuando': (['flutuando1', 'flutuando2'], 3, -1), 'lancando': (['lancando'], 1, 0),
            'vulneravel': (['vulneravel1', 'vulneravel2'], 4, -1)}
    return PAL_JAFAR, Q, anim


# =====================================================================================
# Gênio: sorridente, pele morena, turbante rosa com pena amarela, colete dourado, braceletes,
# careca... não: barba curta preta. Da cintura para baixo, um rabo de fumaça lilás saindo da lâmpada.
# =====================================================================================
PAL_GENIO = {'k': CONTORNO, **PELE_MORENA, 'h': '#1E1620', 'H': '#3C3046',
             'a': '#F7D35A', 'A': '#C9A13A', 'r': ROSA, 'R': '#D57FCF', 'f': LILAS, 'F': '#7B7BD6',
             'y': AMARELO, 'Y': '#D9D59A', 'e': '#2A1A1C', 'w': '#FFFFFF', 'm': '#9A4040', 'p': '#E98A8A',
             'o': '#B98A3A', 'O': '#8A6224'}


def genio(dy=0, bracos='abertos', cauda=0):
    q = Quadro()
    cx, cy = 16, 9 + dy
    # lâmpada dourada no chão
    q.elipse(15, 44, 6, 2.4, 'o'); q.ret(10, 44, 20, 45, 'O'); q.linha(20, 43, 25, 41, 2, 'o')
    q.ret(13, 41, 17, 42, 'o')
    # rabo de fumaça em S subindo da lâmpada até a cintura
    for i in range(14):
        t = i / 13
        x = 15 + math.sin(t * math.pi * 1.6 + cauda * 0.8) * 3
        y = 41 - t * 13
        q.elipse(x, y, 1.5 + t * 3.5, 1.6, 'f' if i % 3 else 'F')
    # tronco largo (peito à mostra com colete dourado aberto)
    q.trapezio(17 + dy, 28 + dy, 16, 7, 16, 5, 's', 'S')
    q.trapezio(17 + dy, 28 + dy, 16, 7, 16, 5, 'a', 'A')
    q.trapezio(18 + dy, 28 + dy, 17, 1, 17, 2, 's')
    q.ret(11, 27 + dy, 21, 28 + dy, 'r')  # faixa rosa
    # cabeça
    q.elipse(cx + 0.5, cy + 1, 4.6, 5, 's')
    q.ret(cx - 4, cy + 1, cx - 4, cy + 3, 'S')
    for ex in (cx - 1, cx + 3):
        q.px(ex - 1, cy + 1, 'e'); q.px(ex, cy, 'e'); q.px(ex + 1, cy + 1, 'e')  # olhos ^^
    q.ret(cx - 1, cy + 3, cx + 3, cy + 4, 'm'); q.ret(cx, cy + 4, cx + 2, cy + 4, 'w')  # sorrisão
    q.ret(cx - 2, cy + 5, cx + 4, cy + 6, 'h')  # barba curta
    q.px(cx - 3, cy + 3, 'p'); q.px(cx + 5, cy + 3, 'p')
    # turbante redondo rosa com pedra e pena
    q.elipse(cx + 0.5, cy - 4, 6, 3.4, 'r')
    q.ret(cx - 5, cy - 2, cx + 6, cy - 2, 'R')
    q.elipse(cx + 1, cy - 3, 1.3, 1.3, 'a')
    q.linha(cx + 1, cy - 5, cx + 5, cy - 11, 2, 'y')
    # braços
    if bracos == 'abertos':
        pts = (((9, 18 + dy), (5, 13 + dy), (4, 9 + dy)), ((23, 18 + dy), (27, 13 + dy), (28, 9 + dy)))
    else:  # braços cruzados no peito
        pts = (((10, 19 + dy), (11, 24 + dy), (19, 23 + dy)), ((22, 19 + dy), (22, 24 + dy), (14, 24 + dy)))
    for i, (a, b, c) in enumerate(pts):
        q.linha(*a, *b, 4, 's' if i else 'S'); q.linha(*b, *c, 3, 's' if i else 'S')
        q.ret(int(b[0]) - 1, int(b[1]) + (1 if bracos == 'abertos' else -1), int(b[0]) + 1, int(b[1]) + (2 if bracos == 'abertos' else 0), 'y')  # bracelete
        mao(q, c, 's' if i else 'S')
    q.contorno()
    return q.texto()


def gerar_genio():
    Q = {'parado1': genio(0, 'abertos', 0), 'parado2': genio(1, 'abertos', 1), 'cruzado': genio(0, 'cruzados', 2)}
    anim = {'parado': (['parado1', 'parado2'], 3, -1), 'cruzado': (['cruzado'], 1, 0)}
    return PAL_GENIO, Q, anim


# =====================================================================================
# Abu: macaquinho marrom, cara bege, orelhas grandes, rabo enrolado, lenço verde no pescoço (sem chapéu).
# =====================================================================================
PAL_ABU = {'k': '#3B2418', 'a': '#8C5A34', 'A': '#6B4024', 'l': '#E8C79A', 'L': '#C9A272', 'g': VERDE,
           'G': '#47913A', 'e': '#2A1A1C', 'w': '#FFFFFF', 'p': '#F2A3B0', 'm': '#9A4040'}


def abu(dy=0, acena=False):
    q = Quadro()
    base = 46
    cx, cy = 16, 30 + dy
    # rabo enrolado atrás
    for i in range(16):
        ang = i / 15 * math.pi * 1.5
        q.elipse(8 - math.sin(ang) * 3, 42 - i * 0.7 + (math.cos(ang)) * 1.5, 1, 1, 'A')
    # corpo sentado
    q.elipse(16, 40 + dy * 0.5, 5, 5, 'a')
    q.elipse(17, 41 + dy * 0.5, 2.5, 3.2, 'l')
    # pés
    q.ret(12, base - 1, 15, base, 'A'); q.ret(18, base - 1, 21, base, 'a')
    # cabeça grande
    q.elipse(cx, cy, 5.5, 5, 'a')
    q.elipse(cx - 6, cy - 1, 2, 2.3, 'a'); q.elipse(cx - 6, cy - 1, 1, 1.3, 'L')  # orelha
    q.elipse(cx + 6, cy - 1, 2, 2.3, 'a'); q.elipse(cx + 6, cy - 1, 1, 1.3, 'L')
    q.elipse(cx + 0.5, cy + 1, 4, 3.4, 'l')  # máscara clara
    q.ret(cx - 2, cy - 3, cx + 3, cy - 2, 'l')
    q.px(cx - 1, cy - 1, 'e'); q.px(cx + 2, cy - 1, 'e'); q.px(cx - 1, cy - 2, 'w')
    q.px(cx, cy + 1, 'A'); q.px(cx + 1, cy + 1, 'A')  # narinas
    q.ret(cx - 1, cy + 3, cx + 2, cy + 3, 'm')
    # lenço verde
    q.ret(12, cy + 5, 20, cy + 6, 'g'); q.ret(15, cy + 7, 17, cy + 8, 'G')
    # braços
    q.linha(12, 38, 10, 43, 2, 'A')
    if acena:
        q.linha(20, 38, 24, 31 + dy, 2, 'a'); q.elipse(24, 30 + dy, 1.2, 1.2, 'l')
    else:
        q.linha(20, 38, 22, 43, 2, 'a')
    q.contorno()
    return q.texto()


def gerar_abu():
    Q = {'parado1': abu(0), 'parado2': abu(1, acena=True)}
    anim = {'parado': (['parado1', 'parado2'], 3, -1)}
    return PAL_ABU, Q, anim


# =====================================================================================
# Tapete mágico (64x24): visto de cima em perspectiva, com a estampa dos quadrados arredondados
# concêntricos do logo (rosa > lilás > amarelo), borda roxa e franjas amarelas. 4 quadros de ondulação.
# =====================================================================================
PAL_TAPETE = {'k': '#2E1A33', 'u': ROXO, 'U': '#5352A8', 'r': ROSA, 'R': '#D57FCF', 'l': LILAS,
              'y': AMARELO, 'Y': '#D9D59A', 'g': VERDE}
TL, TA = 64, 24


def tapete(fase):
    q = Quadro(TL, TA)
    x0, x1 = 6, 57
    alt = 9  # altura da superfície (perspectiva achatada)
    for x in range(x0, x1 + 1):
        onda = math.sin((x - x0) / (x1 - x0) * math.pi * 2 + fase * math.pi / 2) * 1.6
        topo = int(round(9 + onda))
        # superfície
        for y in range(topo, topo + alt):
            q.px(x, y, 'u')
        # espessura (lado de baixo)
        q.px(x, topo + alt, 'U'); q.px(x, topo + alt + 1, 'U')
        # estampa: blocos de 10 px com quadrados concêntricos
        bx = (x - x0 - 1) % 10
        if x0 < x < x1 and bx < 9:
            for y in range(topo + 1, topo + alt - 1):
                by = y - topo - 1  # 0..6
                d = min(bx, 8 - bx, by, 6 - by)  # distância até a borda do quadrado
                canto = (bx in (0, 8)) and (by in (0, 6))  # canto arredondado
                if canto:
                    continue
                q.px(x, y, ('r', 'l', 'y', 'g')[min(d, 3)])
    # franjas nas pontas
    for x, sentido in ((x0, -1), (x1, 1)):
        onda = math.sin((x - x0) / (x1 - x0) * math.pi * 2 + fase * math.pi / 2) * 1.6
        topo = int(round(9 + onda))
        for y in range(topo, topo + alt + 1, 2):
            q.linha(x + sentido, y, x + sentido * (3 + (y + fase) % 2), y + (fase % 2), 1, 'y')
    q.contorno()
    return q.texto()


def gerar_tapete():
    Q = {f'voando{i + 1}': tapete(i) for i in range(4)}
    anim = {'voando': ([f'voando{i}' for i in range(1, 5)], 8, -1)}
    return PAL_TAPETE, Q, anim


# =====================================================================================

PERSONAGENS = {
    # nome do arquivo: (gerador, largura, altura, descrição)
    'capivara': (gerar_capivara, 32, 48, 'Capivara fofa e trapalhona (inimigo de Itajubá): anda, come a maçã feliz, dorme com zzz.'),
    'jafar': (gerar_jafar, 32, 48, 'Jafar (chefe): túnica roxa, turbante vinho com pena verde, flutua em fumaça lilás.'),
    'claudia': (gerar_claudia, 32, 48, 'Tia Claudia (staff): cabelo preto chanel com franja, óculos, camiseta rosa. Entrega os ingressos.'),
    'paula': (gerar_paula, 32, 48, 'Tia Paula De Marco (diretora): aparência A DEFINIR. Design neutro: troque APARENCIA_PAULA no gerador.'),
    'jasmine': (gerar_jasmine, 32, 48, 'Jasmine: trança comprida com laço, flor amarela, blusa lilás, calça bufante rosa.'),
    'genio': (gerar_genio, 32, 48, 'Gênio: turbante rosa, colete dourado, barba curta, rabo de fumaça lilás saindo da lâmpada.'),
    'abu': (gerar_abu, 32, 48, 'Abu: macaquinho marrom com lenço verde no pescoço.'),
    'sultao': (sultao, 32, 48, 'Sultão: baixinho, barba branca, coroa dourada, capa rosa, túnica verde.'),
    'bailarina': (gerar_bailarina, 32, 48, 'Bailarina do Espaço (sem rosto de aluno): coque, collant lilás, tutu rosa. Chega correndo com a notícia.'),
    'tapete': (gerar_tapete, TL, TA, 'Tapete mágico: estampa dos quadrados arredondados concêntricos do logo.'),
}


def gerar_tudo():
    saida = {}
    for nome, (ger, l, a, desc) in PERSONAGENS.items():
        pal, Q, anim = ger()
        for qn, linhas in Q.items():
            assert len(linhas) == a and all(len(x) == l for x in linhas), (nome, qn)
            usados = set(''.join(linhas)) - {'.'}
            faltando = usados - set(pal)
            assert not faltando, (nome, qn, faltando)
        # paleta só com as cores usadas (arquivo menor)
        usados = set(''.join(''.join(v) for v in Q.values()))
        pal = {k: v for k, v in pal.items() if k in usados}
        saida[nome] = (pal, Q, anim, l, a, desc)
    return saida


if __name__ == '__main__':
    repo, pasta = sys.argv[1], sys.argv[2]
    tudo = gerar_tudo()
    for nome, (pal, Q, anim, l, a, desc) in tudo.items():
        escrever_js(f'{repo}/src/art/{nome}.js', [desc, 'Design ORIGINAL (CLAUDE.md, seções 7 e 8).'],
                    pal, l, a, list(Q.keys()), Q, anim)
    try:
        from PIL import Image
        import gerar_jogador as J
        faixas = [imagem([(J.QUADROS[n], J.PALETA) for n in J.ORDEM], escala=3)]
        for nome, (pal, Q, *_r) in tudo.items():
            img = imagem([(v, pal) for v in Q.values()])
            img.save(f'{pasta}/{nome}.png')
            faixas.append(imagem([(v, pal) for v in Q.values()], escala=3))
        # folha de sprites com todos os personagens (uma faixa por personagem), para comparar com as referências
        larg = max(f.width for f in faixas)
        folha = Image.new('RGBA', (larg, sum(f.height + 6 for f in faixas)), (109, 107, 217, 255))
        y = 0
        for f in faixas:
            folha.paste(f, (0, y))
            y += f.height + 6
        folha.save(f'{pasta}/folha-personagens.png')
    except ImportError:
        print('Pillow não instalado: sem prévia')
    print('personagens:', ', '.join(f'{n} ({len(v[1])})' for n, v in tudo.items()))
