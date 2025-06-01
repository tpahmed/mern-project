import { Component, OnInit } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { StockService } from '../../services/stock.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
],
  template: `
    <div class="dashboard-container">
      <h1>Tableau de bord</h1>

      <div class="dashboard-stats">
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon>inventory_2</mat-icon>
            <mat-card-title>Produits</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <h2>{{ productCount }}</h2>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/products">Voir tous</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon>warning</mat-icon>
            <mat-card-title>Alertes Stock</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <h2>{{ lowStockCount }}</h2>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="accent" routerLink="/stocks?niveau=alerte">Voir détails</button>
          </mat-card-actions>
        </mat-card>

        @if (isAdmin) {
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-icon>people</mat-icon>
              <mat-card-title>Utilisateurs</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <h2>{{ userCount }}</h2>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" routerLink="/users">Gérer</button>
            </mat-card-actions>
          </mat-card>
        }
      </div>

      <div class="quick-actions">
        <h2>Actions rapides</h2>
        <div class="action-buttons">
          <button mat-raised-button color="primary" routerLink="/products/new">
            <mat-icon>add</mat-icon> Nouveau produit
          </button>
          <button mat-raised-button color="accent" routerLink="/stocks/movement/new">
            <mat-icon>swap_horiz</mat-icon> Mouvement de stock
          </button>
          @if (isAdmin) {
            <button mat-raised-button color="warn" routerLink="/reports">
              <mat-icon>assessment</mat-icon> Rapports
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      height: 100%;
    }

    .stat-card mat-card-header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }

    .stat-card mat-icon {
      margin-right: 10px;
      font-size: 24px;
      height: 24px;
      width: 24px;
    }

    .stat-card h2 {
      font-size: 36px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }

    .quick-actions {
      margin-top: 30px;
    }

    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
    }

    .action-buttons mat-icon {
      margin-right: 8px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  productCount = 0;
  lowStockCount = 0;
  userCount = 0;
  isAdmin = false;

  constructor(
    private productService: ProductService,
    private stockService: StockService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.isAdmin = this.authService.hasRole('admin');
  }

  loadDashboardData(): void {
    this.productService.getProducts().subscribe(response => {
      if (response.success) {
        this.productCount = response.count;
      }
    });

    this.stockService.getStocks({ niveau: 'alerte' }).subscribe(response => {
      if (response.success) {
        this.lowStockCount = response.count;
      }
    });

    // Uniquement pour les administrateurs
    if (this.isAdmin) {
      this.userCount = 0; // À implémenter si nécessaire
    }
  }
}
