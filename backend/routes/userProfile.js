// routes/userProfile.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.status(200).json({ cep: user.cep || '' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
});

module.exports = router;
