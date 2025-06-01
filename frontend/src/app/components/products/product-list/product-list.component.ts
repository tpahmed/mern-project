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
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-product-list',
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
    MatCardModule,
    FormsModule
  ],
  template: `
    <div class="product-list-container">
      <div class="header-actions">
        <h1>Liste des produits</h1>
        <button mat-raised-button color="primary" routerLink="/products/new">
          <mat-icon>add</mat-icon> Nouveau produit
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Rechercher</mat-label>
              <input matInput [(ngModel)]="searchTerm" (keyup.enter)="applyFilter()">
              <button mat-icon-button matSuffix (click)="applyFilter()">
                <mat-icon>search</mat-icon>
              </button>
            </mat-form-field>
          </div>

          <div class="table-container">
            <table mat-table [dataSource]="products" matSort (matSortChange)="sortData($event)">
              <ng-container matColumnDef="image">
                <th mat-header-cell *matHeaderCellDef> Image </th>
                <td mat-cell *matCellDef="let product">
                  <img [src]="product.image" alt="{{ product.nom }}" class="product-image">
                </td>
              </ng-container>

              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Nom </th>
                <td mat-cell *matCellDef="let product"> {{ product.nom }} </td>
              </ng-container>

              <ng-container matColumnDef="prix">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Prix </th>
                <td mat-cell *matCellDef="let product"> {{ product.prix | currency:'EUR' }} </td>
              </ng-container>

              <ng-container matColumnDef="categorie">
                <th mat-header-cell *matHeaderCellDef> Catégorie </th>
                <td mat-cell *matCellDef="let product"> {{ product.categorie?.nom }} </td>
              </ng-container>

              <ng-container matColumnDef="stock">
                <th mat-header-cell *matHeaderCellDef> Stock </th>
                <td mat-cell *matCellDef="let product">
                  <span [ngClass]="{
                    'stock-low': product.stock?.quantite <= product.stock?.seuilAlerte,
                    'stock-out': product.stock?.quantite === 0
                  }">
                    {{ product.stock?.quantite || 0 }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef> Actions </th>
                <td mat-cell *matCellDef="let product">
                  <button mat-icon-button color="primary" [routerLink]="['/products', product._id]">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" [routerLink]="['/products/edit', product._id]">
                    <mat-icon>edit</mat-icon>
                  </button>
                  @if (isAdmin) {
                    <button mat-icon-button color="warn" (click)="deleteProduct(product._id)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  }
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            @if (loading) {
              <div class="loading-indicator">
                <p>Chargement des produits...</p>
              </div>
            }

            @if (!loading && products.length === 0) {
              <div class="no-data">
                <p>Aucun produit trouvé</p>
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
    .product-list-container {
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

    .product-image {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 4px;
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
export class ProductListComponent implements OnInit {
  products: any[] = [];
  displayedColumns: string[] = ['image', 'nom', 'prix', 'categorie', 'stock', 'actions'];
  loading = true;
  isAdmin = false;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;

  // Filtres
  searchTerm = '';
  sortField = 'nom';
  sortDirection = 'asc';

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('admin');
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;

    const params = {
      page: this.currentPage + 1,
      limit: this.pageSize,
      sort: `${this.sortDirection === 'desc' ? '-' : ''}${this.sortField}`,
      search: this.searchTerm || undefined
    };

    this.productService.getProducts(params).subscribe({
      next: (response) => {
        this.products = response.data;
        this.totalItems = response.count;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(
          'Erreur lors du chargement des produits',
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
    this.loadProducts();
  }

  sortData(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction || 'asc';
    this.loadProducts();
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  deleteProduct(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.snackBar.open('Produit supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadProducts();
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
