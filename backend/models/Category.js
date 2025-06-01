const mongoose = require('mongoose');

/**
 * Modèle Catégorie
 * Permet de classifier les produits
 */
const categorySchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de la catégorie est requis'],
    trim: true,
    unique: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  description: {
    type: String,
    trim: true
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

// Virtuel pour obtenir les produits associés à cette catégorie
categorySchema.virtual('produits', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'categorie'
});

// Middleware pour vérifier si la catégorie est utilisée avant de la supprimer
categorySchema.pre('remove', async function(next) {
  const Product = mongoose.model('Product');
  
  const productsExist = await Product.findOne({ categorie: this._id });
  
  if (productsExist) {
    return next(new Error('Cette catégorie ne peut pas être supprimée car elle est associée à des produits.'));
  }
  
  next();
});

module.exports = mongoose.model('Category', categorySchema);