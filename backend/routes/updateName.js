const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middlewares/authMiddleware');

router.put('/', verifyToken, async (req, res) => {
  console.log('Rota de atualização de nome chamada');
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Nome é obrigatório e deve ser uma string!' });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado!' });
    }

    user.name = name;
    await user.save();

    return res.status(200).json({ message: 'Nome atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar o nome:', error);
    return res.status(500).json({ error: 'Erro ao atualizar o nome.' });
  }
});

module.exports = router;
