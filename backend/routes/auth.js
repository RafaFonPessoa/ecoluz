const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_muito_secreto';

// Registro de novo usuário
router.post('/register', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Email e senha são obrigatórios' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ mensagem: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const user = new User({
      email,
      senha: hashedPassword,
      ambientes: [
        {
          nome: 'Ambiente Padrão',
          endereco: {},
          comodos: [
            {
              nome: 'Cômodo Padrão',
              eletrodomesticos: [],
            },
          ],
        },
      ],
    });

    await user.save();

    res.status(201).json({ mensagem: 'Usuário registrado com sucesso', userId: user._id });

  } catch (err) {
    res.status(500).json({ mensagem: 'Erro ao registrar usuário', erro: err.message });
  }
});

// Login de usuário
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Email e senha são obrigatórios' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    const isSenhaValida = await bcrypt.compare(senha, user.senha);
    if (!isSenhaValida) {
      return res.status(401).json({ mensagem: 'Senha incorreta' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      mensagem: 'Login bem-sucedido',
      token,
      userId: user._id,
      email: user.email,
    });

  } catch (err) {
    res.status(500).json({ mensagem: 'Erro no login', erro: err.message });
  }
});


module.exports = router;
