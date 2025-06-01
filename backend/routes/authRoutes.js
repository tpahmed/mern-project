const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  getMe, 
  updateDetails, 
  updatePassword 
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

/**
 * Routes d'authentification
 * Base: /api/auth
 */

// Routes publiques
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

// Routes protégées
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

// Routes d'administration (réservées aux administrateurs)
router.get('/users', protect, authorize('admin'), (req, res) => {
  // Cette route serait implémentée dans un contrôleur d'utilisateurs
  res.status(200).json({
    success: true,
    message: 'Cette fonctionnalité sera implémentée ultérieurement.'
  });
});

module.exports = router;