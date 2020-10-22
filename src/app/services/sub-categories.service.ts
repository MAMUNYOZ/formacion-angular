import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Api } from '../config';

@Injectable({
  providedIn: 'root'
})
export class SubCategoriesService {

  	private api:string = Api.url;

  	constructor(private http:HttpClient) { }

  	getFilterData(orderBy:string, equalTo:string){

		return this.http.get(`${this.api}sub-categories.json?orderBy="${orderBy}"&equalTo="${equalTo}"&print=pretty`);

	}

	patchData(id:string, value:object){

		return this.http.patch(`${this.api}sub-categories/${id}.json`,value);

	}
}
