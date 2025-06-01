const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');

// Charger les variables d'environnement
dotenv.config({ path: './config/.env' });

// Connexion à la base de données
connectDB();

// Initialiser l'application Express
const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour parser les cookies
app.use(cookieParser());

// Activer CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:4200',
  credentials: true
}));

// Logger pour le développement
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/stocks', require('./routes/stockRoutes'));

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  // Définir le dossier statique
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Toute route non-API renvoie vers l'application Angular
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
  });
}

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack.red);
  res.status(500).json({
    success: false,
    error: err.message || 'Erreur serveur'
  });
});

// Définir le port
const PORT = process.env.PORT || 5000;

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`Serveur démarré en mode ${process.env.NODE_ENV} sur le port ${PORT}`.yellow.bold);
});

// Gérer les erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.error(`Erreur: ${err.message}`.red);
  // Fermer le serveur et quitter le processus
  server.close(() => process.exit(1));
});