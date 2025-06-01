const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Modèle Utilisateur
 * Représente les utilisateurs du système (administrateurs, gestionnaires, employés)
 */
const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, "L'email est requis"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Veuillez fournir un email valide']
  },
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Ne pas inclure par défaut dans les requêtes
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee'
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  derniereConnexion: {
    type: Date
  }
}, {
  timestamps: true
});

// Middleware pour hasher le mot de passe avant l'enregistrement
userSchema.pre('save', async function(next) {
  // Ne hasher le mot de passe que s'il a été modifié (ou est nouveau)
  if (!this.isModified('motDePasse')) return next();
  
  try {
    // Générer un salt
    const salt = await bcrypt.genSalt(10);
    // Hasher le mot de passe avec le salt
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.motDePasse);
};

// Méthode pour générer un JWT
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

module.exports = mongoose.model('User', userSchema);