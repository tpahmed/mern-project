const mongoose = require('mongoose');

/**
 * Modèle Mouvement Stock
 * Enregistre les entrées et sorties de stock
 */
const stockMovementSchema = new mongoose.Schema({
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Le produit est requis']
  },
  quantite: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [0.01, 'La quantité doit être supérieure à 0']
  },
  type: {
    type: String,
    required: [true, 'Le type de mouvement est requis'],
    enum: ['entree', 'sortie', 'ajustement'],
    lowercase: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "L'utilisateur est requis"]
  },
  reference: {
    type: String,
    trim: true
  },
  commentaire: {
    type: String,
    trim: true
  },
  stockAvant: {
    type: Number,
    required: true
  },
  stockApres: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances des requêtes fréquentes
stockMovementSchema.index({ produit: 1, date: -1 });
stockMovementSchema.index({ utilisateur: 1, date: -1 });
stockMovementSchema.index({ type: 1, date: -1 });

// Méthode statique pour créer un nouveau mouvement de stock
stockMovementSchema.statics.enregistrer = async function(mouvementData) {
  const { produit, quantite, type, utilisateur, reference, commentaire } = mouvementData;
  
  // Récupérer le stock actuel
  const Stock = mongoose.model('Stock');
  let stock = await Stock.findOne({ produit });
  
  // Si le stock n'existe pas, le créer
  if (!stock && type !== 'sortie') {
    stock = new Stock({
      produit,
      quantite: 0
    });
  } else if (!stock && type === 'sortie') {
    throw new Error('Stock inexistant pour ce produit');
  }
  
  const stockAvant = stock.quantite;
  
  // Mettre à jour le stock
  try {
    const resultat = await stock.mettreAJour(quantite, type);
    
    // Créer le mouvement de stock
    const mouvement = new this({
      produit,
      quantite,
      type,
      utilisateur,
      reference,
      commentaire,
      stockAvant,
      stockApres: resultat.nouvelleQuantite
    });
    
    await mouvement.save();
    return mouvement;
  } catch (error) {
    throw error;
  }
};

// Méthode pour annuler un mouvement
stockMovementSchema.methods.annuler = async function() {
  // Vérifier si le mouvement peut être annulé (par exemple, s'il est récent)
  const delaiMaxAnnulation = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
  const maintenant = new Date();
  const dateCreation = this.createdAt || this.date;
  
  if (maintenant - dateCreation > delaiMaxAnnulation) {
    throw new Error('Ce mouvement ne peut plus être annulé car il date de plus de 24 heures');
  }
  
  // Créer un mouvement inverse
  const StockMovement = mongoose.model('StockMovement');
  const typeInverse = this.type === 'entree' ? 'sortie' : (this.type === 'sortie' ? 'entree' : 'ajustement');
  
  try {
    const mouvementInverse = await StockMovement.enregistrer({
      produit: this.produit,
      quantite: this.quantite,
      type: typeInverse,
      utilisateur: this.utilisateur,
      reference: `Annulation du mouvement ${this._id}`,
      commentaire: `Annulation automatique du mouvement du ${this.date.toLocaleDateString()}`
    });
    
    // Marquer ce mouvement comme annulé
    this.commentaire = `${this.commentaire || ''} [ANNULÉ le ${maintenant.toLocaleDateString()}]`;
    await this.save();
    
    return mouvementInverse;
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('StockMovement', stockMovementSchema);