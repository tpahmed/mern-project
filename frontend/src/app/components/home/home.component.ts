import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <h1>Bienvenue sur l'application de Gestion de Stock</h1>
        <p>Une solution complète pour gérer vos produits et votre inventaire</p>

        @if (isLoggedIn) {
          <div class="cta-buttons">
            <button mat-raised-button color="primary" routerLink="/dashboard">
              <mat-icon>dashboard</mat-icon> Accéder au tableau de bord
            </button>
          </div>
        } @else {
          <div class="cta-buttons">
            <button mat-raised-button color="primary" routerLink="/login">
              <mat-icon>login</mat-icon> Se connecter
            </button>
            <button mat-raised-button color="accent" routerLink="/register">
              <mat-icon>person_add</mat-icon> S'inscrire
            </button>
          </div>
        }
      </div>

      <div class="features-section">
        <h2>Fonctionnalités principales</h2>

        <div class="features-grid">
          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon>inventory_2</mat-icon>
              <mat-card-title>Gestion des produits</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Ajoutez, modifiez et organisez facilement vos produits par catégories</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon>swap_horiz</mat-icon>
              <mat-card-title>Mouvements de stock</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Enregistrez les entrées, sorties et transferts de stock avec traçabilité</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon>warning</mat-icon>
              <mat-card-title>Alertes de stock</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Soyez informé lorsque vos produits atteignent un niveau critique</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon>assessment</mat-icon>
              <mat-card-title>Rapports et statistiques</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Analysez vos données de stock avec des rapports détaillés</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .hero-section {
      text-align: center;
      padding: 60px 20px;
      background-color: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 40px;
    }

    .hero-section h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
      color: #3f51b5;
    }

    .hero-section p {
      font-size: 1.2rem;
      margin-bottom: 30px;
      color: #555;
    }

    .cta-buttons {
      display: flex;
      justify-content: center;
      gap: 20px;
    }

    .features-section {
      padding: 20px;
    }

    .features-section h2 {
      text-align: center;
      margin-bottom: 40px;
      font-size: 2rem;
      color: #3f51b5;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 30px;
    }

    .feature-card {
      height: 100%;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }

    .feature-card mat-card-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }

    .feature-card mat-icon {
      margin-right: 10px;
      color: #3f51b5;
      font-size: 24px;
      height: 24px;
      width: 24px;
    }

    .feature-card mat-card-content p {
      color: #666;
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .hero-section h1 {
        font-size: 2rem;
      }

      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }

      .cta-buttons button {
        width: 100%;
        max-width: 300px;
        margin-bottom: 10px;
      }
    }
  `]
})
export class HomeComponent {
  isLoggedIn = false;

  constructor(private authService: AuthService) {
    this.isLoggedIn = this.authService.isLoggedIn();
  }
}
