const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { verifyToken } = require('../middlewares/authMiddleware');

router.put('/', verifyToken, async (req, res) => {
  console.log('Rota de atualização de senha chamada');
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      console.log('Senha atual ou nova senha não fornecida');
      return res.status(400).json({ error: 'A senha atual e a nova senha são obrigatórias!' });
    }

    const userId = req.user.userId;
    console.log('UserId extraído do token:', userId);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado!' });
    }

    const senhaCorreta = await bcrypt.compare(senhaAtual, user.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Senha atual incorreta!' });
    }

    const salt = await bcrypt.genSalt(10);

    const senhaCriptografada = await bcrypt.hash(novaSenha, salt);

    user.senha = senhaCriptografada;
    await user.save();

    return res.status(200).json({ message: 'Senha atualizada com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar a senha.' });
  }
});

module.exports = router;
