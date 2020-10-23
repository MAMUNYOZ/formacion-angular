import { Component, OnInit, OnDestroy } from '@angular/core';

import { Path } from '../../config';
import { DinamicPrice, Quantity, Sweetalert } from '../../functions';

import { ProductsService } from '../../services/products.service';

import { Subject } from 'rxjs';

import { Router } from '@angular/router';

import notie from 'notie';
import { confirm } from 'notie';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css'],
})
export class ShoppingCartComponent implements OnInit, OnDestroy {
  path: string = Path.url;
  shoppingCart: any[] = [];
  totalShoppingCart = 0;
  render = true;
  totalP = `<div class="p-2"><h3>Total <span class="totalP"><div class="spinner-border"></div></span></h3></div>   `;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  popoverMessage = '¿ Deseas borrarlo ?';

  constructor(
    private productsService: ProductsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    /*=============================================
	  	Agregamos opciones a DataTable
	  	=============================================*/

    this.dtOptions = {
      pagingType: 'full_numbers',
      processing: true,
    };

    /*=============================================
		Tomamos la data del Carrito de Compras del LocalStorage
		=============================================*/

    if (localStorage.getItem('list')) {
      const list = JSON.parse(localStorage.getItem('list'));

      this.totalShoppingCart = list.length;

      /*=============================================
			Recorremos el arreglo del listado
			=============================================*/
      let load = 0;

      /*=============================================
				Filtramos los productos del carrito de compras
				=============================================*/

      for (const i in list) {
        if (list.hasOwnProperty(i)) {
          this.productsService
            .getFilterData('url', list[i].product)
            .subscribe((resp) => {
              for (const f in resp) {
                if (resp.hasOwnProperty(f)) {
                  load++;

                  let details = `<div class="list-details small text-secondary">`;

                  if (list[i].details.length > 0) {
                    const specification = JSON.parse(list[i].details);

                    for (const h in specification) {
                      if (specification.hasOwnProperty(h)) {
                        const property = Object.keys(specification[h]);

                        for (const m in property) {
                          if (property.hasOwnProperty(m)) {
                            details += `<div>${property[m]}: ${
                              specification[i][property[m]]
                            }</div>`;
                          }
                        }
                      }
                    }
                  } else {
                    /*=============================================
									  Mostrar los detalles por defecto del producto
									  =============================================*/

                    if (resp[f].specification !== '') {
                      const specification = JSON.parse(resp[f].specification);

                      for (const g in specification) {
                        if (specification.hasOwnPropety(g)) {
                          const property = Object.keys(
                            specification[g]
                          ).toString();

                          details += `<div>${property}: ${specification[g][property][0]}</div>`;
                        }
                      }
                    }
                  }

                  details += `</div>`;

                  this.shoppingCart.push({
                    url: resp[f].url,
                    name: resp[f].name,
                    category: resp[f].category,
                    image: resp[f].image,
                    delivery_time: resp[f].delivery_time,
                    quantity: list[i].unit,
                    price: DinamicPrice.fnc(resp[f])[0],
                    shipping: Number(resp[f].shipping) * Number(list[i].unit),
                    details: details,
                    listDetails: list[i].details,
                  });

                  if (load === list.length) {
                    this.dtTrigger.next();
                  }
                }
              }
            });
        }
      }
    }
  }

  /*=============================================
    Función Callback
    =============================================*/

  callback(): any {
    if (this.render) {
      this.render = false;

      this.totalPrice(this.totalShoppingCart);

      setTimeout(() => {
        Quantity.fnc();
      }, this.totalShoppingCart * 100);
    }
  }

  /*=============================================
    Función cambio de cantidad
    =============================================*/

  changeQuantity(quantity, unit, move, product, details): any {
    let num = 1;

    /*=============================================
        Controlar máximos y mínimos de la cantidad
        =============================================*/

    if (Number(quantity) > 9) {
      quantity = 9;
    }

    if (Number(quantity) < 1) {
      quantity = 1;
    }

    /*=============================================
        Modificar cantidad de acuerdo a la dirección
        =============================================*/

    if (move === 'up' && Number(quantity) < 9) {
      num = Number(quantity) + unit;
    } else if (move === 'down' && Number(quantity) > 1) {
      num = Number(quantity) - unit;
    } else {
      num = Number(quantity);
    }

    /*=============================================
        Actualizar la variable list del localStorage
        =============================================*/
    if (localStorage.getItem('list')) {
      const shoppingCart = JSON.parse(localStorage.getItem('list'));

      shoppingCart.forEach((list) => {
        if (list.product === product && list.details === details.toString()) {
          list.unit = num;
        }
      });

      localStorage.setItem('list', JSON.stringify(shoppingCart));

      this.totalPrice(shoppingCart.length);
    }
  }

  /*=============================================
    Actualizar subtotal y total
    =============================================*/

  totalPrice(totalShoppingCart): any {
    setTimeout(() => {
      const price = $('.pShoppingCart .end-price');
      const quantity = $('.qShoppingCart');
      const shipping = $('.sShoppingCart');
      const subTotalPrice = $('.subTotalPrice');

      let total = 0;

      for (let i = 0; i < price.length; i++) {
        /*=============================================
				Sumar precio con envío
				=============================================*/
        const shippingPrice =
          Number($(price[i]).html()) + Number($(shipping[i]).html());

        /*=============================================
				Multiplicar cantidad por precio con envío
				=============================================*/

        const subTotal = Number($(quantity[i]).val()) * shippingPrice;

        /*=============================================
				Mostramos subtotales de cada producto
				=============================================*/

        $(subTotalPrice[i]).html(`$${subTotal.toFixed(2)}`);

        /*=============================================
				Definimos el total de los precios
				=============================================*/

        total += subTotal;
      }

      $('.totalP').html(`$${total.toFixed(2)}`);
    }, totalShoppingCart * 1000);
  }

  /*=============================================
	Función para remover productos de la lista de carrito de compras
	=============================================*/

  removeProduct(product, details): any {
    /*=============================================
	    Buscamos coincidencia para remover el producto
	    =============================================*/

    if (localStorage.getItem('list')) {
      const shoppingCart = JSON.parse(localStorage.getItem('list'));

      shoppingCart.forEach((list, index) => {
        if (list.product === product && list.details === details.toString()) {
          shoppingCart.splice(index, 1);
        }
      });

      /*=============================================
    		Actualizamos en LocalStorage la lista del carrito de compras
    		=============================================*/

      localStorage.setItem('list', JSON.stringify(shoppingCart));

      Sweetalert.fnc('success', 'product removed', this.router.url);
    }
  }

  /*=============================================
	Destruímos el trigger de angular
	=============================================*/

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
