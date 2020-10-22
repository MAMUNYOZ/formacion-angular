import { Component, OnInit } from '@angular/core';
import { Path } from '../../config';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-header-promotion',
  templateUrl: './header-promotion.component.html',
  styleUrls: ['./header-promotion.component.css'],
})
export class HeaderPromotionComponent implements OnInit {
  path: string = Path.url;
  topBanner: object = null;
  category: object = null;
  url: object = null;
  preload = false;

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.preload = true;

    this.productsService.getData().subscribe((resp) => {

      /*=============================================
			Mostramos un banner aleatorio de entre 20 productos
			=============================================*/

      const index = Math.floor(Math.random() * 20);

      this.topBanner = JSON.parse(resp[Object.keys(resp)[index]].top_banner);
      this.category = resp[Object.keys(resp)[index]].category;
      this.url = resp[Object.keys(resp)[index]].url;

      this.preload = false;
    });
  }
}
