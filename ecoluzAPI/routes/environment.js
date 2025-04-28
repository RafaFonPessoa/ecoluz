import express from 'express';
import { getTariffByUF } from '../services/tariffService.js';
import { calcEnvironmentCost } from '../services/costService.js';
import axios from 'axios';

const router = express.Router();
const environments = new Map();   // * trocar por DB no futuro
let idCounter = 1;

/* POST /environment
   body: { name, cep }
*/
router.post('/', async (req, res) => {
  const { name, cep } = req.body;
  const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
  const env = { id: idCounter++, name, cep, uf: data.uf, devices: [] };
  environments.set(env.id, env);
  res.json(env);
});

/* POST /environment/:id/device
   body: { name, powerW, hoursPerDay }
*/
router.post('/:id/device', (req, res) => {
  const env = environments.get(Number(req.params.id));
  if (!env) return res.status(404).send('Ambiente não encontrado');
  env.devices.push(req.body);
  res.json(env.devices);
});

/* GET /environment/:id/cost */
router.get('/:id/cost', async (req, res) => {
  const env = environments.get(Number(req.params.id));
  if (!env) return res.status(404).send('Ambiente não encontrado');
  const cost = await calcEnvironmentCost(env, env.devices, env.uf);
  res.json(cost);
});

export default router;
