/**
 * Configuration JWT
 * Ce fichier contient les paramètres de configuration pour JSON Web Tokens
 */

module.exports = {
  // Secret utilisé pour signer les tokens JWT
  // En production, cette valeur devrait être stockée dans une variable d'environnement
  secret: process.env.JWT_SECRET || 'stock_management',
  
  // Durée de validité du token (en secondes)
  // Par défaut: 24 heures
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Options pour les cookies contenant le token JWT
  cookie: {
    // Durée de vie du cookie (en millisecondes)
    // Par défaut: 24 heures
    maxAge: process.env.JWT_COOKIE_EXPIRES_IN || 24 * 60 * 60 * 1000,
    
    // Empêche l'accès au cookie via JavaScript
    httpOnly: true,
    
    // En production, les cookies ne sont envoyés que sur HTTPS
    secure: process.env.NODE_ENV === 'production',
    
    // Empêche l'envoi du cookie dans les requêtes cross-site
    sameSite: 'strict'
  },
  
  // Options pour la génération du token
  options: {
    algorithm: 'HS256', // Algorithme de signature
    issuer: 'stock-management-api', // Émetteur du token
    audience: 'stock-management-client' // Destinataire du token
  }
};