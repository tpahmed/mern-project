# Diagramme de Classes - Système de Gestion de Stock

## Description du Système

Ce diagramme de classes modélise un système de gestion de stock pour une application web MEAN Stack (MongoDB, Express.js, Angular, Node.js). Le système permet de gérer les produits, les niveaux de stock, les mouvements d'entrée et de sortie, ainsi que de générer des rapports sur l'état des stocks.

## Diagramme de Classes (Format Textuel)

```
+-------------------+       +-------------------+       +-------------------+
|      Utilisateur  |       |      Produit      |       |    Catégorie      |
+-------------------+       +-------------------+       +-------------------+
| -id: ObjectId     |       | -id: ObjectId     |       | -id: ObjectId     |
| -nom: String      |       | -nom: String      |       | -nom: String      |
| -email: String    |       | -description: String      | -description: String      |
| -motDePasse: String       | -prix: Number     |       +-------------------+
| -role: String     |       | -codeBarre: String        |
+-------------------+       | -categorie: Ref(Catégorie) |
| +s'authentifier() |       | -image: String    |
| +gérerProduits()  |       +-------------------+
| +gérerStock()     |       | +créer()          |
| +générerRapports()|       | +lire()           |
+-------------------+       | +mettre à jour()  |
                            | +supprimer()      |
                            +-------------------+
                                     |
                                     |
                                     v
+-------------------+       +-------------------+       +-------------------+
|  Mouvement Stock  |       |       Stock       |       |      Rapport      |
+-------------------+       +-------------------+       +-------------------+
| -id: ObjectId     |       | -id: ObjectId     |       | -id: ObjectId     |
| -produit: Ref(Produit)    | -produit: Ref(Produit)    | -titre: String    |
| -quantité: Number |       | -quantité: Number |       | -dateGénération: Date    |
| -type: String     |       | -emplacement: String      | -type: String     |
| -date: Date       |       | -seuilAlerte: Number      | -contenu: Object  |
| -utilisateur: Ref(Utilisateur)| -dernièreMiseÀJour: Date   | -créateur: Ref(Utilisateur)|
+-------------------+       +-------------------+       +-------------------+
| +enregistrer()    |       | +vérifierNiveau() |       | +générer()        |
| +annuler()        |       | +mettreÀJour()    |       | +exporter()       |
+-------------------+       | +alerterSiSeuil() |       | +envoyer()        |
                            +-------------------+       +-------------------+
```

## Description des Classes

### Utilisateur
- Représente les utilisateurs du système (administrateurs, gestionnaires, employés)
- Attributs :
  - id : Identifiant unique MongoDB
  - nom : Nom complet de l'utilisateur
  - email : Adresse email (utilisée pour l'authentification)
  - motDePasse : Mot de passe hashé
  - role : Rôle de l'utilisateur (admin, manager, employee)
- Méthodes :
  - s'authentifier() : Authentification avec JWT
  - gérerProduits() : Gestion des produits selon les droits
  - gérerStock() : Gestion des niveaux de stock
  - générerRapports() : Création de rapports

### Produit
- Représente les articles disponibles en stock
- Attributs :
  - id : Identifiant unique MongoDB
  - nom : Nom du produit
  - description : Description détaillée
  - prix : Prix unitaire
  - codeBarre : Code-barres unique
  - categorie : Référence à une catégorie
  - image : URL de l'image du produit
- Méthodes :
  - créer() : Ajouter un nouveau produit
  - lire() : Consulter les détails d'un produit
  - mettre à jour() : Modifier les informations
  - supprimer() : Retirer un produit

### Catégorie
- Permet de classifier les produits
- Attributs :
  - id : Identifiant unique MongoDB
  - nom : Nom de la catégorie
  - description : Description de la catégorie

### Stock
- Représente le niveau de stock actuel pour chaque produit
- Attributs :
  - id : Identifiant unique MongoDB
  - produit : Référence au produit concerné
  - quantité : Quantité disponible
  - emplacement : Localisation physique
  - seuilAlerte : Niveau minimum avant alerte
  - dernièreMiseÀJour : Date de dernière modification
- Méthodes :
  - vérifierNiveau() : Contrôle du niveau de stock
  - mettreÀJour() : Actualiser le niveau de stock
  - alerterSiSeuil() : Générer une alerte si niveau critique

### Mouvement Stock
- Enregistre les entrées et sorties de stock
- Attributs :
  - id : Identifiant unique MongoDB
  - produit : Référence au produit concerné
  - quantité : Quantité entrée ou sortie
  - type : Type de mouvement (entrée, sortie, ajustement)
  - date : Date et heure du mouvement
  - utilisateur : Référence à l'utilisateur ayant effectué l'opération
- Méthodes :
  - enregistrer() : Sauvegarder le mouvement
  - annuler() : Annuler un mouvement erroné

### Rapport
- Permet de générer des rapports sur l'état des stocks
- Attributs :
  - id : Identifiant unique MongoDB
  - titre : Titre du rapport
  - dateGénération : Date de création
  - type : Type de rapport (inventaire, mouvements, alertes)
  - contenu : Données du rapport
  - créateur : Référence à l'utilisateur ayant généré le rapport
- Méthodes :
  - générer() : Créer un nouveau rapport
  - exporter() : Exporter au format PDF/CSV
  - envoyer() : Envoyer par email

## Relations

1. Un **Produit** appartient à une **Catégorie** (relation Many-to-One)
2. Un **Stock** est associé à un **Produit** (relation One-to-One)
3. Un **Mouvement Stock** concerne un **Produit** (relation Many-to-One)
4. Un **Mouvement Stock** est effectué par un **Utilisateur** (relation Many-to-One)
5. Un **Rapport** est créé par un **Utilisateur** (relation Many-to-One)

## Notes d'Implémentation pour MongoDB

Dans MongoDB, les relations seront implémentées par des références (ObjectId) entre documents de différentes collections. Pour certaines relations à forte cohésion, des documents imbriqués pourront être utilisés.

Collections à créer :
- users
- products
- categories
- stocks
- stock_movements
- reports