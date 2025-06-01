const express = require('express');
const router = express.Router();
const { 
  getStocks, 
  getStockByProduct, 
  updateStock, 
  recordMovement, 
  getProductMovements, 
  cancelMovement 
} = require('../controllers/stockController');
const { protect, authorize } = require('../middleware/auth');

/**
 * Routes pour les stocks
 * Base: /api/stocks
 */

// Routes protégées accessibles à tous les utilisateurs authentifiés
router.get('/', protect, getStocks);
router.get('/product/:productId', protect, getStockByProduct);
router.get('/movements/:productId', protect, getProductMovements);

// Routes pour les mouvements de stock (entrées/sorties)
router.post('/movement', protect, recordMovement);

// Routes réservées aux administrateurs et managers
router.put('/:id', protect, authorize('admin', 'manager'), updateStock);
router.post('/movements/:id/cancel', protect, authorize('admin', 'manager'), cancelMovement);

module.exports = router;