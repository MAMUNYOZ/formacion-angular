import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {Api} from '../config';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

	private api:string = Api.url;

  	constructor(private http:HttpClient) { }

  	/*=============================================
	Registro en Firebase Database
	=============================================*/

	registerDatabase(body:object, idToken:string){

		return this.http.post(`${this.api}/orders.json?auth=${idToken}`, body);

	}

	/*=============================================
	Filtrado de datos
	=============================================*/

	getFilterData(orderBy:string, equalTo:string){

		return this.http.get(`${this.api}orders.json?orderBy="${orderBy}"&equalTo="${equalTo}"&print=pretty`);

	}

}
