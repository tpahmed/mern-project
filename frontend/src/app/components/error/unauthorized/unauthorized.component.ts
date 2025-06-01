import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    RouterModule,
    MatButtonModule,
    MatIconModule
],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <h1>403</h1>
        <h2>Accès non autorisé</h2>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <button mat-raised-button color="primary" routerLink="/">
          <mat-icon>home</mat-icon> Retour à l'accueil
        </button>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }

    .unauthorized-content {
      text-align: center;
      padding: 30px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 500px;
    }

    h1 {
      font-size: 72px;
      margin: 0;
      color: #ff9800;
    }

    h2 {
      font-size: 24px;
      margin-top: 0;
    }

    p {
      margin-bottom: 20px;
      color: #666;
    }
  `]
})
export class UnauthorizedComponent {}
