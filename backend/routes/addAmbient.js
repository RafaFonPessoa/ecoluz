const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ✅ Rota POST para adicionar ambiente
router.post('/', async (req, res) => {
  const { userId, nome } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    user.ambientes.push({ nome });
    await user.save();

    res.status(201).json({ message: 'Ambiente adicionado com sucesso', ambiente: user.ambientes[user.ambientes.length - 1] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar ambiente' });
  }
});

// Adicione esta nova rota ao arquivo addAmbient.js
router.put('/:ambienteId', async (req, res) => {
  try {
    const { userId, nome } = req.body;
    const { ambienteId } = req.params;
    
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

    ambiente.nome = nome;
    await user.save();

    res.status(200).json({
      message: 'Ambiente renomeado com sucesso',
      ambiente: ambiente
    });
  } catch (error) {
    console.error('Erro ao renomear ambiente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:ambienteId', async (req, res) => {
  console.log("Rota DELETE AMBIENT chamada");
  console.log('Parâmetros da rota:', req.params);
  console.log('Query:', req.query);
  try {
    const { ambienteId } = req.params;
    const { userId } = req.query;

    // Validação dos dados
    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Encontra o índice do ambiente no array de ambientes do usuário
    const ambienteIndex = user.ambientes.findIndex(
      ambiente => ambiente._id.toString() === ambienteId
    );

    if (ambienteIndex === -1) {
      return res.status(404).json({ error: 'Ambiente não encontrado' });
    }

    // Remove o ambiente do array
    user.ambientes.splice(ambienteIndex, 1);
    await user.save();

    res.status(200).json({
      message: 'Ambiente removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover ambiente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


module.exports = router;