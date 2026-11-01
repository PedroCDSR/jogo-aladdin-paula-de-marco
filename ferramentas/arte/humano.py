"""Figura humana comum a todos os personagens de 48x64 (Etapa 8A), sobre o renderizador de volumes (modelo.py).

Antes, cada personagem tinha o seu desenho (pixel.py, Graphics, geradores separados) e saía com qualidade diferente.
Aqui existe UM esqueleto (o mesmo do Aladdin da Etapa 8.0: proporções, luz, 4 tons, contorno colorido) e cada
personagem é uma subclasse de `Figura` que troca só o figurino: materiais, cabelo, roupa de cima, roupa de baixo,
calçado e acessórios. Assim a escala, a luz e o acabamento ficam iguais em todo o elenco.

Convenções (iguais às de gerar_jogador.py):
- todos olham para a DIREITA (o jogo espelha); vista 3/4;
- ângulos em graus: 0 = para baixo, +90 = para a frente (+x), 180 = para cima;
- quadro 48x64, sola na linha 62, contorno de baixo na 63.

Uso: `class Paula(Figura): ...` e `Paula().quadro(pose(...))` devolve a matriz de texto.
"""
import math

from modelo import Boneco, Material, paleta_de, ponto, mistura  # noqa: F401

L, A = 48, 64

# Materiais comuns (pele em 3 tons de base, olhos, boca)
PELE_CLARA = Material('pele_clara', 'AsSzZ', ['#FCE0C4', '#EDB892', '#C98962', '#97583D', '#55291C'], (0.78, 0.42, 0.10))
PELE_MORENA = Material('pele_morena', 'AsSzZ', ['#F6C79A', '#DB9A6B', '#B06C45', '#80452C', '#4A2216'], (0.78, 0.42, 0.10))
PELE_ESCURA = Material('pele_escura', 'AsSzZ', ['#D99A6C', '#A8673F', '#7E4628', '#57301C', '#2E140C'], (0.78, 0.42, 0.10))
EXTRAS_ROSTO = {'w': '#FFF6EA', 'e': '#1E1018', 'q': '#8E3A34', 'n': '#C2535A', 'c': '#F29A9A'}
CONTORNO_ROSTO = {'w': 'Z', 'e': 'Z', 'q': 'Z', 'n': 'Z', 'c': 'Z'}


def pose(hx=23.0, hy=33.0, tronco=4.0, cabeca=0.0,
         coxa_f=0.0, joelho_f=0.0, pe_f=0.0, coxa_t=0.0, joelho_t=0.0, pe_t=0.0,
         ombro_f=-8.0, cotovelo_f=20.0, ombro_t=10.0, cotovelo_t=25.0,
         vento=0.0, fase=0.0, rosto='normal', mao_f='aberta', mao_t='aberta', saia=0.0, braco_t_atras=True,
         braco_f_frente=True, sentado=False, costas=False, extra=None):
    """Mesmo formato de gerar_jogador.pose(). costas=True desenha a figura de costas (sem rosto: usado na pirueta).
    extra: dicionário livre para o figurino (ex.: segurar microfone, piscar)."""
    d = dict(locals())
    d['extra'] = extra or {}
    return d


def parado_base(i, **kw):
    """Respiração de 4 quadros com braços soltos; os personagens ajustam com kw."""
    resp = [0.0, 0.5, 1.0, 0.5][i % 4]
    base = dict(hy=33.0 + resp * 0.4, tronco=1.0 - resp * 0.6, cabeca=-1.0 + resp,
                coxa_f=5, joelho_f=6, pe_f=-4, coxa_t=-4, joelho_t=2, pe_t=0,
                ombro_f=-6 + resp * 2, cotovelo_f=24, ombro_t=8, cotovelo_t=20, vento=0.05, fase=i * 0.9)
    base.update(kw)
    return pose(**base)


