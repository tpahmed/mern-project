import { Component, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
],
  template: `
    <mat-toolbar color="primary" class="header">
      <div class="container">
        <div class="logo">
          <a routerLink="/">Gestion de Stock</a>
        </div>

        <div class="nav-links">
          @if (isLoggedIn) {
            <button mat-button routerLink="/dashboard">
              <mat-icon>dashboard</mat-icon> Tableau de bord
            </button>

            <button mat-button routerLink="/products">
              <mat-icon>inventory_2</mat-icon> Produits
            </button>

            <button mat-button routerLink="/stocks">
              <mat-icon>store</mat-icon> Stocks
            </button>

            @if (isAdmin) {
              <button mat-button [matMenuTriggerFor]="adminMenu">
                <mat-icon>admin_panel_settings</mat-icon> Administration
              </button>
              <mat-menu #adminMenu="matMenu">
                <button mat-menu-item routerLink="/categories">
                  <mat-icon>category</mat-icon> Catégories
                </button>
                <button mat-menu-item routerLink="/users">
                  <mat-icon>people</mat-icon> Utilisateurs
                </button>
                <button mat-menu-item routerLink="/reports">
                  <mat-icon>assessment</mat-icon> Rapports
                </button>
              </mat-menu>
            }
          }
        </div>

        <div class="auth-actions">
          @if (isLoggedIn) {
            <button mat-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon> {{ currentUser?.nom || 'Utilisateur' }}
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon> Mon profil
              </button>
              <button mat-menu-item (click)="logout()">
                <mat-icon>exit_to_app</mat-icon> Déconnexion
              </button>
            </mat-menu>
          } @else {
            <button mat-button routerLink="/login">
              <mat-icon>login</mat-icon> Connexion
            </button>
            <button mat-button routerLink="/register">
              <mat-icon>person_add</mat-icon> Inscription
            </button>
          }
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
    }

    .logo a {
      text-decoration: none;
      color: white;
      font-size: 1.2rem;
      font-weight: bold;
    }

    .nav-links {
      display: flex;
      gap: 10px;
    }

    .auth-actions {
      display: flex;
      gap: 10px;
    }

    @media (max-width: 768px) {
      .container {
        flex-direction: column;
        align-items: flex-start;
        padding: 10px 15px;
      }

      .nav-links, .auth-actions {
        margin-top: 10px;
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  currentUser: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      this.isAdmin = user ? user.role === 'admin' : false;
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        window.location.href = '/login';
      },
      error: () => {
        // En cas d'erreur, forcer la déconnexion côté client
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    });
  }
}
