import { Component, OnInit, Input } from '@angular/core';
import { Path } from '../../../../config';
import { DinamicPrice  } from '../../../../functions';

import { ProductsService } from '../../../../services/products.service';

declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'app-bought-together',
  templateUrl: './bought-together.component.html',
  styleUrls: ['./bought-together.component.css']
})
export class BoughtTogetherComponent implements OnInit {

	@Input() childItem:any;

	path:String = Path.url;	
	products:Array<any> = [];
	price:Array<any> = [];
	render:Boolean = true;

  	constructor(private productsService: ProductsService) { }

  	ngOnInit(): void {

  		this.productsService.getFilterData("title_list", this.childItem["title_list"])	
  		.subscribe( resp => {
  			
  			this.productsFnc(resp);

  		})	

  	}

	/*=============================================
	Declaramos función para mostrar los productos recomendados
	=============================================*/	

  	productsFnc(response){

  		this.products.push(this.childItem);

  		 /*=============================================
	    Hacemos un recorrido por la respuesta que nos traiga el filtrado
	    =============================================*/ 

	    let i;
	    let getProduct = [];

	    for(i in response){

	      getProduct.push(response[i]);           
	        
	    }

	    /*=============================================
		Ordenamos de mayor a menor vistas el arreglo de objetos
		=============================================*/	

		getProduct.sort(function(a,b){
			return (b.views - a.views)
		})	

		/*=============================================
	    Filtramos solo 1 producto
	    =============================================*/

	    getProduct.forEach((product, index)=>{

	    	if(index < 1){

	    		this.products.push(product);
 		
	    	}


	    })

	    for(const i in this.products){

	    	/*=============================================
	        Price
	        =============================================*/        
	        this.price.push(DinamicPrice.fnc(this.products[i]));
	    	
	    }

  	}

  	callback(){


  		if(this.render){

  			this.render = false;

  			let price = $(".endPrice .end-price");
  			
  			let total = 0;

  			for(let i = 0; i < price.length; i++){  				

  				total += Number($(price[i]).html())		
  				
  			}

  			$(".ps-block__total strong").html(`$${total.toFixed(2)}`)
  		}
  	}

}
