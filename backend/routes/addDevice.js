const express = require('express');
const router = express.Router({ mergeParams: true });
const User = require('../models/User');

// Rota POST para adicionar eletrodoméstico
router.post('/', async (req, res) => {
  try {
    const { ambienteId, comodoId } = req.params;
    const { userId, nome, potenciaWatts, tempoUsoHorasPorDia } = req.body;

    // Validação dos dados
    if (!userId || !nome || !potenciaWatts || !tempoUsoHorasPorDia) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

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

    // Cria o novo eletrodoméstico
    const novoEletrodomestico = {
      nome,
      potenciaWatts: Number(potenciaWatts),
      tempoUsoHorasPorDia: Number(tempoUsoHorasPorDia)
    };

    comodo.eletrodomesticos.push(novoEletrodomestico);
    await user.save();

    res.status(201).json({
      message: 'Eletrodoméstico adicionado com sucesso',
      eletrodomestico: novoEletrodomestico
    });
  } catch (error) {
    console.error('Erro ao adicionar eletrodoméstico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota DELETE para remover eletrodoméstico
router.delete('/:eletrodomesticoId', async (req, res) => {
  console.log('Parâmetros da rota:', req.params);
  console.log('Query:', req.query);
  try {
    const { ambienteId, comodoId, eletrodomesticoId } = req.params;
    const { userId } = req.query;

    // Validação dos dados
    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }

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

    // Encontra o índice do eletrodoméstico
    const eletroIndex = comodo.eletrodomesticos.findIndex(
      e => e._id.toString() === eletrodomesticoId
    );

    if (eletroIndex === -1) {
      return res.status(404).json({ error: 'Eletrodoméstico não encontrado' });
    }

    // Remove o eletrodoméstico
    comodo.eletrodomesticos.splice(eletroIndex, 1);
    await user.save();

    res.status(200).json({
      message: 'Eletrodoméstico removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover eletrodoméstico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;