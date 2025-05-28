// scraper.js – CommonJS version
// -----------------------------------------------------------------------------
// Busca o consumo de energia de um produto em Amazon, Magalu, Mercado Livre e
// KaBuM. Converte diferentes unidades para **kWh/mês** aproximado.
// -----------------------------------------------------------------------------
// Uso CLI:  node scraper.js "Geladeira Electrolux 380L"
// Requisitos: Node ≥18 (fetch builtin). Se Node <18, npm i node-fetch.
// -----------------------------------------------------------------------------

const cheerio = require('cheerio');
const UserAgent = require('user-agents');
const process = require('node:process');

// Polyfill fetch para Node < 18
let fetchFn = global.fetch;
if (typeof fetchFn !== 'function') {
  fetchFn = require('node-fetch');
}

/* ---------------------------------------------------------------------------- */
/* Util                                                                        */
/* -------------------------------------------------------------------------- */
const HEADERS = () => ({
  'user-agent': new UserAgent().toString(),
  'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8'
});

async function fetchHTML(url) {
  const res = await fetchFn(url, { headers: HEADERS() });
  if (!res.ok) throw new Error(`HTTP ${res.status} – ${url}`);
  return res.text();
}

function clean(str = '') {
  return str.replace(/\s+/g, ' ').trim();
}

function extractEnergy(str) {
  const re = /(\d+(?:[.,]\d+)?)\s*(kwh|w(?:atts?)?)/i;
  const m = clean(str).replace(',', '.').match(re);
  if (!m) return null;
  return { val: parseFloat(m[1]), unit: m[2].toLowerCase() };
}

function toKWhPerMonth({ val, unit }) {
  if (unit.startsWith('kwh')) {
    // heurística: valores altos (>60) costumam ser kWh/ano
    return val > 60 ? val / 12 : val;
  }
  // potência em W → kWh/mês (24h * 30d)
  return (val * 24 * 30) / 1000;
}

/* ---------------------------------------------------------------------------- */
/* Configuração dos sites                                                      */
/* -------------------------------------------------------------------------- */
const SITES = [
  {
    name: 'Amazon',
    searchUrl: q => `https://www.amazon.com.br/s?k=${encodeURIComponent(q)}`,
    resultSelector: "div[data-component-type='s-search-result'] h2 a, a.a-link-normal.s-no-outline",
    detailSelectors: [
      '#detailBullets_feature_div',
      '#prodDetails',
      '#feature-bullets',
      'tbody',
      'li'
    ]
  },
  {
    name: 'Magalu',
    searchUrl: q => `https://www.magazineluiza.com.br/busca/${encodeURIComponent(q)}/`,
    resultSelector: "a[data-testid='product-card-container-link'], a[href*='/produto/']",
    detailSelectors: [
      "div[data-testid='description']",
      'section',
      'li',
      'table'
    ]
  },
  {
    name: 'Mercado Livre',
    searchUrl: q => `https://lista.mercadolivre.com.br/${encodeURIComponent(q)}`,
    resultSelector: 'a.ui-search-link, a.ui-search-item__group__element',
    detailSelectors: [
      'div.ui-vpp-striped-specs__table',
      'section',
      'li',
      'dl',
      'table'
    ]
  },
  {
    name: 'KaBuM',
    searchUrl: q => `https://www.kabum.com.br/busca/${encodeURIComponent(q)}`,
    resultSelector: "a[href*='/produto/']",
    detailSelectors: ['div.product-specs', 'section', 'li', 'table']
  }
];

/* ---------------------------------------------------------------------------- */
/* Scraper                                                                     */
/* -------------------------------------------------------------------------- */
async function scrapeSite(site, product) {
  try {
    // 1) Lista de resultados
    const listHTML = await fetchHTML(site.searchUrl(product));
    const $list = cheerio.load(listHTML);
    const href = $list(site.resultSelector).attr('href');
    if (!href) return null;
    const url = href.startsWith('http') ? href : new URL(href, site.searchUrl('')).href;

    // 2) Página do produto
    const detailHTML = await fetchHTML(url);
    const $detail = cheerio.load(detailHTML);

    for (const sel of site.detailSelectors) {
      const txt = $detail(sel).text();
      const energy = extractEnergy(txt);
      if (energy) {
        const kwh = parseFloat(toKWhPerMonth(energy).toFixed(2));
        return { site: site.name, url, kwh, raw: `${energy.val} ${energy.unit}` };
      }
    }
  } catch (_) {
    // Silencia erros de rede/parsing para continuar tentando outros sites
  }
  return null;
}

async function getEnergyConsumption(product) {
  const results = await Promise.all(SITES.map(s => scrapeSite(s, product)));
  const valid = results.filter(Boolean);
  if (!valid.length) return null;
  valid.sort((a, b) => a.kwh - b.kwh);
  return valid[0];
}

module.exports = { getEnergyConsumption };

/* ---------------------------------------------------------------------------- */
/* CLI                                                                         */
/* -------------------------------------------------------------------------- */
if (require.main === module && process.argv[2]) {
  const query = process.argv.slice(2).join(' ');
  console.log('🔎  Buscando consumo para:', query);
  getEnergyConsumption(query)
    .then(r => {
      if (r) {
        console.log(`⚡ ${r.kwh} kWh/mês · ${r.site}\n${r.url}\nDados brutos: ${r.raw}`);
      } else {
        console.log('❌ Não encontrado.');
      }
    })
    .catch(err => console.error('Erro:', err.message));
}