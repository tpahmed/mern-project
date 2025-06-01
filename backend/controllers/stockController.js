const Stock = require('../models/Stock');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

/**
 * @desc    Obtenir tous les stocks
 * @route   GET /api/stocks
 * @access  Private
 */
exports.getStocks = async (req, res) => {
  try {
    // Construire la requête avec les filtres
    let query = {};
    
    // Filtrer par niveau de stock
    if (req.query.niveau) {
      if (req.query.niveau === 'alerte') {
        // Trouver les stocks sous le seuil d'alerte
        const stocks = await Stock.find();
        const stocksEnAlerte = stocks.filter(stock => stock.estSousSeuilAlerte());
        const stockIds = stocksEnAlerte.map(stock => stock._id);
        query._id = { $in: stockIds };
      } else if (req.query.niveau === 'epuise') {
        query.quantite = 0;
      } else if (req.query.niveau === 'disponible') {
        query.quantite = { $gt: 0 };
      }
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Exécuter la requête
    const stocks = await Stock.find(query)
      .populate('produit', 'nom prix codeBarre image categorie')
      .populate({
        path: 'produit',
        populate: {
          path: 'categorie',
          select: 'nom'
        }
      })
      .skip(startIndex)
      .limit(limit)
      .sort({ 'produit.nom': 1 });
    
    // Compter le nombre total de stocks pour la pagination
    const total = await Stock.countDocuments(query);
    
    // Formater les données pour la réponse
    const formattedStocks = stocks.map(stock => ({
      id: stock._id,
      produit: stock.produit ? {
        id: stock.produit._id,
        nom: stock.produit.nom,
        prix: stock.produit.prix,
        codeBarre: stock.produit.codeBarre,
        image: stock.produit.image,
        categorie: stock.produit.categorie ? stock.produit.categorie.nom : null
      } : null,
      quantite: stock.quantite,
      emplacement: stock.emplacement,
      seuilAlerte: stock.seuilAlerte,
      derniereMiseAJour: stock.derniereMiseAJour,
      statut: stock.estSousSeuilAlerte() ? 'alerte' : (stock.quantite === 0 ? 'epuise' : 'disponible')
    }));
    
    res.status(200).json({
      success: true,
      count: stocks.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: formattedStocks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des stocks.',
      error: error.message
    });
  }
};

/**
 * @desc    Obtenir un stock par l'ID du produit
 * @route   GET /api/stocks/product/:productId
 * @access  Private
 */
exports.getStockByProduct = async (req, res) => {
  try {
    const stock = await Stock.findOne({ produit: req.params.productId })
      .populate('produit', 'nom prix codeBarre image categorie')
      .populate({
        path: 'produit',
        populate: {
          path: 'categorie',
          select: 'nom'
        }
      });
    
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock non trouvé pour ce produit.'
      });
    }
    
    // Formater les données pour la réponse
    const formattedStock = {
      id: stock._id,
      produit: stock.produit ? {
        id: stock.produit._id,
        nom: stock.produit.nom,
        prix: stock.produit.prix,
        codeBarre: stock.produit.codeBarre,
        image: stock.produit.image,
        categorie: stock.produit.categorie ? stock.produit.categorie.nom : null
      } : null,
      quantite: stock.quantite,
      emplacement: stock.emplacement,
      seuilAlerte: stock.seuilAlerte,
      derniereMiseAJour: stock.derniereMiseAJour,
      statut: stock.estSousSeuilAlerte() ? 'alerte' : (stock.quantite === 0 ? 'epuise' : 'disponible')
    };
    
    res.status(200).json({
      success: true,
      data: formattedStock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du stock.',
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour un stock
 * @route   PUT /api/stocks/:id
 * @access  Private (Admin, Manager)
 */
exports.updateStock = async (req, res) => {
  try {
    const { emplacement, seuilAlerte } = req.body;
    
    // Vérifier si le stock existe
    let stock = await Stock.findById(req.params.id);
    
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock non trouvé.'
      });
    }
    
    // Mettre à jour le stock
    stock = await Stock.findByIdAndUpdate(
      req.params.id,
      {
        emplacement,
        seuilAlerte
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('produit', 'nom prix codeBarre image categorie');
    
    // Formater les données pour la réponse
    const formattedStock = {
      id: stock._id,
      produit: stock.produit ? {
        id: stock.produit._id,
        nom: stock.produit.nom,
        prix: stock.produit.prix,
        codeBarre: stock.produit.codeBarre,
        image: stock.produit.image
      } : null,
      quantite: stock.quantite,
      emplacement: stock.emplacement,
      seuilAlerte: stock.seuilAlerte,
      derniereMiseAJour: stock.derniereMiseAJour,
      statut: stock.estSousSeuilAlerte() ? 'alerte' : (stock.quantite === 0 ? 'epuise' : 'disponible')
    };
    
    res.status(200).json({
      success: true,
      message: 'Stock mis à jour avec succès.',
      data: formattedStock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du stock.',
      error: error.message
    });
  }
};

/**
 * @desc    Enregistrer un mouvement de stock (entrée ou sortie)
 * @route   POST /api/stocks/movement
 * @access  Private
 */
exports.recordMovement = async (req, res) => {
  try {
    const { produit, quantite, type, reference, commentaire } = req.body;
    
    // Vérifier si le produit existe
    const productExists = await Product.findById(produit);
    
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé.'
      });
    }
    
    // Vérifier si la quantité est valide
    if (!quantite || quantite <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La quantité doit être supérieure à 0.'
      });
    }
    
    // Vérifier si le type est valide
    if (!['entree', 'sortie', 'ajustement'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type de mouvement invalide. Utilisez "entree", "sortie" ou "ajustement".'
      });
    }
    
    // Enregistrer le mouvement
    const movement = await StockMovement.enregistrer({
      produit,
      quantite,
      type,
      utilisateur: req.user.id,
      reference,
      commentaire
    });
    
    // Récupérer le stock mis à jour
    const stock = await Stock.findOne({ produit })
      .populate('produit', 'nom prix codeBarre image');
    
    res.status(201).json({
      success: true,
      message: `Mouvement de stock (${type}) enregistré avec succès.`,
      data: {
        movement: {
          id: movement._id,
          produit: movement.produit,
          quantite: movement.quantite,
          type: movement.type,
          date: movement.date,
          reference: movement.reference,
          commentaire: movement.commentaire,
          stockAvant: movement.stockAvant,
          stockApres: movement.stockApres
        },
        stock: {
          id: stock._id,
          produit: {
            id: stock.produit._id,
            nom: stock.produit.nom,
            prix: stock.produit.prix
          },
          quantite: stock.quantite,
          emplacement: stock.emplacement,
          seuilAlerte: stock.seuilAlerte,
          statut: stock.estSousSeuilAlerte() ? 'alerte' : (stock.quantite === 0 ? 'epuise' : 'disponible')
        }
      }
    });
  } catch (error) {
    res.status(error.message.includes('Stock insuffisant') ? 400 : 500).json({
      success: false,
      message: error.message.includes('Stock insuffisant') 
        ? error.message 
        : 'Erreur lors de l\'enregistrement du mouvement de stock.',
      error: error.message
    });
  }
};

