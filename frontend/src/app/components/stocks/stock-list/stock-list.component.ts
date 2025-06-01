import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { StockService, Stock } from '../../../services/stock.service';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    FormsModule
  ],
  template: `
    <div class="stock-list-container">
      <div class="header-actions">
        <h1>Gestion des stocks</h1>
        <button mat-raised-button color="primary" routerLink="/stocks/movement/new">
          <mat-icon>swap_horiz</mat-icon> Nouveau mouvement
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Niveau de stock</mat-label>
              <mat-select [(ngModel)]="stockLevel" (selectionChange)="applyFilter()">
                <mat-option value="">Tous</mat-option>
                <mat-option value="alerte">En alerte</mat-option>
                <mat-option value="epuise">Épuisé</mat-option>
                <mat-option value="disponible">Disponible</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="table-container">
            <table mat-table [dataSource]="stocks" matSort (matSortChange)="sortData($event)">
              <ng-container matColumnDef="produit">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Produit </th>
                <td mat-cell *matCellDef="let stock">
                  <div class="product-info">
                    <img [src]="stock.produit?.image" alt="{{ stock.produit?.nom }}" class="product-image">
                    <span>{{ stock.produit?.nom }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="categorie">
                <th mat-header-cell *matHeaderCellDef> Catégorie </th>
                <td mat-cell *matCellDef="let stock"> {{ stock.produit?.categorie?.nom }} </td>
              </ng-container>

              <ng-container matColumnDef="quantite">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Quantité </th>
                <td mat-cell *matCellDef="let stock">
                  <span [ngClass]="{
                    'stock-low': stock.quantite <= stock.seuilAlerte && stock.quantite > 0,
                    'stock-out': stock.quantite === 0
                  }">
                    {{ stock.quantite }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="seuilAlerte">
                <th mat-header-cell *matHeaderCellDef> Seuil d'alerte </th>
                <td mat-cell *matCellDef="let stock"> {{ stock.seuilAlerte }} </td>
              </ng-container>

              <ng-container matColumnDef="emplacement">
                <th mat-header-cell *matHeaderCellDef> Emplacement </th>
                <td mat-cell *matCellDef="let stock"> {{ stock.emplacement || 'Non défini' }} </td>
              </ng-container>

              <ng-container matColumnDef="derniereMiseAJour">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Dernière mise à jour </th>
                <td mat-cell *matCellDef="let stock"> {{ stock.derniereMiseAJour | date:'dd/MM/yyyy HH:mm' }} </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef> Actions </th>
                <td mat-cell *matCellDef="let stock">
                  <button mat-icon-button color="primary" [routerLink]="['/products', stock.produit?._id]">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" [routerLink]="['/stocks/movement/new', stock.produit?._id]">
                    <mat-icon>swap_horiz</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            @if (loading) {
              <div class="loading-indicator">
                <p>Chargement des stocks...</p>
              </div>
            }

            @if (!loading && stocks.length === 0) {
              <div class="no-data">
                <p>Aucun stock trouvé</p>
              </div>
            }
          </div>

          <mat-paginator
            [length]="totalItems"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 50]"
            (page)="onPageChange($event)">
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .stock-list-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .filters {
      margin-bottom: 20px;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .product-info {
      display: flex;
      align-items: center;
    }

    .product-image {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
      margin-right: 10px;
    }

    .stock-low {
      color: orange;
      font-weight: bold;
    }

    .stock-out {
      color: red;
      font-weight: bold;
    }

    .loading-indicator, .no-data {
      text-align: center;
      padding: 20px;
      font-style: italic;
      color: #666;
    }
  `]
})
export class StockListComponent implements OnInit {
  stocks: any[] = [];
  displayedColumns: string[] = ['produit', 'categorie', 'quantite', 'seuilAlerte', 'emplacement', 'derniereMiseAJour', 'actions'];
  loading = true;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;

  // Filtres
  stockLevel = '';
  sortField = 'produit.nom';
  sortDirection = 'asc';

  constructor(
    private stockService: StockService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Récupérer les paramètres de l'URL si nécessaire
    this.loadStocks();
  }

  loadStocks(): void {
    this.loading = true;

    const params: any = {
      page: this.currentPage + 1,
      limit: this.pageSize,
      sort: `${this.sortDirection === 'desc' ? '-' : ''}${this.sortField}`
    };

    if (this.stockLevel) {
      params.niveau = this.stockLevel;
    }

    this.stockService.getStocks(params).subscribe({
      next: (response) => {
        this.stocks = response.data;
        this.totalItems = response.count;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(
          'Erreur lors du chargement des stocks',
          'Fermer',
          { duration: 5000 }
        );
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadStocks();
  }

  sortData(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction || 'asc';
    this.loadStocks();
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.loadStocks();
  }
}
