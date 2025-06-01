const mongoose = require('mongoose');

/**
 * Modèle Stock
 * Représente le niveau de stock actuel pour chaque produit
 */
const stockSchema = new mongoose.Schema({
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Le produit est requis'],
    unique: true // Un produit ne peut avoir qu'un seul enregistrement de stock
  },
  quantite: {
    type: Number,
    required: [true, 'La quantité est requise'],
    default: 0,
    min: [0, 'La quantité ne peut pas être négative']
  },
  emplacement: {
    type: String,
    trim: true
  },
  seuilAlerte: {
    type: Number,
    default: 10,
    min: [0, 'Le seuil d\'alerte ne peut pas être négatif']
  },
  derniereMiseAJour: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Méthode pour vérifier si le niveau de stock est inférieur au seuil d'alerte
stockSchema.methods.estSousSeuilAlerte = function() {
  return this.quantite <= this.seuilAlerte;
};

// Méthode pour mettre à jour le stock
stockSchema.methods.mettreAJour = async function(quantite, type) {
  const ancienneQuantite = this.quantite;
  
  if (type === 'entree') {
    this.quantite += quantite;
  } else if (type === 'sortie') {
    if (this.quantite < quantite) {
      throw new Error('Stock insuffisant pour cette opération');
    }
    this.quantite -= quantite;
  } else if (type === 'ajustement') {
    this.quantite = quantite;
  } else {
    throw new Error('Type de mouvement invalide');
  }
  
  this.derniereMiseAJour = Date.now();
  await this.save();
  
  return {
    ancienneQuantite,
    nouvelleQuantite: this.quantite,
    difference: this.quantite - ancienneQuantite
  };
};

module.exports = mongoose.model('Stock', stockSchema);