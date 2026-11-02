// Métricas de uso com o GoatCounter (decisão do Pedro, 02/11/2026): só contagens anônimas, sem cookies e sem dados
// pessoais (regra 5). Não carrega o script deles: chama direto o endereço de contagem com uma imagem de 1 pixel,
// então o site não fica mais pesado e não gasta banda do Netlify.
//
// Só conta no site de produção (METRICAS.siteProducao): prévias do dev, testes e o robô não entram nos números.
// Com METRICAS.goatcounter vazio, nada é enviado. Para conferir sem enviar: abra com ?metricas=ver e veja o console.
import { METRICAS } from './config.js';

const ver = new URLSearchParams(location.search).get('metricas') === 'ver';
const ligado = !!METRICAS.goatcounter && location.hostname === METRICAS.siteProducao;

function enviar(caminho, titulo, evento) {
  if (ver) console.info(`[métricas] ${evento ? 'evento' : 'visita'}: ${caminho}`);
  if (!ligado) return;
  const q = new URLSearchParams({ p: caminho, t: titulo, rnd: Math.random().toString(36).slice(2) });
  if (evento) q.set('e', 'true');
  else if (document.referrer) q.set('r', document.referrer); // de onde veio (WhatsApp, Instagram...), sem a pessoa
  try {
    new Image().src = `https://${METRICAS.goatcounter}.goatcounter.com/count?${q}`;
  } catch {
    // sem rede ou bloqueado: o jogo segue normalmente
  }
}

// Uma visita por abertura do site.
export function registrarVisita() {
  enviar(`/${METRICAS.prefixo}${location.pathname || '/'}`, document.title, false);
}

// Evento do funil (nomes em EVENTOS, abaixo). Cada vez que acontece conta 1.
export function registrar(nome) {
  enviar(`${METRICAS.prefixo}/${nome}`, nome, true);
}

// Nomes dos eventos, num lugar só (no painel aparecem com o prefixo: aladdin/jogar-facil, aladdin/final...):
//   jogar-facil, jogar-medio, jogar-dificil   tocou em JOGAR e escolheu o nível
//   fase1-itajuba, fase2-espaco, fase3-chefe   terminou a fase
//   final                                      chegou à tela final (pelo jogo)
//   pular-para-final                           foi ao final pelo menu de pausa
//   botao-ingressos, botao-compartilhar, botao-instagram, sobre, jogar-de-novo
