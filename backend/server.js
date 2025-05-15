// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
// Middleware
app.use(cors());
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB conectado com sucesso'))
.catch(err => console.error('Erro ao conectar no MongoDB:', err));

// Rotas
app.get('/', (req, res) => {
  res.send('API funcionando');
});

// Importando as rotas
const testRoute = require('./routes/teste');
app.use('/api/teste', testRoute);

const authRoutes = require('./routes/auth')
app.use('/api/auth', authRoutes);

const updateCEP = require('./routes/updateCEP');
app.use('/api/updateCEP', updateCEP);

const userProfileRoute = require('./routes/userProfile');
app.use('/api/userProfile', userProfileRoute);


// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