class Figura:
    """Esqueleto + figurino padrão. As subclasses trocam materiais e os métodos de cada peça."""
    nome = 'figura'
    PELE = PELE_MORENA
    # comprimentos (px)
    COXA, CANELA = 13.5, 13.0
    BRACO, ANTEBRACO = 8.5, 8.0
    COLUNA = 14.0
    LARG_TRONCO = 1.0  # multiplica a largura do peito
    CABECA = 1.0  # multiplica o tamanho da cabeça
    RAIO_BRACO = 2.0
    RAIO_PERNA = 3.4

    def materiais(self):
        return [self.PELE]

    def extras(self):
        return dict(EXTRAS_ROSTO)

    def paleta(self):
        return paleta_de(self.materiais(), self.extras())

    def contorno_fixo(self):
        return dict(CONTORNO_ROSTO)

    # ------------------------------------------------------------------ esqueleto
    def juntas(self, p):
        c = dict(p)
        hx, hy, incl = p['hx'], p['hy'], p['tronco']
        c['pescoco'] = ponto((hx, hy), self.COLUNA, 180 - incl)
        c['peito'] = mistura((hx, hy), c['pescoco'], 0.68)
        cab = ponto(c['pescoco'], 6.6 * self.CABECA, 180 - incl * 0.6 - p['cabeca'])
        c['cab'] = (cab[0] + 0.6, cab[1])
        pz = c['pescoco']
        c['ombro_t'] = (pz[0] + 1.8 * self.LARG_TRONCO, pz[1] + 2.4)
        c['ombro_f'] = (pz[0] - 2.0 * self.LARG_TRONCO, pz[1] + 2.8)
        c['quadril_t'] = (hx + 1.6, hy)
        c['quadril_f'] = (hx - 1.2, hy + 0.4)
        return c

    def perna_juntas(self, quadril, coxa, joelho, pe):
        j = ponto(quadril, self.COXA, coxa)
        t = ponto(j, self.CANELA, coxa - joelho)
        ang_pe = coxa - joelho + 90 - pe
        return j, t, ang_pe

    # ------------------------------------------------------------------ desenho (de trás para a frente)
    def desenhar(self, p):
        b = Boneco(L, A)
        c = self.juntas(p)
        self.b, self.c = b, c
        self.fundo(b, c)  # cabelo comprido, capa, cauda de fumaça
        if p['braco_t_atras']:
            c['mao_t'] = self.braco(b, c, 't', 1)
        self.atras(b, c)  # pontas de pano atrás do corpo
        if not p['sentado']:
            self.perna(b, c, 't', 1)
        self.perna(b, c, 'f', 0)
        if p['sentado']:
            self.perna(b, c, 't', 1)
        self.roupa_baixo(b, c)  # saia ou manto por cima das pernas
        self.tronco(b, c)
        self.cintura(b, c)
        self.pescoco(b, c)
        self.cabeca(b, c)
        if p['braco_f_frente']:
            c['mao_f'] = self.braco(b, c, 'f', 0)
        if not p['braco_t_atras']:
            c['mao_t'] = self.braco(b, c, 't', 0)
        self.na_frente(b, c)  # objetos na mão (microfone, ingressos, varinha)
        if not p['costas']:
            self.rosto(b, c)
        self.detalhes(b, c)
        return b

    def quadro(self, p):
        return self.desenhar(p).texto(self.contorno_fixo())

    # ------------------------------------------------------------------ peças (padrões; subclasses trocam)
    def fundo(self, b, c):
        pass

    def atras(self, b, c):
        pass

    def roupa_baixo(self, b, c):
        pass

    def na_frente(self, b, c):
        pass

    def detalhes(self, b, c):
        pass

    def manga(self, b, ombro, cot, ang, lado, esc):
        """Manga por cima do braço (None = braço nu)."""
        pass

    def material_braco(self, lado):
        return self.PELE

    def mao(self, b, mao_pt, ang, tipo, esc):
        if tipo == 'punho':
            b.elipse(mao_pt, 2.1, 2.1, self.PELE, esc)
        else:
            b.elipse(mao_pt, 1.9, 2.3, self.PELE, esc, giro=-ang)

    def braco(self, b, c, lado, esc):
        ombro = c['ombro_' + lado]
        ang, dobra = c['ombro_' + lado], c['cotovelo_' + lado]
        ang, dobra = c[f'ombro_{lado}'] if False else self.p_ang(c, lado)
        cot = ponto(ombro, self.BRACO, ang)
        mao = ponto(cot, self.ANTEBRACO, ang + dobra)
        mat = self.material_braco(lado)
        r = self.RAIO_BRACO
        b.capsula(ombro, cot, r, r * 0.88, mat, esc)
        b.capsula(cot, mao, r * 0.88, r * 0.72, mat, esc)
        self.manga(b, ombro, cot, ang, lado, esc)
        mao2 = ponto(mao, 1.2, ang + dobra)
        self.mao(b, mao2, ang + dobra, c['mao_' + lado] if isinstance(c.get('mao_' + lado), str) else 'aberta', esc)
        c['cot_' + lado] = cot
        c['ang_mao_' + lado] = ang + dobra
        return mao2

    def p_ang(self, c, lado):
        return c['ombro_ang_' + lado], c['cotovelo_' + lado]

    def perna(self, b, c, lado, esc):
        quadril = c['quadril_' + lado]
        j, t, ang_pe = self.perna_juntas(quadril, c['coxa_' + lado], c['joelho_' + lado], c['pe_' + lado])
        self.calca(b, quadril, j, t, esc)
        self.sapato(b, t, ang_pe, esc)
        c['joelho_pt_' + lado], c['tornozelo_' + lado], c['ang_pe_' + lado] = j, t, ang_pe

    def calca(self, b, quadril, j, t, esc):
        r = self.RAIO_PERNA
        b.capsula(quadril, j, r, r * 0.86, self.CALCA, esc, achatar=0.95)
        b.capsula(j, t, r * 0.86, r * 0.66, self.CALCA, esc, achatar=0.95)

    def sapato(self, b, t, ang_pe, esc):
        dedos = ponto(t, 5.0, ang_pe)
        b.capsula(t, dedos, 1.9, 1.4, self.SAPATO, esc, achatar=0.85)
        sola_a = ponto(t, 1.9, ang_pe + 90)
        sola_b = ponto(dedos, 1.3, ang_pe + 90)
        b.capsula(ponto(sola_a, 1.0, ang_pe + 180), sola_b, 0.6, 0.6, self.SOLA, esc, separar=False)

    def tronco(self, b, c):
        hx, hy = c['hx'], c['hy']
        lt = self.LARG_TRONCO
        b.capsula(c['peito'], (hx, hy - 1.5), 4.4 * lt, 3.9 * lt, self.ROUPA, separar=False, achatar=0.92)
        b.elipse((c['peito'][0] + 0.4, c['peito'][1] - 0.8), 4.6 * lt, 3.3, self.ROUPA, separar=False, achatar=0.9)

    def cintura(self, b, c):
        pass

    def pescoco(self, b, c):
        cab = c['cab']
        b.capsula(c['pescoco'], (cab[0] - 0.4, cab[1] + 2.0), 2.0, 2.0, self.PELE, separar=False)

    def cabeca(self, b, c):
        cx, cy = c['cab']
        k = self.CABECA
        self.cabelo_tras(b, c)
        if c['costas']:
            # de costas: a nuca e o cabelo cobrem o rosto
            b.elipse((cx - 0.2, cy + 0.6), 4.4 * k, 4.9 * k, self.PELE, 1, separar=False, achatar=0.65)
            self.cabelo_costas(b, c)
        else:
            b.elipse((cx + 0.8, cy + 0.6), 4.4 * k, 4.9 * k, self.PELE, separar=False, achatar=0.65)
            b.elipse((cx + 2.4, cy + 3.0), 2.6 * k, 2.3 * k, self.PELE, separar=False, achatar=0.6)
            b.elipse((cx - 1.8, cy + 1.2), 1.2, 1.7, self.PELE, 1, separar=False, achatar=0.8)
            self.cabelo_frente(b, c)
        self.chapeu(b, c)

    def cabelo_tras(self, b, c):
        pass

    def cabelo_frente(self, b, c):
        pass

    def cabelo_costas(self, b, c):
        self.cabelo_frente(b, c)

    def chapeu(self, b, c):
        pass

    # ------------------------------------------------------------------ rosto
    def rosto(self, b, c):
        cx, cy = c['cab']
        tipo = c['rosto']
        ox1, ox2, oy = cx + 1.2, cx + 4.0, cy + 0.6
        sob_ch = self.SOBRANCELHA
        if tipo in ('normal', 'esforco', 'feliz', 'fala', 'socorro', 'bravo'):
            b.px(ox1, oy, 'w'); b.px(ox1 + 1, oy, 'e'); b.px(ox1 + 1, oy + 1, 'e'); b.px(ox1, oy + 1, 'w')
            b.px(ox2, oy, 'e'); b.px(ox2, oy + 1, 'e'); b.px(ox2 - 1, oy + 1, 'w')
            if tipo == 'socorro':  # sobrancelhas para cima, preocupada
                b.px(ox1 - 0.5, oy - 1.0, sob_ch); b.px(ox1 + 0.6, oy - 1.8, sob_ch); b.px(ox2 + 0.6, oy - 1.8, sob_ch)
            elif tipo == 'bravo':
                b.px(ox1 - 0.5, oy - 2.0, sob_ch); b.px(ox1 + 0.6, oy - 1.4, sob_ch); b.px(ox1 + 1.6, oy - 1.0, sob_ch)
                b.px(ox2, oy - 1.0, sob_ch); b.px(ox2 + 1, oy - 1.6, sob_ch)
            else:
                sob = -1.4 if tipo != 'esforco' else -1.0
                b.px(ox1 - 0.5, oy + sob, sob_ch); b.px(ox1 + 0.6, oy + sob - 0.4, sob_ch)
                b.px(ox1 + 1.6, oy + sob - 0.4, sob_ch)
                b.px(ox2, oy + sob - 0.2, sob_ch); b.px(ox2 + 1, oy + sob, sob_ch)
        elif tipo in ('dano', 'tonto'):
            b.px(ox1, oy - 0.4, 'e'); b.px(ox1 + 1, oy + 0.5, 'e'); b.px(ox1, oy + 1.4, 'e')
            b.px(ox1 + 1, oy - 0.4, 'e' if tipo == 'tonto' else '.' if False else 'e')
            b.px(ox1, oy + 1.4, 'e'); b.px(ox1 + 1, oy + 1.4, 'e' if tipo == 'tonto' else 'e')
            b.px(ox2 + 0.4, oy - 0.4, 'e'); b.px(ox2 - 0.6, oy + 0.5, 'e'); b.px(ox2 + 0.4, oy + 1.4, 'e')
        elif tipo in ('fechado', 'dorme', 'sorriso_fechado'):
            # olhos fechados, felizes (arquinhos)
            b.px(ox1 - 0.2, oy + 0.8, 'e'); b.px(ox1 + 0.8, oy + 0.2, 'e'); b.px(ox1 + 1.8, oy + 0.8, 'e')
            b.px(ox2 - 0.4, oy + 0.2, 'e'); b.px(ox2 + 0.6, oy + 0.8, 'e')
        # bochecha rosada (personagens que pedem)
        if self.BOCHECHA and tipo not in ('dano', 'tonto'):
            b.px(cx + 2.2, cy + 3.2, 'c')
        # nariz
        b.tom_em(cx + 5.2, cy + 2.1, self.PELE, 2)
        b.tom_em(cx + 4.4, cy + 2.9, self.PELE, 2)
        # boca
        if tipo in ('feliz', 'sorriso_fechado'):
            b.px(cx + 2.6, cy + 4.2, 'q'); b.px(cx + 3.6, cy + 4.6, 'n'); b.px(cx + 4.4, cy + 4.0, 'q')
        elif tipo in ('fala', 'socorro', 'dano', 'tonto'):
            b.px(cx + 3.0, cy + 4.2, 'q'); b.px(cx + 3.0, cy + 5.0, 'n'); b.px(cx + 4.0, cy + 4.4, 'q')
            b.px(cx + 4.0, cy + 5.0, 'q')
        elif tipo == 'esforco' or tipo == 'bravo':
            b.px(cx + 3.0, cy + 4.4, 'q'); b.px(cx + 4.0, cy + 4.4, 'q')
        elif tipo == 'dorme':
            b.px(cx + 3.4, cy + 4.4, 'q')
        else:
            b.px(cx + 3.0, cy + 4.4, 'q'); b.px(cx + 4.0, cy + 4.2, 'q')
        b.tom_em(cx + 0.2, cy + 5.6, self.PELE, 3)
        b.tom_em(cx + 1.2, cy + 5.9, self.PELE, 2)

    SOBRANCELHA = 'e'
    BOCHECHA = False


