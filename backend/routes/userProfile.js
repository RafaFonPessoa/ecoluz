const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
  try {
    // Busca o usuário pelo ID vindo do token
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Retorna todos os dados relevantes do usuário (menos senha)
    const { name, email, cep, ambientes } = user;

    return res.status(200).json({
      name,
      email,
      cep,
      ambientes,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
});

module.exports = router;
