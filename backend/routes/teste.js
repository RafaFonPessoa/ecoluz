const express = require('express');
const router = express.Router();

// Rota de teste
router.get('/', (req, res) => {
  res.status(200).json({
    mensagem: 'Rota de teste funcionando!',
    data: new Date(),
  });
});

module.exports = router;
