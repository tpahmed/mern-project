# Application de Gestion de Stock MEAN Stack

Ce projet est une application web de gestion de stock utilisant la stack MEAN (MongoDB, Express.js, Angular, Node.js). L'application permet de gérer les produits, les niveaux de stock, les mouvements d'entrée et de sortie, ainsi que de générer des rapports sur l'état des stocks.

## Structure du Projet

```
/
├── backend/                 # Serveur Express.js
│   ├── config/              # Configuration (MongoDB, JWT, etc.)
│   ├── controllers/         # Contrôleurs pour les routes API
│   ├── middleware/          # Middleware (auth, validation, etc.)
│   ├── models/              # Modèles MongoDB
│   ├── routes/              # Routes API
│   ├── utils/               # Utilitaires
│   ├── server.js            # Point d'entrée du serveur
│   └── package.json         # Dépendances backend
│
├── frontend/                # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Composants Angular
│   │   │   ├── models/      # Interfaces TypeScript
│   │   │   ├── services/    # Services Angular
│   │   │   ├── guards/      # Guards pour la protection des routes
│   │   │   └── ...
│   │   ├── assets/          # Ressources statiques
│   │   └── ...
│   ├── angular.json         # Configuration Angular
│   └── package.json         # Dépendances frontend
│
├── DiagrammeClasses.md      # Diagramme de classes UML
└── README.md                # Documentation du projet
```

## Fonctionnalités

- Authentification et autorisation (JWT)
- Gestion des produits (CRUD)
- Gestion des catégories
- Suivi des niveaux de stock
- Enregistrement des mouvements de stock (entrées/sorties)
- Génération de rapports
- Interface utilisateur responsive

## Technologies Utilisées

- **MongoDB** : Base de données NoSQL pour stocker les données
- **Express.js** : Framework backend pour créer les API REST
- **Angular** : Framework frontend pour l'interface utilisateur
- **Node.js** : Environnement d'exécution JavaScript côté serveur
- **JWT** : JSON Web Tokens pour l'authentification
- **Bootstrap** : Framework CSS pour le design responsive

## Installation et Démarrage

### Prérequis

- Node.js (v14+)
- MongoDB (v4+)
- Angular CLI

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
ng serve
```

L'application sera accessible à l'adresse http://localhost:4200

## API REST

Le backend expose les API REST suivantes :

- `/api/auth` : Authentification et gestion des utilisateurs
- `/api/products` : Gestion des produits
- `/api/categories` : Gestion des catégories
- `/api/stock` : Gestion des niveaux de stock
- `/api/movements` : Gestion des mouvements de stock
- `/api/reports` : Génération de rapports

## Sécurité

L'accès aux API est sécurisé par JWT (JSON Web Tokens). Chaque requête aux endpoints protégés doit inclure un token valide dans l'en-tête d'autorisation.