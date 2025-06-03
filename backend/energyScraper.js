// energyScraper.js
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function getEnergyConsumption(searchTerm, headless = true, debug = false) {
  const browser = await puppeteer.launch({
    headless,
    defaultViewport: null,
    args: ['--no-sandbox'],
  });

  try {
    const kwh = await scrapeAmazon(browser, searchTerm, debug);
    return [kwh !== null, kwh];
  } finally {
    await browser.close();
  }
}

async function scrapeAmazon(browser, term, debug) {
  const page = await browser.newPage();
  await setAntiBotHeaders(page);

  const productUrl = isAmazonUrl(term)
    ? term
    : await findFirstAmazonProduct(page, term);
  if (!productUrl) return null;

  await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await dismissAmazonModals(page);

  const rawText = await page.evaluate(() => document.body.innerText || '');

  if (debug) {
    const fs = require('fs/promises');
    await fs.writeFile('amazon-debug.html', await page.content());
    await fs.writeFile('amazon-debug.txt', rawText);
  }
  await page.close();

  return extractKwh(rawText);
}

async function findFirstAmazonProduct(page, term) {
  const searchUrl = `https://www.amazon.com.br/s?k=${encodeURIComponent(term)}`;
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

  await page.waitForSelector(
    'div.s-result-item[data-component-type="s-search-result"] a.a-link-normal',
    { timeout: 15000 }
  );

  const href = await page.$eval(
    'div.s-result-item[data-component-type="s-search-result"] a.a-link-normal',
    (a) => a.href
  ).catch(() => null);

  return href;
}
function extractKwh(raw) {
  const cleaned = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/quilowatt/g, 'kilowatt')
    .replace(/\s+/g, ' ');

  // Busca apenas o valor numérico de kWh
  const kwhPattern = /(\d+(?:[.,]\d+)?)\s*(kwh|kilowatt(?:\shour)?)/i;
  const kwhMatch = kwhPattern.exec(cleaned);
  if (kwhMatch) return parseNumber(kwhMatch[1]);

  // Se não encontrar kWh, procura por Watts e converte para kWh (1 kWh = 1000W)
  const wattsPattern = /(\d+(?:[.,]\d+)?)\s*w(?!h)/i;
  const wattsMatch = wattsPattern.exec(cleaned);
  if (wattsMatch) return parseNumber(wattsMatch[1]) / 1000;

  return null;
}
  
function parseNumber(n) {
  return parseFloat(n.replace(',', '.'));
}

function isAmazonUrl(t) {
  return /^https?:\/\/.*amazon\./i.test(t);
}

async function setAntiBotHeaders(page) {
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/122 Safari/537.36'
  );
  await page.setExtraHTTPHeaders({ 'accept-language': 'pt-BR,pt;q=0.9' });
}

async function dismissAmazonModals(page) {
  const buttons = await page.evaluate(() => {
    const xpath = "//input[@name='accept' or @data-action-type='DISMISS'] | //button[text()='Fechar'] | //button[text()='Não, obrigado']";
    const elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const result = [];
    for (let i = 0; i < elements.snapshotLength; i++) {
      const element = elements.snapshotItem(i);
      if (element) result.push(element);
    }
    return result;
  });

  for (const b of buttons) {
    await page.evaluate((button) => button.click(), b).catch(() => {});
  }
}

module.exports = { getEnergyConsumption };