import express from 'express';
import envRoutes from './routes/environment.js';

const app = express();
app.use(express.json());
app.use('/environment', envRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`EcoLuz API rodando na porta ${PORT}`));
