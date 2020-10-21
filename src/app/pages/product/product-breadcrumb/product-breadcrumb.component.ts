import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../services/products.service';

@Component({
  selector: 'app-product-breadcrumb',
  templateUrl: './product-breadcrumb.component.html',
  styleUrls: ['./product-breadcrumb.component.css']
})
export class ProductBreadcrumbComponent implements OnInit {

   breadcrumb:string = null;

 	constructor(private activateRoute: ActivatedRoute,
              private productsService: ProductsService) { }

  	ngOnInit(): void {

  		/*=============================================
		  Capturamos el parámetro URL
		  =============================================*/	

		  this.breadcrumb = this.activateRoute.snapshot.params["param"].replace(/[-]/g, " ");

      /*=============================================
      Actualizar vistas de producto
      =============================================*/  

      this.productsService.getFilterData("url", this.activateRoute.snapshot.params["param"])
      .subscribe(resp=>{
        
        for(const i in resp){

          let id = Object.keys(resp).toString();
          
          let value = {
            "views": Number(resp[i].views+1)
          }

          this.productsService.patchData(id, value)
          .subscribe(resp=>{})
    
        }

      })


  	}


}
