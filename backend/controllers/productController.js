const Product = require('../models/Product');
const Category = require('../models/Category');
const Stock = require('../models/Stock');

/**
 * @desc    Obtenir tous les produits
 * @route   GET /api/products
 * @access  Private
 */
exports.getProducts = async (req, res) => {
  try {
    // Construire la requête avec les filtres
    let query = {};
    
    // Filtrer par catégorie
    if (req.query.categorie) {
      query.categorie = req.query.categorie;
    }
    
    // Filtrer par statut (actif/inactif)
    if (req.query.actif) {
      query.actif = req.query.actif === 'true';
    }
    
    // Recherche par nom ou description
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { nom: searchRegex },
        { description: searchRegex },
        { codeBarre: req.query.search }
      ];
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Exécuter la requête
    const products = await Product.find(query)
      .populate('categorie', 'nom')
      .skip(startIndex)
      .limit(limit)
      .sort({ nom: 1 });
    
    // Compter le nombre total de produits pour la pagination
    const total = await Product.countDocuments(query);
    
    // Récupérer les stocks pour chaque produit
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const stock = await Stock.findOne({ produit: product._id });
        const productObj = product.toObject();
        
        return {
          ...productObj,
          stock: stock ? {
            quantite: stock.quantite,
            emplacement: stock.emplacement,
            seuilAlerte: stock.seuilAlerte
          } : null
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: productsWithStock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits.',
      error: error.message
    });
  }
};

/**
 * @desc    Obtenir un produit par son ID
 * @route   GET /api/products/:id
 * @access  Private
 */
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categorie', 'nom');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé.'
      });
    }
    
    // Récupérer le stock du produit
    const stock = await Stock.findOne({ produit: product._id });
    
    const productWithStock = {
      ...product.toObject(),
      stock: stock ? {
        quantite: stock.quantite,
        emplacement: stock.emplacement,
        seuilAlerte: stock.seuilAlerte
      } : null
    };
    
    res.status(200).json({
      success: true,
      data: productWithStock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit.',
      error: error.message
    });
  }
};

/**
 * @desc    Créer un nouveau produit
 * @route   POST /api/products
 * @access  Private (Admin, Manager)
 */
exports.createProduct = async (req, res) => {
  try {
    const { nom, description, prix, codeBarre, categorie, image } = req.body;
    
    // Vérifier si la catégorie existe
    if (categorie) {
      const categoryExists = await Category.findById(categorie);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Catégorie non trouvée.'
        });
      }
    }
    
    // Vérifier si le code-barres est unique
    if (codeBarre) {
      const barcodeExists = await Product.findOne({ codeBarre });
      if (barcodeExists) {
        return res.status(400).json({
          success: false,
          message: 'Ce code-barres est déjà utilisé.'
        });
      }
    }
    
    // Créer le produit
    const product = await Product.create({
      nom,
      description,
      prix,
      codeBarre,
      categorie,
      image
    });
    
    // Créer un stock initial pour le produit
    const stock = await Stock.create({
      produit: product._id,
      quantite: 0,
      emplacement: req.body.emplacement || 'Stock principal',
      seuilAlerte: req.body.seuilAlerte || 10
    });
    
    const productWithStock = {
      ...product.toObject(),
      stock: {
        quantite: stock.quantite,
        emplacement: stock.emplacement,
        seuilAlerte: stock.seuilAlerte
      }
    };
    
    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès.',
      data: productWithStock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du produit.',
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour un produit
 * @route   PUT /api/products/:id
 * @access  Private (Admin, Manager)
 */
exports.updateProduct = async (req, res) => {
  try {
    const { nom, description, prix, codeBarre, categorie, image, actif } = req.body;
    
    // Vérifier si le produit existe
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé.'
      });
    }
    
    // Vérifier si la catégorie existe
    if (categorie) {
      const categoryExists = await Category.findById(categorie);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Catégorie non trouvée.'
        });
      }
    }
    
    // Vérifier si le code-barres est unique
    if (codeBarre && codeBarre !== product.codeBarre) {
      const barcodeExists = await Product.findOne({ codeBarre });
      if (barcodeExists) {
        return res.status(400).json({
          success: false,
          message: 'Ce code-barres est déjà utilisé.'
        });
      }
    }
    
    // Mettre à jour le produit
    product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        nom,
        description,
        prix,
        codeBarre,
        categorie,
        image,
        actif
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('categorie', 'nom');
    
    // Récupérer le stock du produit
    const stock = await Stock.findOne({ produit: product._id });
    
    // Mettre à jour l'emplacement et le seuil d'alerte si fournis
    if (stock && (req.body.emplacement || req.body.seuilAlerte)) {
      if (req.body.emplacement) stock.emplacement = req.body.emplacement;
      if (req.body.seuilAlerte) stock.seuilAlerte = req.body.seuilAlerte;
      await stock.save();
    }
    
    const productWithStock = {
      ...product.toObject(),
      stock: stock ? {
        quantite: stock.quantite,
        emplacement: stock.emplacement,
        seuilAlerte: stock.seuilAlerte
      } : null
    };
    
    res.status(200).json({
      success: true,
      message: 'Produit mis à jour avec succès.',
      data: productWithStock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du produit.',
      error: error.message
    });
  }
};

/**
 * @desc    Supprimer un produit
 * @route   DELETE /api/products/:id
 * @access  Private (Admin)
 */
exports.deleteProduct = async (req, res) => {
  try {
    // Vérifier si le produit existe
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé.'
      });
    }
    
    // Vérifier si le produit a des stocks ou des mouvements associés
    const stock = await Stock.findOne({ produit: product._id });
    
    if (stock && stock.quantite > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un produit avec du stock. Veuillez d\'abord vider le stock.'
      });
    }
    
    // Supprimer le stock associé
    if (stock) {
      await Stock.findByIdAndDelete(stock._id);
    }
    
    // Supprimer le produit
    await product.remove();
    
    res.status(200).json({
      success: true,
      message: 'Produit supprimé avec succès.'
    });
  } catch (error) {
    // Si l'erreur vient du middleware pre('remove')
    if (error.message.includes('ne peut pas être supprimé')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du produit.',
      error: error.message
    });
  }
};