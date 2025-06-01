import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterModule,
    HeaderComponent
],
  template: `
    <div class="app-container">
      <app-header></app-header>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <footer class="footer">
        <div class="container">
          <p>&copy; {{ currentYear }} Gestion de Stock. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      padding-bottom: 30px;
    }

    .footer {
      padding: 15px 0;
      background-color: #f5f5f5;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
    }
  `]
})
export class MainLayoutComponent {
  currentYear = new Date().getFullYear();
}
