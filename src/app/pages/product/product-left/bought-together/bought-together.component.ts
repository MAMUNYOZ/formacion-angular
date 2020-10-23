import { Component, OnInit, Input } from '@angular/core';
import { Path } from '../../../../config';
import { DinamicPrice } from '../../../../functions';

import { ProductsService } from '../../../../services/products.service';
import { UsersService } from '../../../../services/users.service';

import { Router } from '@angular/router';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-bought-together',
  templateUrl: './bought-together.component.html',
  styleUrls: ['./bought-together.component.css'],
})
export class BoughtTogetherComponent implements OnInit {
  @Input() childItem: any;

  path: string = Path.url;
  products: any[] = [];
  price: any[] = [];
  render = true;

  constructor(
    private productsService: ProductsService,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productsService
      .getFilterData('title_list', this.childItem['title_list'])
      .subscribe((resp) => {
        this.productsFnc(resp);
      });
  }

  /*=============================================
	Declaramos función para mostrar los productos recomendados
	=============================================*/

  productsFnc(response): any {
    this.products.push(this.childItem);

    /*=============================================
	    Hacemos un recorrido por la respuesta que nos traiga el filtrado
	    =============================================*/

    const getProduct = [];

    for (const i in response) {
      if (response.hasOwnProperty(i)) {
        getProduct.push(response[i]);
      }
    }

    /*=============================================
		Ordenamos de mayor a menor vistas el arreglo de objetos
		=============================================*/

    getProduct.sort((a, b) => {
      return b.views - a.views;
    });

    /*=============================================
	    Filtramos solo 1 producto
	    =============================================*/

    let random = Math.floor(Math.random() * getProduct.length);

    getProduct.forEach((product, index) => {
      let noIndex = 0;

      if (this.childItem['name'] === product['name']) {
        noIndex = index;
      }

      if (random === noIndex) {
        random = Math.floor(Math.random() * getProduct.length);
      }

      if (index !== noIndex && index === random) {
        this.products.push(product);
      }
    });

    for (const i in this.products) {
      if (this.products.hasOwnProperty(i)) {
        this.price.push(DinamicPrice.fnc(this.products[i]));
      }
    }
  }

  /*=============================================
  	 Función Callback
    =============================================*/

  callback(): any {
    if (this.render) {
      this.render = false;

      const price = $('.endPrice .end-price');

      let total = 0;

      for (let i = 0; i < price.length; i++) {
        total += Number($(price[i]).html());
      }

      $('.ps-block__total strong').html(`$${total.toFixed(2)}`);
    }
  }

  /*=============================================
  	Agregar dos productos a la lista de deseos
    =============================================*/

  addWishlist(product1, product2): any {
    this.usersService.addWishlist(product1);

    const localUsersService = this.usersService;

    setTimeout(()  => {
      localUsersService.addWishlist(product2);
    }, 1000);
  }

  /*=============================================
	Función para agregar productos al carrito de compras
	=============================================*/

  addShoppingCart(product1, unit1, details1, product2, unit2, details2): any {
    const url = this.router.url;

    const item1 = {
      product: product1,
      unit: unit1,
      details: details1,
      url: url,
    };

    this.usersService.addSoppingCart(item1);

    const localUsersService = this.usersService;

    setTimeout(() => {
      const item2 = {
        product: product2,
        unit: unit2,
        details: details2,
        url: url,
      };

      localUsersService.addSoppingCart(item2);
    }, 1000);
  }
}
