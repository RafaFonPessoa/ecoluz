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

// Rota base para testar API
app.get('/', (req, res) => {
  res.send('API funcionando');
});

// Importando rotas
const testRoute = require('./routes/teste');
const authRoutes = require('./routes/auth');
const updateCEP = require('./routes/updateCEP');
const userProfileRoute = require('./routes/userProfile');
const updateName = require('./routes/updateName');
const updatePassword = require('./routes/updatePassword');
const addAmbientRoutes = require('./routes/addAmbient');
const addRoomRoutes = require('./routes/addRoom');
const addDeviceRoutes = require('./routes/addDevice');

// Rotas de teste
app.use('/api/teste', testRoute);

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// Rotas para atualização de CEP
app.use('/api/updateCEP', updateCEP);

// Rotas para perfil de usuário
app.use('/api/userProfile', userProfileRoute);

// Rotas para atualização de nome e senha
app.use('/api/updateName', updateName);
app.use('/api/updatePassword', updatePassword);

// Rotas para gerenciamento de ambientes
app.use('/api/usuario/ambientes', addAmbientRoutes);

// Rotas para gerenciamento de cômodos dentro de ambientes
app.use('/api/usuario/ambientes/:ambienteId/comodos', addRoomRoutes);

// Rotas para gerenciamento de eletrodomésticos dentro de cômodos e ambientes
app.use('/api/usuario/ambientes/:ambienteId/comodos/:comodoId/eletrodomesticos', addDeviceRoutes);

// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});