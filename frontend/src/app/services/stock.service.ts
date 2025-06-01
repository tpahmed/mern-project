import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './product.service';

export interface Stock {
  _id: string;
  produit: Product;
  quantite: number;
  emplacement: string;
  seuilAlerte: number;
  derniereMiseAJour: Date;
}

export interface StockResponse {
  success: boolean;
  data: Stock;
}

export interface StocksResponse {
  success: boolean;
  count: number;
  data: Stock[];
  pagination: any;
}

export interface StockMovement {
  _id: string;
  produit: string;
  quantite: number;
  type: 'entree' | 'sortie' | 'ajustement';
  date: Date;
  utilisateur: string;
  raison: string;
  reference: string;
  annule: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = 'http://localhost:5000/api/stocks';

  constructor(private http: HttpClient) { }

  getStocks(params: any = {}): Observable<StocksResponse> {
    return this.http.get<StocksResponse>(this.apiUrl, { params });
  }

  getStockByProduct(productId: string): Observable<StockResponse> {
    return this.http.get<StockResponse>(`${this.apiUrl}/product/${productId}`);
  }

  updateStock(stockId: string, stockData: any): Observable<StockResponse> {
    return this.http.put<StockResponse>(`${this.apiUrl}/${stockId}`, stockData);
  }

  recordMovement(movementData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/movement`, movementData);
  }

  getProductMovements(productId: string, params: any = {}): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/movement/${productId}`, { params });
  }

  cancelMovement(movementId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/movement/${movementId}/cancel`, {});
  }
}
