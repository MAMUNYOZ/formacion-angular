import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Api } from '../config';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

	private api:string = Api.url;

  	constructor(private http:HttpClient) { }

  	getData(){

		return this.http.get(`${this.api}categories.json`);

	}

	getFilterData(orderBy:string, equalTo:string){

		return this.http.get(`${this.api}categories.json?orderBy="${orderBy}"&equalTo="${equalTo}"&print=pretty`);

	}

	patchData(id:string, value:object){

		return this.http.patch(`${this.api}categories/${id}.json`,value);

	}
	
}
