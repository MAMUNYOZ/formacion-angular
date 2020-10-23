import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Api } from '../config';

@Injectable({
  providedIn: 'root',
})
export class StoresService {
  private api: string = Api.url;

  constructor(private http: HttpClient) {}

  getData(): any {
    return this.http.get(`${this.api}stores.json`);
  }

  getFilterData(orderBy: string, equalTo: string): any {
    return this.http.get(
      `${this.api}stores.json?orderBy="${orderBy}"&equalTo="${equalTo}"&print=pretty`
    );
  }
}
