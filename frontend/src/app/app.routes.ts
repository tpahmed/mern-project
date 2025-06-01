import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductListComponent } from './components/products/product-list/product-list.component';
import { ProductDetailComponent } from './components/products/product-detail/product-detail.component';
import { StockListComponent } from './components/stocks/stock-list/stock-list.component';
import { StockMovementComponent } from './components/stocks/stock-movement/stock-movement.component';
import { NotFoundComponent } from './components/error/not-found/not-found.component';
import { UnauthorizedComponent } from './components/error/unauthorized/unauthorized.component';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Routes publiques
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Routes protégées (avec layout principal)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },

      // Routes produits
      { path: 'products', component: ProductListComponent },
      { path: 'products/:id', component: ProductDetailComponent },

      // Routes stocks
      { path: 'stocks', component: StockListComponent },
      { path: 'stocks/movement/new', component: StockMovementComponent },
      { path: 'stocks/movement/new/:productId', component: StockMovementComponent },
      { path: 'stocks/movement/new/:productId/:type', component: StockMovementComponent },
    ]
  },

  // Routes d'erreur
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', component: NotFoundComponent }
];
