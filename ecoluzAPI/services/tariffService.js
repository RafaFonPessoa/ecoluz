import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 * 60 * 12 }); // 12 h

const RESOURCE_ID = 'fcf2906c-7c32-4b9b-a637-054e7a5234f4';
const ANEEL_CKAN = 'https://dadosabertos.aneel.gov.br/api/3/action/datastore_search';

/**
 * Retorna tarifa (R$/kWh) para classe residencial convencional (B1) de uma UF.
 * Por padrão usa TE + TUSD.
 */
export async function getTariffByUF(uf) {
  const key = `tariff-${uf}`;
  if (cache.has(key)) return cache.get(key);

  // CKAN query → filtra Subgrupo B1, Modalidade Convencional, Classe "Residencial"
  const query = encodeURIComponent(
    `{"uf":"${uf}","DscSubGrupo":"B1","DscModalidadeTarifaria":"Convencional","DscClasse":"Residencial"}`
  );

  const url = `${ANEEL_CKAN}?resource_id=${RESOURCE_ID}&filters=${query}&limit=1`;
  const { data } = await axios.get(url);

  if (!data.result.records.length) throw new Error(`Tarifa não encontrada para UF ${uf}`);

  const { VlrTUSD, VlrTE } = data.result.records[0];

  // conversão R$/MWh → R$/kWh  (divide por 1000)
  const base = (Number(VlrTUSD) + Number(VlrTE)) / 1000;

  cache.set(key, base);
  return base;
}
