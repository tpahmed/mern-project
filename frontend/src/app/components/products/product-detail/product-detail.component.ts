import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService, Product } from '../../../services/product.service';
import { StockService, Stock } from '../../../services/stock.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="product-detail-container">
      @if (loading) {
        <div class="loading">
          <p>Chargement du produit...</p>
        </div>
      } @else if (product) {
        <div class="header-actions">
          <h1>{{ product.nom }}</h1>
          <div class="actions">
            <button mat-raised-button color="primary" [routerLink]="['/products/edit', product._id]">
              <mat-icon>edit</mat-icon> Modifier
            </button>
            <button mat-raised-button color="accent" [routerLink]="['/stocks/movement/new', product._id]">
              <mat-icon>swap_horiz</mat-icon> Mouvement de stock
            </button>
            @if (isAdmin) {
              <button mat-raised-button color="warn" (click)="deleteProduct()">
                <mat-icon>delete</mat-icon> Supprimer
              </button>
            }
          </div>
        </div>

        <div class="product-content">
          <mat-card class="product-info">
            <mat-card-content>
              <div class="product-image-container">
                <img [src]="product.image" alt="{{ product.nom }}" class="product-image">
              </div>

              <div class="product-details">
                <h2>Informations</h2>
                <p><strong>Catégorie:</strong> {{ product.categorie?.nom }}</p>
                <p><strong>Prix:</strong> {{ product.prix | currency:'EUR' }}</p>
                <p><strong>Code barre:</strong> {{ product.codeBarre || 'Non défini' }}</p>
                <p><strong>Statut:</strong>
                  <span [ngClass]="{'active': product.actif, 'inactive': !product.actif}">
                    {{ product.actif ? 'Actif' : 'Inactif' }}
                  </span>
                </p>
                <p><strong>Date de création:</strong> {{ product.dateCreation | date:'dd/MM/yyyy' }}</p>

                @if (product.description) {
                  <h3>Description</h3>
                  <p>{{ product.description }}</p>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stock-info">
            <mat-card-header>
              <mat-card-title>Information de stock</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (stock) {
                <div class="stock-level" [ngClass]="{
                  'stock-normal': stock.quantite > stock.seuilAlerte,
                  'stock-low': stock.quantite <= stock.seuilAlerte && stock.quantite > 0,
                  'stock-out': stock.quantite === 0
                }">
                  <h2>{{ stock.quantite }}</h2>
                  <p>unités en stock</p>
                </div>

                <mat-divider></mat-divider>

                <div class="stock-details">
                  <p><strong>Emplacement:</strong> {{ stock.emplacement || 'Non défini' }}</p>
                  <p><strong>Seuil d'alerte:</strong> {{ stock.seuilAlerte }}</p>
                  <p><strong>Dernière mise à jour:</strong> {{ stock.derniereMiseAJour | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>

                <div class="stock-actions">
                  <button mat-stroked-button color="primary" [routerLink]="['/stocks/movement/new', product._id, 'entree']">
                    <mat-icon>add</mat-icon> Entrée
                  </button>
                  <button mat-stroked-button color="warn" [routerLink]="['/stocks/movement/new', product._id, 'sortie']">
                    <mat-icon>remove</mat-icon> Sortie
                  </button>
                </div>
              } @else {
                <p>Aucune information de stock disponible</p>
                <button mat-stroked-button color="primary" [routerLink]="['/stocks/new', product._id]">
                  <mat-icon>add</mat-icon> Créer un stock
                </button>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <div class="navigation-buttons">
          <button mat-button color="primary" routerLink="/products">
            <mat-icon>arrow_back</mat-icon> Retour à la liste
          </button>
        </div>
      } @else {
        <div class="not-found">
          <h2>Produit non trouvé</h2>
          <p>Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
          <button mat-raised-button color="primary" routerLink="/products">
            Retour à la liste des produits
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .product-detail-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .product-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    @media (max-width: 768px) {
      .product-content {
        grid-template-columns: 1fr;
      }
    }

    .product-image-container {
      text-align: center;
      margin-bottom: 20px;
    }

    .product-image {
      max-width: 100%;
      max-height: 300px;
      object-fit: contain;
      border-radius: 4px;
    }

    .product-details h2, .product-details h3 {
      margin-top: 0;
      color: #333;
    }

    .active {
      color: green;
      font-weight: bold;
    }

    .inactive {
      color: red;
      font-weight: bold;
    }

    .stock-level {
      text-align: center;
      padding: 20px 0;
    }

    .stock-level h2 {
      font-size: 48px;
      margin: 0;
    }

    .stock-normal {
      color: green;
    }

    .stock-low {
      color: orange;
    }

    .stock-out {
      color: red;
    }

    .stock-details {
      margin: 20px 0;
    }

    .stock-actions {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
    }

    .navigation-buttons {
      margin-top: 20px;
    }

    .loading, .not-found {
      text-align: center;
      padding: 50px;
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  stock: Stock | null = null;
  loading = true;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private stockService: StockService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('admin');
    this.loadProduct();
  }

  loadProduct(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/products']);
      return;
    }

    this.productService.getProduct(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.product = response.data;
          this.loadStock(id);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        this.snackBar.open(
          'Erreur lors du chargement du produit',
          'Fermer',
          { duration: 5000 }
        );
        this.loading = false;
      }
    });
  }

  loadStock(productId: string): void {
    this.stockService.getStockByProduct(productId).subscribe({
      next: (response) => {
        if (response.success) {
          this.stock = response.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  deleteProduct(): void {
    if (!this.product) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${this.product.nom}" ?`)) {
      this.productService.deleteProduct(this.product._id).subscribe({
        next: (response) => {
          this.snackBar.open('Produit supprimé avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.snackBar.open(
            'Erreur lors de la suppression du produit',
            'Fermer',
            { duration: 5000 }
          );
        }
      });
    }
  }
}
