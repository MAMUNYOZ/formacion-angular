import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';
import { OwlCarouselConfig, BackgroundImage } from '../../../functions';

import { ProductsService } from '../../../services/products.service';

@Component({
  selector: 'app-home-banner',
  templateUrl: './home-banner.component.html',
  styleUrls: ['./home-banner.component.css'],
})
export class HomeBannerComponent implements OnInit {
  path: string = Path.url;
  bannerHome: any[] = [];
  category: any[] = [];
  url: any[] = [];
  render = true;
  preload = false;

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.preload = true;

    let index = 0;

    this.productsService.getData().subscribe((resp) => {
      /*=============================================
			Generar un número aleatorio entre 5 banners
			=============================================*/

      index = Math.floor(Math.random() * 5);

      /*=============================================
			Seleccionar data de productos con límites
			=============================================*/

      this.productsService
        .getLimitData(Object.keys(resp)[index], 5)
        .subscribe((resp2) => {
          for ( const i in resp2) {
            if (resp2.hasOwnProperty(i)) {
              this.bannerHome.push(JSON.parse(resp2[i].horizontal_slider));
              this.category.push(resp2[i].category);
              this.url.push(resp2[i].url);

              this.preload = false;
            }
          }
        });
    });
  }

  /*=============================================
	Función que nos avisa cuando finaliza el renderizado de Angular
	=============================================*/

  callback(): any {
    if (this.render) {
      this.render = false;

      OwlCarouselConfig.fnc();
      BackgroundImage.fnc();
    }
  }
}
