import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 * 60 * 12 });
const RESOURCE_BANDEIRA = '0591b8f6-fe54-437b-b72b-1aa2efd46e42';
const RESOURCE_ADICIONAL = '5879ca80-b3bd-45b1-a135-d9b77c1d5b36';
const CKAN = 'https://dadosabertos.aneel.gov.br/api/3/action/datastore_search';

export async function getCurrentFlag() {
  if (cache.has('flag')) return cache.get('flag');

  // bandeira vigente (último registro por DatCompetencia)
  const flagResp = await axios.get(
    `${CKAN}?resource_id=${RESOURCE_BANDEIRA}&sort=DatCompetencia desc&limit=1`
  );
  const { NomBandeiraAcionada, DatCompetencia } = flagResp.data.result.records[0];

  // adicional em R$/MWh para essa bandeira
  const addResp = await axios.get(
    `${CKAN}?resource_id=${RESOURCE_ADICIONAL}&filters=${encodeURIComponent(
      `{"NomBandeiraAcionada":"${NomBandeiraAcionada}"}`
    )}&limit=1`
  );
  const adicionalMWh = Number(addResp.data.result.records[0].VlrAdicionalBandeiraRSMWh);
  const adicionalkWh = adicionalMWh / 1000;

  const result = { bandeira: NomBandeiraAcionada, adicionalkWh, competencia: DatCompetencia };
  cache.set('flag', result);
  return result;
}
