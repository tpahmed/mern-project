import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../services/product.service';
import { StockService } from '../../../services/stock.service';

@Component({
  selector: 'app-stock-movement',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="stock-movement-container">
      <div class="header-actions">
        <h1>{{ isEdit ? 'Modifier' : 'Nouveau' }} mouvement de stock</h1>
        <button mat-button color="primary" routerLink="/stocks">
          <mat-icon>arrow_back</mat-icon> Retour à la liste
        </button>
      </div>
    
      <mat-card>
        <mat-card-content>
          @if (loading) {
            <div class="loading">
              <p>Chargement...</p>
            </div>
          } @else {
            <form [formGroup]="movementForm" (ngSubmit)="onSubmit()">
              @if (!selectedProductId) {
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Produit</mat-label>
                  <mat-select formControlName="produit" required>
                    @for (product of products; track product) {
                      <mat-option [value]="product._id">
                        {{ product.nom }}
                      </mat-option>
                    }
                  </mat-select>
                  @if (movementForm.get('produit')?.invalid && movementForm.get('produit')?.touched) {
                    <mat-error>Veuillez sélectionner un produit</mat-error>
                  }
                </mat-form-field>
              } @else {
                <div class="selected-product">
                  <h3>Produit: {{ selectedProduct?.nom }}</h3>
                  @if (stockInfo) {
                    <p>Stock actuel:
                      <span [ngClass]="{
                        'stock-low': stockInfo.quantite <= stockInfo.seuilAlerte && stockInfo.quantite > 0,
                        'stock-out': stockInfo.quantite === 0,
                        'stock-normal': stockInfo.quantite > stockInfo.seuilAlerte
                      }">
                        {{ stockInfo.quantite }}
                      </span>
                    </p>
                  }
                </div>
              }
    
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Type de mouvement</mat-label>
                <mat-select formControlName="type" required>
                  <mat-option value="entree">Entrée</mat-option>
                  <mat-option value="sortie">Sortie</mat-option>
                  <mat-option value="ajustement">Ajustement</mat-option>
                </mat-select>
                @if (movementForm.get('type')?.invalid && movementForm.get('type')?.touched) {
                  <mat-error>Veuillez sélectionner un type de mouvement</mat-error>
                }
              </mat-form-field>
    
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Quantité</mat-label>
                <input matInput type="number" formControlName="quantite" min="0.01" step="0.01" required>
                @if (movementForm.get('quantite')?.invalid && movementForm.get('quantite')?.touched) {
                  <mat-error>
                    @if (movementForm.get('quantite')?.errors?.['required']) {
                      La quantité est requise
                    } @else if (movementForm.get('quantite')?.errors?.['min']) {
                      La quantité doit être supérieure à 0
                    }
                  </mat-error>
                }
              </mat-form-field>
    
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Raison</mat-label>
                <textarea matInput formControlName="raison" rows="3"></textarea>
              </mat-form-field>
    
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Référence (optionnel)</mat-label>
                <input matInput formControlName="reference">
              </mat-form-field>
    
              <div class="form-actions">
                <button mat-button routerLink="/stocks">Annuler</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="movementForm.invalid || isSubmitting">
                  {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
    `,
  styles: [`
    .stock-movement-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }

    .selected-product {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .selected-product h3 {
      margin-top: 0;
      margin-bottom: 10px;
    }

    .stock-normal {
      color: green;
      font-weight: bold;
    }

    .stock-low {
      color: orange;
      font-weight: bold;
    }

    .stock-out {
      color: red;
      font-weight: bold;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }

    .loading {
      text-align: center;
      padding: 20px;
    }
  `]
})
export class StockMovementComponent implements OnInit {
  movementForm: FormGroup;
  products: any[] = [];
  selectedProduct: any = null;
  selectedProductId: string | null = null;
  stockInfo: any = null;
  loading = true;
  isSubmitting = false;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private stockService: StockService,
    private snackBar: MatSnackBar
  ) {
    this.movementForm = this.fb.group({
      produit: ['', Validators.required],
      type: ['entree', Validators.required],
      quantite: [1, [Validators.required, Validators.min(0.01)]],
      raison: [''],
      reference: ['']
    });
  }

  ngOnInit(): void {
    // Vérifier si un produit est spécifié dans l'URL
    this.route.paramMap.subscribe(params => {
      const productId = params.get('productId');
      const movementType = params.get('type');

      if (productId) {
        this.selectedProductId = productId;
        this.movementForm.patchValue({ produit: productId });

        if (movementType && ['entree', 'sortie', 'ajustement'].includes(movementType)) {
          this.movementForm.patchValue({ type: movementType });
        }

        this.loadProductDetails(productId);
      } else {
        this.loadProducts();
      }
    });
  }

  loadProducts(): void {
    this.productService.getProducts({ limit: 100 }).subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data;
        }
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

  loadProductDetails(productId: string): void {
    this.productService.getProduct(productId).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedProduct = response.data;
          this.loadStockInfo(productId);
        } else {
          this.loading = false;
          this.snackBar.open('Produit non trouvé', 'Fermer', { duration: 5000 });
          this.router.navigate(['/stocks/movement/new']);
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement du produit', 'Fermer', { duration: 5000 });
        this.router.navigate(['/stocks/movement/new']);
      }
    });
  }

  loadStockInfo(productId: string): void {
    this.stockService.getStockByProduct(productId).subscribe({
      next: (response) => {
        if (response.success) {
          this.stockInfo = response.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.movementForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const movementData = this.movementForm.value;

    this.stockService.recordMovement(movementData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.snackBar.open('Mouvement de stock enregistré avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/stocks']);
        } else {
          this.snackBar.open(
            response.message || 'Erreur lors de l\'enregistrement du mouvement',
            'Fermer',
            { duration: 5000 }
          );
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.snackBar.open(
          error.error?.message || 'Erreur lors de l\'enregistrement du mouvement',
          'Fermer',
          { duration: 5000 }
        );
      }
    });
  }
}
