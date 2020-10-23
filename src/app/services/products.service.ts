import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Api } from '../config';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private api: string = Api.url;

  constructor(private http: HttpClient) {}

  getData(): any{
    return this.http.get(`${this.api}products.json`);
  }

  getLimitData(startAt: string, limitToFirst: number): any {
    return this.http.get(
      `${this.api}products.json?orderBy="$key"&startAt="${startAt}"&limitToFirst=${limitToFirst}&print=pretty`
    );
  }

  getFilterData(orderBy: string, equalTo: string): any {
    return this.http.get(
      `${this.api}products.json?orderBy="${orderBy}"&equalTo="${equalTo}"&print=pretty`
    );
  }

  getFilterDataWithLimit(
    orderBy: string,
    equalTo: string,
    limitToFirst: number
  ): any {
    return this.http.get(
      `${this.api}products.json?orderBy="${orderBy}"&equalTo="${equalTo}"&limitToFirst=${limitToFirst}&print=pretty`
    );
  }

  getSearchData(orderBy: string, param: string): any {
    return this.http.get(
      `${this.api}products.json?orderBy="${orderBy}"&startAt="${param}"&endAt="${param}\uf8ff"&print=pretty`
    );
  }

  patchData(id: string, value: object): any {
    return this.http.patch(`${this.api}products/${id}.json`, value);
  }

  getUniqueData(value: string): any {
    return this.http.get(`${this.api}products/${value}.json`);
  }

  patchDataAuth(id: string, value: object, idToken: string): any {
    return this.http.patch(
      `${this.api}products/${id}.json?auth=${idToken}`,
      value
    );
  }
}