# ----------------------------------------------------------------------------- ajudantes de pano e cabelo

def corrente(b, origem, comp, larg, direcao, vento, fase, mat, esc=0, n=4, afinar=0.15, amplitude=12, separar=True):
    """Corrente de cápsulas que ondula (pontas de faixa, rabo de cavalo, trança, cauda de fumaça).
    Devolve os pontos para quem quiser pintar detalhes por cima."""
    pts = [origem]
    x, y = origem
    for i in range(n):
        ang_i = direcao + math.sin(fase + i * 1.3) * (amplitude + 18 * vento) * (i + 1) / n
        x, y = ponto((x, y), comp / n, ang_i)
        pts.append((x, y))
    for i in range(n):
        r0 = larg * (1 - afinar * i)
        b.capsula(pts[i], pts[i + 1], r0, r0 * (1 - afinar), mat, esc, separar=separar)
    return pts


def espelhar(linhas):
    return [l[::-1] for l in linhas]


def encostar_no_chao(quadros, regua, excecoes=()):
    """Desce todos os quadros juntos até o contorno do pé do quadro 'regua' encostar na linha 63."""
    def ultima(linhas):
        return max(y for y, l in enumerate(linhas) if any(ch != '.' for ch in l))
    desce = A - 1 - ultima(quadros[regua])
    if desce:
        for nome in quadros:
            if nome in excecoes:
                continue
            vazio = '.' * len(quadros[nome][0])
            quadros[nome] = [vazio] * desce + quadros[nome][:len(quadros[nome]) - desce]
    return quadros


def altura_ocupada(linhas):
    ocup = [y for y, l in enumerate(linhas) if any(ch != '.' for ch in l)]
    return ocup[0], ocup[-1], ocup[-1] - ocup[0] + 1
