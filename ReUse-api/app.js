require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const prodRoutes = require('./routes/prodRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de upload de arquivos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const picturesDir = path.join(__dirname, 'uploads/');
app.use('/api/pictures', express.static(picturesDir));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/prod', prodRoutes);
app.use('/api/trades', tradeRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API ReUse está funcionando!');
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});