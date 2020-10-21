import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';

import { OwlCarouselConfig, 
		 CarouselNavigation, 
		 Rating,
  		 DinamicRating, 
	     DinamicReviews, 
	     DinamicPrice  } from '../../../functions';

import { ProductsService} from '../../../services/products.service';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-products-recommended',
  templateUrl: './products-recommended.component.html',
  styleUrls: ['./products-recommended.component.css']
})
export class ProductsRecommendedComponent implements OnInit {

	path:String = Path.url;	
	recommendedItems:Array<any> = [];
	render:Boolean = true;
	rating:Array<any> = [];
	reviews:Array<any> = [];
	price:Array<any> = [];
	cargando:Boolean = false;

  	constructor(private productsService: ProductsService,
  		        private activateRoute: ActivatedRoute) { }

  	ngOnInit(): void {

  		this.cargando = true;

  		/*=============================================
		Capturamos el parámetro URL
		=============================================*/	

		let params = this.activateRoute.snapshot.params["param"].split("&")[0];

		/*=============================================
		Filtramos data de productos con categorías
		=============================================*/	

		this.productsService.getFilterData("category", params)
		.subscribe(resp1=>{

			if(Object.keys(resp1).length > 0){
		
				this.productsFnc(resp1);
							
			}else{

				/*=============================================
				Filtramos data de subategorías
				=============================================*/	

				this.productsService.getFilterData("sub_category", params)
				.subscribe(resp2=>{		
					
					this.productsFnc(resp2);			
					
				})

			}
			
		})

  	}

  	/*=============================================
	Declaramos función para mostrar los productos recomendados
	=============================================*/	

  	productsFnc(response){

  		this.recommendedItems = [];

		/*=============================================
		Hacemos un recorrido por la respuesta que nos traiga el filtrado
		=============================================*/	

  		let i;
  		let getSales = [];

  		for(i in response){

			getSales.push(response[i]);						
				
		}

		/*=============================================
		Ordenamos de mayor a menor ventas el arreglo de objetos
		=============================================*/	

		getSales.sort(function(a,b){
			return (b.views - a.views)
		})	

		/*=============================================
		Filtramos solo hasta 10 productos
		=============================================*/

		getSales.forEach((product, index)=>{

			if(index < 10){

				this.recommendedItems.push(product);
				
				this.rating.push(DinamicRating.fnc(this.recommendedItems[index]));
				
				this.reviews.push(DinamicReviews.fnc(this.rating[index]));

				this.price.push(DinamicPrice.fnc(this.recommendedItems[index]));

				this.cargando = false;

			}

		})

  	}
	
 	/*=============================================
	Función que nos avisa cuando finaliza el renderizado de Angular
	=============================================*/

  	callback(){

  		if(this.render){

  			this.render = false;

  			OwlCarouselConfig.fnc();
  			CarouselNavigation.fnc();
  			Rating.fnc();
  		
  		}

  	}

}
