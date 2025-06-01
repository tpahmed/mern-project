import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  codeBarre: string;
  categorie: any;
  image: string;
  actif: boolean;
  dateCreation: Date;
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  data: Product[];
  pagination: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://45.149.207.90:5000/api/products';

  constructor(private http: HttpClient) { }

  getProducts(params: any = {}): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(this.apiUrl, { params });
  }

  getProduct(id: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/${id}`);
  }

  createProduct(productData: any): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.apiUrl, productData);
  }

  updateProduct(id: string, productData: any): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.apiUrl}/${id}`, productData);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
