import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';
import { Rating, 
	     DinamicRating, 
         DinamicReviews, 
         DinamicPrice   } from '../../../functions';

import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../services/products.service';

@Component({
  selector: 'app-product-right',
  templateUrl: './product-right.component.html',
  styleUrls: ['./product-right.component.css']
})
export class ProductRightComponent implements OnInit {

  	path:String = Path.url;	
  	products:Array<any> = [];
  	rating:Array<any> = [];
  	reviews:Array<any> = [];
  	price:Array<any> = [];
  	render:Boolean = true;
  	cargando:Boolean = false;

  	constructor(private activateRoute: ActivatedRoute,
  		        private productsService: ProductsService) { }

  	ngOnInit(): void {

  		this.cargando = true;

  		this.productsService.getFilterData("url", this.activateRoute.snapshot.params["param"]) 
  		.subscribe( resp => { 

  			for(const i in resp){
  				
  				this.productsService.getFilterData("store", resp[i].store)
  				.subscribe( resp => {
  					
  					this.productsFnc(resp);		

  				})

  			}

  		}) 
  	}

  	/*=============================================
	Declaramos función para mostrar los productos recomendados
	=============================================*/	

  	productsFnc(response){

  		this.products = [];

		/*=============================================
		Hacemos un recorrido por la respuesta que nos traiga el filtrado
		=============================================*/	

  		let i;
  		let getProduct = [];

  		for(i in response){

			getProduct.push(response[i]);						
				
		}

	  	/*=============================================
		Ordenamos de mayor a menor ventas el arreglo de objetos
		=============================================*/	

		getProduct.sort(function(a,b){
			return (b.sales - a.sales)
		})	

		/*=============================================
		Filtramos el producto
		=============================================*/

		getProduct.forEach((product, index)=>{

			if(index < 4){

				this.products.push(product);

				 /*=============================================
	        	Rating y Review
	        	=============================================*/
	        
	        	this.rating.push(DinamicRating.fnc(this.products[index]));
	        
	        	this.reviews.push(DinamicReviews.fnc(this.rating[index]));
	      
	        	/*=============================================
	        	Price
	        	=============================================*/        

	        	this.price.push(DinamicPrice.fnc(this.products[index]));
				
				this.cargando = false;
			}


		})

	}

	callback(){

  		if(this.render){

  			this.render = false;

  			Rating.fnc();

  		}
	}
}
