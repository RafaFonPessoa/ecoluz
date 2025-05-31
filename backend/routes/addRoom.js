const express = require('express');
const router = express.Router({ mergeParams: true });
const User = require('../models/User');

// ✅ Rota POST para adicionar cômodo
router.post('/', async (req, res) => {
  const { userId, nome } = req.body;
  const { ambienteId} = req.params;
  console.log('Dados recebidos:', req.body);
  console.log('Parâmetros da rota:', req.params);

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

router.delete('/:comodoId', async (req, res) => {
  console.log("Rota DELETE ROOM chamada");
  console.log('Parâmetros da rota:', req.params);
  console.log('Query:', req.query);
  try {
    const { ambienteId, comodoId } = req.params;
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
    const comodoIndex = ambiente.comodos.findIndex(
      e => e._id.toString() === comodoId
    );

    if (comodoIndex === -1) {
      return res.status(404).json({ error: 'Eletrodoméstico não encontrado' });
    }

    // Remove o eletrodoméstico
    ambiente.comodos.splice(comodoIndex, 1);
    await user.save();

    res.status(200).json({
      message: 'Comodo removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover cômodo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;