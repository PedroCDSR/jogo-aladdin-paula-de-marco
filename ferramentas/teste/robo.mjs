// Robô de jogadas automatizadas (Playwright + Chromium), para medir a duração do jogo e achar erros.
// Uso: com o `npm run dev` rodando, `node ferramentas/teste/robo.mjs [url] [pasta-capturas]`.
// O robô "aperta" os controles por dentro (troca Entrada.atualizar), como um jogador mediano:
// anda para a direita, pula paredes, buracos e capivaras, joga maçã quando dá.
// Não vai para o build e não é dependência do projeto (o Playwright já vem no ambiente de teste).
import { createRequire } from 'node:module';
// o Playwright fica instalado fora do projeto: require() acha o pacote global, o import de ESM não
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';

const URL = process.argv[2] || 'http://localhost:5173/';
const PASTA = process.argv[3] || 'capturas';
const LIMITE_S = Number(process.env.LIMITE_S || 400);
fs.mkdirSync(PASTA, { recursive: true });

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 844, height: 390 } });
const erros = [];
pagina.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
pagina.on('pageerror', (e) => erros.push(String(e)));
await pagina.goto(URL);
await pagina.waitForFunction(() => window.jogo && window.jogo.isBooted, null, { timeout: 20000 });

// instala o "piloto" dentro da página
await pagina.evaluate(async () => {
  const { Entrada } = await import('/src/ui/Entrada.js');
  const original = Entrada.prototype.atualizar;
  const robo = (window.robo = { pularAte: 0, ultimoX: 0, ultimoProgresso: 0, antes: {}, log: [] });
  const solido = (cena, x, y) => {
    const t = cena.camada?.getTileAtWorldXY?.(x, y);
    return !!(t && t.index >= 0);
  };
  Entrada.prototype.atualizar = function () {
    original.call(this);
    const cena = this.scene;
    const j = cena.jogador;
    const agora = cena.time.now;
    const q = { direita: false, esquerda: false, pular: false, maca: false, segurando: false };
    if (cena.scene.key === 'Tapete' || this.toque?.modoTapete) {
      // tapete: sobe e desce em onda, desviando do que estiver na frente (se houver lista de obstáculos)
      q.segurando = Math.sin(agora / 700) > 0;
    } else if (j?.body) {
      q.direita = true;
      const noChao = j.body.blocked.down;
      const pe = j.y;
      const parede = solido(cena, j.x + 16, pe - 10) || solido(cena, j.x + 16, pe - 30);
      let buraco = false;
      for (let dx = 12; dx <= 40; dx += 8) if (!solido(cena, j.x + dx, pe + 8)) buraco = true;
      // capivara (ou outro inimigo) à frente
      let inimigo = null;
      for (const c of cena.capivaras?.getChildren?.() || []) {
        if (c.perigosa && c.x > j.x && c.x - j.x < 120 && Math.abs(c.y - j.y) < 24) inimigo = c;
      }
      if (inimigo && cena.registry.get('macas') > 0 && Math.floor(agora / 300) % 2 === 0) q.maca = true;
      else if (inimigo && inimigo.x - j.x < 56 && noChao) robo.pularAte = agora + 260;
      if (noChao && (parede || buraco)) robo.pularAte = agora + 380;
      // preso: sem avançar por 700 ms, pula alto
      if (j.x > robo.ultimoX + 4) {
        robo.ultimoX = j.x;
        robo.ultimoProgresso = agora;
      } else if (agora - robo.ultimoProgresso > 700 && noChao) {
        robo.pularAte = agora + 420;
        robo.ultimoProgresso = agora;
        robo.ultimoX = 0;
      }
      q.pular = agora < robo.pularAte;
      if (cena.robo) cena.robo(q, this); // a cena pode ter um piloto próprio (chefe, diálogo)
    }
    const a = robo.antes;
    this.direita = this.direita || q.direita;
    this.esquerda = this.esquerda && !q.direita ? this.esquerda : q.esquerda && !this.direita;
    this.pular = this.pular || q.pular;
    this.maca = this.maca || q.maca;
    this.segurando = this.segurando || q.segurando;
    this.pularApertou = this.pularApertou || (q.pular && !a.pular);
    this.macaApertou = this.macaApertou || (q.maca && !a.maca);
    robo.antes = q;
  };
});

// registra as trocas de cena e o tempo de cada uma
const inicio = Date.now();
const linhaDoTempo = [];
let ultima = '';
let capturas = 0;
while ((Date.now() - inicio) / 1000 < LIMITE_S) {
  const ativas = await pagina.evaluate(() =>
    window.jogo.scene.getScenes(true).map((s) => s.scene.key).filter((k) => k !== 'HUD').join('+'),
  );
  if (ativas !== ultima) {
    const t = (Date.now() - inicio) / 1000;
    linhaDoTempo.push([t, ativas]);
    console.log(`${t.toFixed(1)} s  ${ativas}`);
    ultima = ativas;
    await pagina.waitForTimeout(900);
    await pagina.screenshot({ path: `${PASTA}/${String(++capturas).padStart(2, '0')}-${ativas}.png` });
  }
  // telas com botão: Enter/espaço avançam (título, intro, diálogos, final)
  if (process.env.SEM_ENTER !== '1') await pagina.keyboard.press('Enter');
  if (/Final/.test(ativas)) break;
  await pagina.waitForTimeout(400);
}
const total = (Date.now() - inicio) / 1000;
console.log(`TOTAL ${total.toFixed(1)} s`);
console.log(`ERROS ${erros.length}`);
for (const e of erros.slice(0, 20)) console.log('  ' + e);
fs.writeFileSync(`${PASTA}/linha-do-tempo.json`, JSON.stringify({ total, linhaDoTempo, erros }, null, 2));
await navegador.close();
