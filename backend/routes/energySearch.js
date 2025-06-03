const express = require('express');
const router = express.Router();
const { getEnergyConsumption } = require('../energyScraper');

// Rota para buscar consumo de energia
router.post('/', async (req, res) => {
  try {
    const { eletrodomestico } = req.body;
    
    if (!eletrodomestico || typeof eletrodomestico !== 'string') {
      return res.status(400).json({ error: 'Nome do eletrodoméstico é obrigatório' });
    }

    // Chamada para o scraper (com headless=true em produção)
    const [found, kwh] = await getEnergyConsumption(
      eletrodomestico, 
      true,  // headless - true em produção para melhor performance
      false  // debug - false em produção
    );

    if (found) {
      return res.json({ encontrado: true, kwh });
    } else {
      return res.json({ encontrado: false });
    }
  } catch (error) {
    console.error('Erro ao buscar consumo:', error);
    return res.status(500).json({ error: 'Erro ao buscar consumo de energia' });
  }
});

module.exports = router;