const User = require('../models/User');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { nom, email, motDePasse, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé.'
      });
    }

    // Créer un nouvel utilisateur
    const user = await User.create({
      nom,
      email,
      motDePasse,
      role: role || 'employee' // Par défaut, le rôle est 'employee'
    });

    // Générer un token JWT
    const token = user.generateAuthToken();

    // Options pour le cookie
    const cookieOptions = {
      expires: new Date(Date.now() + jwtConfig.cookie.maxAge),
      httpOnly: jwtConfig.cookie.httpOnly,
      secure: jwtConfig.cookie.secure,
      sameSite: jwtConfig.cookie.sameSite
    };

    // Envoyer le token dans un cookie
    res.cookie('token', token, cookieOptions);

    // Réponse avec le token et les informations de l'utilisateur
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription.',
      error: error.message
    });
  }
};

/**
 * @desc    Connexion d'un utilisateur
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Vérifier si l'email et le mot de passe sont fournis
    if (!email || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe.'
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email }).select('+motDePasse');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.'
      });
    }

    // Vérifier si le mot de passe est correct
    const isMatch = await user.comparePassword(motDePasse);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.'
      });
    }

    // Mettre à jour la date de dernière connexion
    user.derniereConnexion = Date.now();
    await user.save({ validateBeforeSave: false });

    // Générer un token JWT
    const token = user.generateAuthToken();

    // Options pour le cookie
    const cookieOptions = {
      expires: new Date(Date.now() + jwtConfig.cookie.maxAge),
      httpOnly: jwtConfig.cookie.httpOnly,
      secure: jwtConfig.cookie.secure,
      sameSite: jwtConfig.cookie.sameSite
    };

    // Envoyer le token dans un cookie
    res.cookie('token', token, cookieOptions);

    // Réponse avec le token et les informations de l'utilisateur
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion.',
      error: error.message
    });
  }
};

/**
 * @desc    Déconnexion d'un utilisateur
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logout = (req, res) => {
  try {
    // Supprimer le cookie contenant le token
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // Expire dans 10 secondes
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion.',
      error: error.message
    });
  }
};

/**
 * @desc    Obtenir les informations de l'utilisateur connecté
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        dateCreation: user.dateCreation,
        derniereConnexion: user.derniereConnexion
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations utilisateur.',
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour les informations de l'utilisateur
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
exports.updateDetails = async (req, res) => {
  try {
    const { nom, email } = req.body;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé.'
        });
      }
    }

    // Mettre à jour les informations
    const fieldsToUpdate = {};
    if (nom) fieldsToUpdate.nom = nom;
    if (email) fieldsToUpdate.email = email;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des informations.',
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour le mot de passe
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Vérifier si les mots de passe sont fournis
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir le mot de passe actuel et le nouveau mot de passe.'
      });
    }

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(req.user.id).select('+motDePasse');

    // Vérifier si le mot de passe actuel est correct
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect.'
      });
    }

    // Mettre à jour le mot de passe
    user.motDePasse = newPassword;
    await user.save();

    // Générer un nouveau token
    const token = user.generateAuthToken();

    // Options pour le cookie
    const cookieOptions = {
      expires: new Date(Date.now() + jwtConfig.cookie.maxAge),
      httpOnly: jwtConfig.cookie.httpOnly,
      secure: jwtConfig.cookie.secure,
      sameSite: jwtConfig.cookie.sameSite
    };

    // Envoyer le token dans un cookie
    res.cookie('token', token, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour avec succès.',
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du mot de passe.',
      error: error.message
    });
  }
};