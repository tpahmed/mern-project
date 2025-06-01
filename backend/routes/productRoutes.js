const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

/**
 * Routes pour les produits
 * Base: /api/products
 */

// Routes protégées accessibles à tous les utilisateurs authentifiés
router.get('/', protect, getProducts);
router.get('/:id', protect, getProduct);

// Routes réservées aux administrateurs et managers
router.post('/', protect, authorize('admin', 'manager'), createProduct);
router.put('/:id', protect, authorize('admin', 'manager'), updateProduct);

// Routes réservées aux administrateurs
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;