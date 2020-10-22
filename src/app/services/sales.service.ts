import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Api } from '../config';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

	private api:string = Api.url;

  	constructor(private http:HttpClient) { }

	getData(){

		return this.http.get(`${this.api}sales.json`);

	}

	/*=============================================
	Registro en Firebase Database
	=============================================*/

	registerDatabase(body:object, idToken:string){

		return this.http.post(`${this.api}/sales.json?auth=${idToken}`, body);

	}
}
