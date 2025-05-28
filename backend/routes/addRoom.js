const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ✅ Rota POST para adicionar cômodo
router.post('/', async (req, res) => {
  const { userId, ambienteId, nome } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const ambiente = user.ambientes.id(ambienteId);
    if (!ambiente) {
      return res.status(404).json({ error: 'Ambiente não encontrado' });
    }

    ambiente.comodos.push({ nome });
    await user.save();

    res.status(201).json({ message: 'Cômodo adicionado com sucesso', comodo: ambiente.comodos[ambiente.comodos.length - 1] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar cômodo' });
  }
});

// Adicione esta nova rota ao arquivo addRoom.js
router.put('/:comodoId', async (req, res) => {
  try {
    const { userId, nome } = req.body;
    const { ambienteId, comodoId } = req.params;
    
    if (!userId || !nome) {
      return res.status(400).json({ error: 'UserId e nome são obrigatórios' });
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

    comodo.nome = nome;
    await user.save();

    res.status(200).json({
      message: 'Cômodo renomeado com sucesso',
      comodo: comodo
    });
  } catch (error) {
    console.error('Erro ao renomear cômodo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;