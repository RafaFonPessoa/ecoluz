const mongoose = require('mongoose');

const EletroSchema = new mongoose.Schema({
  nome: String,
  potenciaWatts: Number,
  tempoUsoHorasPorDia: Number,
});

const ComodoSchema = new mongoose.Schema({
  nome: String,
  eletrodomesticos: [EletroSchema],
});

const EnderecoSchema = new mongoose.Schema({
  cep: String,
  rua: String,
  bairro: String,
  cidade: String,
  estado: String,
  numero: String,
  complemento: String,
});

const AmbienteSchema = new mongoose.Schema({
  nome: String,
  endereco: EnderecoSchema,
  comodos: [ComodoSchema],
});

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    default: '',
  },
  senha: {
    type: String,
    required: true,
  },
  cep: { 
    type: String, 
    default: '' },
  ambientes: [AmbienteSchema],
});


module.exports = mongoose.model('User', UserSchema);
