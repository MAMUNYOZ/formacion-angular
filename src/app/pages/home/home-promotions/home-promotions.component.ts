import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';

import { ProductsService } from '../../../services/products.service';

@Component({
  selector: 'app-home-promotions',
  templateUrl: './home-promotions.component.html',
  styleUrls: ['./home-promotions.component.css'],
})
export class HomePromotionsComponent implements OnInit {
  path: string = Path.url;
  bannerDefault: any[] = [];
  category: any[] = [];
  url: any[] = [];
  preload = false;

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.preload = true;

    let index = 0;

    this.productsService.getData().subscribe((resp) => {
      /*=============================================
			Obtenemos la longitud del objeto
			=============================================*/

      let i;
      let size = 0;

      for (i in resp) {
        if (resp.hasOwnProperty(i)) {
          size++;
        }
      }

      /*=============================================
			Generar un número aleatorio
			=============================================*/

      if (size > 2) {
        index = Math.floor(Math.random() * (size - 2));
      }

      /*=============================================
			Seleccionar data de productos con límites
			=============================================*/

      this.productsService
        .getLimitData(Object.keys(resp)[index], 2)
        .subscribe((resp2) => {
          for (const i in resp2) {
            if (resp2.hasOwnProperty(i)) {
              this.bannerDefault.push(resp2[i].default_banner);
              this.category.push(resp2[i].category);
              this.url.push(resp2[i].url);

              this.preload = false;
            }
          }
        });
    });
  }
}
