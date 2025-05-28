const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ✅ Rota POST para adicionar eletrodoméstico
router.post('/', async (req, res) => {
  const { userId, ambienteId, comodoId, nome, potenciaWatts, tempoUsoHorasPorDia } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const ambiente = user.ambientes.id(ambienteId);
    if (!ambiente) {
      return res.status(404).json({ error: 'Ambiente não encontrado' });
    }

    const comodo = ambiente.comodos.id(comodoId);
    if (!comodo) {
      return res.status(404).json({ error: 'Cômodo não encontrado' });
    }

    comodo.eletrodomesticos.push({ nome, potenciaWatts, tempoUsoHorasPorDia });
    await user.save();

    res.status(201).json({ message: 'Eletrodoméstico adicionado com sucesso', eletrodomestico: comodo.eletrodomesticos[comodo.eletrodomesticos.length - 1] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar eletrodoméstico' });
  }
});

module.exports = router;