/**
 * @desc    Obtenir les mouvements de stock d'un produit
 * @route   GET /api/stocks/movements/:productId
 * @access  Private
 */
exports.getProductMovements = async (req, res) => {
  try {
    // Construire la requête avec les filtres
    let query = { produit: req.params.productId };
    
    // Filtrer par type de mouvement
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filtrer par date
    if (req.query.dateDebut || req.query.dateFin) {
      query.date = {};
      if (req.query.dateDebut) {
        query.date.$gte = new Date(req.query.dateDebut);
      }
      if (req.query.dateFin) {
        query.date.$lte = new Date(req.query.dateFin);
      }
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Exécuter la requête
    const movements = await StockMovement.find(query)
      .populate('produit', 'nom prix codeBarre')
      .populate('utilisateur', 'nom')
      .skip(startIndex)
      .limit(limit)
      .sort({ date: -1 });
    
    // Compter le nombre total de mouvements pour la pagination
    const total = await StockMovement.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: movements.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: movements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des mouvements de stock.',
      error: error.message
    });
  }
};

/**
 * @desc    Annuler un mouvement de stock
 * @route   POST /api/stocks/movements/:id/cancel
 * @access  Private (Admin, Manager)
 */
exports.cancelMovement = async (req, res) => {
  try {
    // Vérifier si le mouvement existe
    const movement = await StockMovement.findById(req.params.id)
      .populate('produit', 'nom');
    
    if (!movement) {
      return res.status(404).json({
        success: false,
        message: 'Mouvement de stock non trouvé.'
      });
    }
    
    // Annuler le mouvement
    const reversedMovement = await movement.annuler();
    
    // Récupérer le stock mis à jour
    const stock = await Stock.findOne({ produit: movement.produit._id })
      .populate('produit', 'nom prix');
    
    res.status(200).json({
      success: true,
      message: 'Mouvement de stock annulé avec succès.',
      data: {
        originalMovement: {
          id: movement._id,
          produit: movement.produit.nom,
          quantite: movement.quantite,
          type: movement.type,
          date: movement.date
        },
        reversedMovement: {
          id: reversedMovement._id,
          produit: reversedMovement.produit,
          quantite: reversedMovement.quantite,
          type: reversedMovement.type,
          date: reversedMovement.date
        },
        currentStock: {
          produit: stock.produit.nom,
          quantite: stock.quantite
        }
      }
    });
  } catch (error) {
    res.status(error.message.includes('ne peut plus être annulé') ? 400 : 500).json({
      success: false,
      message: error.message.includes('ne peut plus être annulé') 
        ? error.message 
        : 'Erreur lors de l\'annulation du mouvement de stock.',
      error: error.message
    });
  }
};