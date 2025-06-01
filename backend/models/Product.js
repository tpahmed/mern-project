const mongoose = require('mongoose');

/**
 * Modèle Produit
 * Représente les articles disponibles en stock
 */
const productSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  prix: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  codeBarre: {
    type: String,
    required: false,
    unique: true,
    sparse: true // Permet des valeurs null/undefined tout en maintenant l'unicité
  },
  categorie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'La catégorie est requise']
  },
  image: {
    type: String,
    default: 'default-product.jpg'
  },
  actif: {
    type: Boolean,
    default: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuel pour obtenir le stock actuel du produit
productSchema.virtual('stockActuel', {
  ref: 'Stock',
  localField: '_id',
  foreignField: 'produit',
  justOne: true
});

// Middleware pour vérifier si le produit existe avant de le supprimer
productSchema.pre('remove', async function(next) {
  // Vérifier si le produit a des mouvements de stock associés
  const Stock = mongoose.model('Stock');
  const StockMovement = mongoose.model('StockMovement');
  
  const stockExists = await Stock.findOne({ produit: this._id });
  const movementsExist = await StockMovement.findOne({ produit: this._id });
  
  if (stockExists || movementsExist) {
    // Si le produit est utilisé, le marquer comme inactif au lieu de le supprimer
    this.actif = false;
    await this.save();
    return next(new Error('Ce produit ne peut pas être supprimé car il est utilisé dans le stock ou les mouvements. Il a été marqué comme inactif.'));
  }
  
  next();
});

module.exports = mongoose.model('Product', productSchema);