import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';

import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-call-to-action',
  templateUrl: './call-to-action.component.html',
  styleUrls: ['./call-to-action.component.css'],
})
export class CallToActionComponent implements OnInit {
  path: string = Path.url;
  callToAction: any[] = [];
  price: any[] = [];

  constructor(
    private activateRoute: ActivatedRoute,
    private productsService: ProductsService,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productsService
      .getFilterData('url', this.activateRoute.snapshot.params['param'])
      .subscribe((resp) => {
        for (const i in resp) {
          if (resp.hasOwnProperty(i)) {
            this.callToAction.push(resp[i]);

            this.callToAction.forEach((response) => {
              let type;
              let value;
              let offer;

              if (response.offer !== '') {
                type = JSON.parse(response.offer)[0];
                value = JSON.parse(response.offer)[1];

                if (type === 'Disccount') {
                  offer = (
                    response.price -
                    (response.price * value) / 100
                  ).toFixed(2);
                }

                if (type === 'Fixed') {
                  offer = value;
                }

                this.price.push(`<span class="ps-product__price">

												  <span>$${offer}</span>

												  <del>$${response.price}</del>

											  </span>`);
              } else {
                this.price.push(`<span class="ps-product__price">
												  <span>$${response.price}</span>
											  </span>`);
              }
            });
          }
        }
      });
  }

  /*=============================================
	Función para agregar productos al carrito de compras
	=============================================*/

  addShoppingCart(product, unit, details): any {
    const url = this.router.url;

    const item = {
      product: product,
      unit: unit,
      details: details,
      url: url,
    };

    this.usersService.addSoppingCart(item);
  }
}
