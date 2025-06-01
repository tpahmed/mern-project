const mongoose = require('mongoose');

/**
 * Modèle Rapport
 * Permet de générer des rapports sur l'état des stocks
 */
const reportSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre du rapport est requis'],
    trim: true
  },
  dateGeneration: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    required: [true, 'Le type de rapport est requis'],
    enum: ['inventaire', 'mouvements', 'alertes', 'valorisation', 'personnalise'],
    lowercase: true
  },
  contenu: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le créateur du rapport est requis']
  },
  parametres: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  format: {
    type: String,
    enum: ['json', 'pdf', 'csv', 'excel'],
    default: 'json'
  },
  statut: {
    type: String,
    enum: ['en_cours', 'termine', 'erreur'],
    default: 'en_cours'
  },
  messageErreur: {
    type: String
  }
}, {
  timestamps: true
});

// Méthode statique pour générer un rapport d'inventaire
reportSchema.statics.genererRapportInventaire = async function(parametres, createur) {
  const Stock = mongoose.model('Stock');
  const Product = mongoose.model('Product');
  
  try {
    // Récupérer tous les stocks avec les informations des produits
    const stocks = await Stock.find()
      .populate('produit', 'nom prix categorie')
      .populate({
        path: 'produit',
        populate: {
          path: 'categorie',
          select: 'nom'
        }
      });
    
    // Calculer la valeur totale du stock
    let valeurTotale = 0;
    const produitsEnStock = [];
    
    for (const stock of stocks) {
      if (stock.produit) {
        const valeurProduit = stock.quantite * stock.produit.prix;
        valeurTotale += valeurProduit;
        
        produitsEnStock.push({
          produit: stock.produit.nom,
          categorie: stock.produit.categorie ? stock.produit.categorie.nom : 'Non catégorisé',
          quantite: stock.quantite,
          prixUnitaire: stock.produit.prix,
          valeurTotale: valeurProduit,
          emplacement: stock.emplacement || 'Non spécifié',
          seuilAlerte: stock.seuilAlerte,
          statut: stock.quantite <= stock.seuilAlerte ? 'Alerte' : 'Normal'
        });
      }
    }
    
    // Créer le rapport
    const rapport = new this({
      titre: `Rapport d'inventaire - ${new Date().toLocaleDateString()}`,
      type: 'inventaire',
      contenu: {
        produitsEnStock,
        statistiques: {
          nombreProduits: produitsEnStock.length,
          valeurTotale,
          produitsEnAlerte: produitsEnStock.filter(p => p.statut === 'Alerte').length
        }
      },
      createur,
      parametres,
      statut: 'termine'
    });
    
    await rapport.save();
    return rapport;
  } catch (error) {
    // Créer un rapport d'erreur
    const rapportErreur = new this({
      titre: `Erreur - Rapport d'inventaire - ${new Date().toLocaleDateString()}`,
      type: 'inventaire',
      contenu: {},
      createur,
      parametres,
      statut: 'erreur',
      messageErreur: error.message
    });
    
    await rapportErreur.save();
    throw error;
  }
};

// Méthode statique pour générer un rapport de mouvements
reportSchema.statics.genererRapportMouvements = async function(parametres, createur) {
  const StockMovement = mongoose.model('StockMovement');
  
  try {
    const { dateDebut, dateFin, typeMouvement, produit } = parametres;
    
    // Construire le filtre de recherche
    const filtre = {};
    
    if (dateDebut || dateFin) {
      filtre.date = {};
      if (dateDebut) filtre.date.$gte = new Date(dateDebut);
      if (dateFin) filtre.date.$lte = new Date(dateFin);
    }
    
    if (typeMouvement) filtre.type = typeMouvement;
    if (produit) filtre.produit = produit;
    
    // Récupérer les mouvements
    const mouvements = await StockMovement.find(filtre)
      .populate('produit', 'nom prix')
      .populate('utilisateur', 'nom')
      .sort({ date: -1 });
    
    // Préparer les données du rapport
    const mouvementsFormats = mouvements.map(m => ({
      date: m.date,
      produit: m.produit ? m.produit.nom : 'Produit inconnu',
      type: m.type,
      quantite: m.quantite,
      stockAvant: m.stockAvant,
      stockApres: m.stockApres,
      utilisateur: m.utilisateur ? m.utilisateur.nom : 'Utilisateur inconnu',
      reference: m.reference || 'Aucune référence',
      commentaire: m.commentaire
    }));
    
    // Calculer les statistiques
    const entrees = mouvements.filter(m => m.type === 'entree');
    const sorties = mouvements.filter(m => m.type === 'sortie');
    const ajustements = mouvements.filter(m => m.type === 'ajustement');
    
    const totalEntrees = entrees.reduce((sum, m) => sum + m.quantite, 0);
    const totalSorties = sorties.reduce((sum, m) => sum + m.quantite, 0);
    
    // Créer le rapport
    const rapport = new this({
      titre: `Rapport de mouvements - ${new Date().toLocaleDateString()}`,
      type: 'mouvements',
      contenu: {
        mouvements: mouvementsFormats,
        statistiques: {
          nombreMouvements: mouvements.length,
          nombreEntrees: entrees.length,
          nombreSorties: sorties.length,
          nombreAjustements: ajustements.length,
          totalEntrees,
          totalSorties,
          balance: totalEntrees - totalSorties
        }
      },
      createur,
      parametres,
      statut: 'termine'
    });
    
    await rapport.save();
    return rapport;
  } catch (error) {
    // Créer un rapport d'erreur
    const rapportErreur = new this({
      titre: `Erreur - Rapport de mouvements - ${new Date().toLocaleDateString()}`,
      type: 'mouvements',
      contenu: {},
      createur,
      parametres,
      statut: 'erreur',
      messageErreur: error.message
    });
    
    await rapportErreur.save();
    throw error;
  }
};

// Méthode pour exporter le rapport
reportSchema.methods.exporter = async function(format) {
  // Cette méthode serait implémentée avec des bibliothèques comme PDFKit, json2csv, etc.
  // Pour l'instant, nous retournons simplement le contenu au format JSON
  this.format = format || this.format;
  await this.save();
  
  return {
    format: this.format,
    contenu: this.contenu
  };
};

module.exports = mongoose.model('Report', reportSchema);