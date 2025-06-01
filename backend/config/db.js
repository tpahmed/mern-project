const mongoose = require('mongoose');

/**
 * Connexion à la base de données MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });

    console.log(`MongoDB connecté: ${conn.connection.host}`.cyan.underline.bold);
    return conn;
  } catch (error) {
    console.error(`Erreur: ${error.message}`.red);
    process.exit(1);
  }
};

module.exports = connectDB;