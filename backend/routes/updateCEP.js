// routes/updateCEP.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middlewares/authMiddleware');

router.put('/', verifyToken, async (req, res) => {
  console.log('Rota de atualização de CEP chamada');
  try {
    const { cep } = req.body;

    // Buscar o usuário pelo ID vindo do token
    const user = await User.findById(req.user.userId);

    console.log('E-mail do usuário:', user?.email);

    if (!cep) {
      return res.status(400).json({ error: 'CEP é obrigatório!' });
    }

    const formattedCep = cep.replace(/\D/g, '');
    if (formattedCep.length !== 8 || !/^\d+$/.test(formattedCep)) {
      return res.status(400).json({ error: 'CEP inválido!' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado!' });
    }

    user.cep = formattedCep;
    await user.save();

    return res.status(200).json({ message: 'CEP atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar o CEP:', error);
    return res.status(500).json({ error: 'Erro ao atualizar o CEP.' });
  }
});


module.exports = router;
