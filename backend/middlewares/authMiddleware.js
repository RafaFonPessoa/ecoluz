// authMiddleware.js (Exemplo)
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Pega o token do header Authorization

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado, token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifica o token
    req.user = decoded; // Armazena o usuário decodificado no req.user
    console.log('Usuário autenticado:', req.user); // Adicione esse log para depuração
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

module.exports = { verifyToken };
