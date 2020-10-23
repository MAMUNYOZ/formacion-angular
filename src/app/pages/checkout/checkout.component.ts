import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Path, Payu, MercadoPago } from '../../config';
import { Sweetalert, DinamicPrice, Paypal } from '../../functions';

import { Router, ActivatedRoute } from '@angular/router';

import { UsersModel } from '../../models/users.model';

import { UsersService } from '../../services/users.service';
import { ProductsService } from '../../services/products.service';
import { OrdersService } from '../../services/orders.service';
import { SalesService } from '../../services/sales.service';
import { StoresService } from '../../services/stores.service';

import * as Cookies from 'js-cookie';

import { Md5 } from 'md5-typescript';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  path: string = Path.url;
  user: UsersModel;
  id: string = null;
  saveAddress = false;
  countries: any = null;
  dialCode: string = null;
  shoppingCart: any[] = [];
  totalShoppingCart = 0;
  render = true;
  totalP = ` <h3 class="text-right">Total <span class="totalCheckout"><div class="spinner-border"></div></span></h3>`;
  totalPrice: any[] = [];
  subTotalPrice: any[] = [];
  paymentMethod = '';
  addInfo = '';
  validateCoupon = false;

  constructor(
    private router: Router,
    private usersService: UsersService,
    private productsService: ProductsService,
    private ordersService: OrdersService,
    private salesService: SalesService,
    private storesService: StoresService,
    private activatedRoute: ActivatedRoute
  ) {
    this.user = new UsersModel();
  }

  ngOnInit(): void {
    /*=============================================
  		Validar la existencia de un cupón de la tienda
  		=============================================*/
    if (Cookies.get('coupon') !== undefined) {
      this.storesService
        .getFilterData('url', Cookies.get('coupon'))
        .subscribe((resp) => {
          this.validateCoupon = true;
        });
    }

    /*=============================================
		Validar si existe usuario autenticado
		=============================================*/

    this.usersService.authActivate().then((resp) => {
      if (resp) {
        this.usersService
          .getFilterData('idToken', localStorage.getItem('idToken'))
          .subscribe((resp2) => {
            this.id = Object.keys(resp2).toString();

            for (const i in resp2) {
              if (resp2.hasOwnProperty(i)) {
                this.user.displayName = resp2[i].displayName;
                this.user.username = resp2[i].username;
                this.user.email = resp2[i].email;
                this.user.country = resp2[i].country;
                this.user.city = resp2[i].city;

                if (resp2[i].phone !== undefined) {
                  this.user.phone = resp2[i].phone.split('-')[1];
                  this.dialCode = resp2[i].phone.split('-')[0];
                }

                this.user.address = resp2[i].address;

                /*=============================================
              Obtener listado de países
              =============================================*/

                this.usersService.getCountries().subscribe((resp3) => {
                  this.countries = resp3;
                });
              }
            }
          });
      }
    });

    /*=============================================
		Obtener la lista del carrito de compras
		=============================================*/

    if (localStorage.getItem('list')) {
      const list = JSON.parse(localStorage.getItem('list'));

      this.totalShoppingCart = list.length;

      if (list.length === 0) {
        this.router.navigateByUrl('/shopping-cart');

        return;
      }

      /*=============================================
			Recorremos el listado
			=============================================*/

      for (const i in list) {
        if (list.hasOwnProperty(i)) {
          /*=============================================
				Filtramos los productos del carrito de compras
				=============================================*/

          this.productsService
            .getFilterData('url', list[i].product)
            .subscribe((resp) => {
              for (const f in resp) {
                if (resp.hasOwnProperty(f)) {
                  let details = `<div class="list-details small text-secondary">`;

                  if (list[i].details.length > 0) {
                    const specification = JSON.parse(list[i].details);

                    for (const h in specification) {
                      if (specification.hasOwnProperty(h)) {
                        const property = Object.keys(specification[h]);

                        for (const g in property) {
                          if (property.hasOwnProperty(g)) {
                            details += `<div>${property[g]}: ${
                              specification[i][property[g]]
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

                      for (const m in specification) {
                        if (specification.hasOwnProperty(m)) {
                          const property = Object.keys(
                            specification[m]
                          ).toString();

                          details += `<div>${property}: ${specification[m][property][0]}</div>`;
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
                    store: resp[f].store,
                  });
                }
              }
            });
        }
      }
    } else {
      this.router.navigateByUrl('/shopping-cart');

      return;
    }
  }

  /*=============================================
	Guardar datos de envíos del usuario
	=============================================*/

  saveAddressFnc(
    inputCountry,
    inputCity,
    inputPhone,
    inputAddress,
    inputSaveAddress
  ): any {
    if (this.saveAddress) {
      if (
        inputCountry.value !== '' &&
        inputCity.value !== '' &&
        inputPhone.value !== '' &&
        inputAddress.value !== ''
      ) {
        const body = {
          country: this.user.country,
          countryCode: this.user.countryCode,
          city: this.user.city,
          phone: `${this.dialCode}-${this.user.phone}`,
          address: this.user.address,
        };

        this.usersService.patchData(this.id, body).subscribe((resp) => {
          Sweetalert.fnc('success', 'Your data was updated', null);
        });
      } else {
        inputSaveAddress.checked = false;

        Sweetalert.fnc('error', 'Please fill in the required fields', null);
      }
    }
  }

  /*=============================================
	Agregar código telefónico al input telefónico
	=============================================*/

  changeCountry(inputCountry): any {
    this.countries.forEach((country) => {
      if (inputCountry.value === country.name) {
        this.dialCode = country.dial_code;
        this.user.countryCode = country.code;
      }
    });
  }

  /*=============================================
	Función Callback()
	=============================================*/

  callback(): any {
    if (this.render) {
      this.render = false;

      const totalShoppingCart = this.totalShoppingCart;
      const localTotalPrice = this.totalPrice;
      const localSubTotalPrice = this.subTotalPrice;
      const localActivatedRoute = this.activatedRoute;
      const localShoppingCart = this.shoppingCart;
      const localProductsService = this.productsService;
      const localUser = this.user;
      const localDialCode = this.dialCode;
      const localAddInfo = this.addInfo;
      const localOrdersService = this.ordersService;
      const localValidateCoupon = this.validateCoupon;
      const localPaymentMethod = this.paymentMethod;
      const localSalesService = this.salesService;

      /*=============================================
			Mostrar lista del carrito de compras con los precios definitivos
			=============================================*/

      setTimeout(() => {
        const price = $('.pCheckout .end-price');
        const quantity = $('.qCheckout');
        const shipping = $('.sCheckout');
        const subTotalPrice = $('.subTotalPriceCheckout');

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

          const subTotal = Number($(quantity[i]).html()) * shippingPrice;

          /*=============================================
					Mostramos subtotales de cada producto
					=============================================*/

          $(subTotalPrice[i]).html(`$${subTotal.toFixed(2)}`);

          localSubTotalPrice.push(subTotal.toFixed(2));

          /*=============================================
					Definimos el total de los precios
					=============================================*/

          total += subTotal;
        }

        $('.totalCheckout').html(`$${total.toFixed(2)}`);

        localTotalPrice.push(total.toFixed(2));
      }, totalShoppingCart * 500);
    }
  }

  /*=============================================
  	Envío del formulario checkout
  	=============================================*/

  onSubmit(f: NgForm): any {
    /*=============================================
  		Validamos formulario para evitar campos vacíos
  		=============================================*/

    if (f.invalid) {
      Sweetalert.fnc('error', 'Respuesta no válida', null);

      return;
    }

    /*=============================================
  		Sweetalert para esperar el proceso de ejecución
  		=============================================*/

    Sweetalert.fnc('loading', 'Cargando...', null);

    /*=============================================
  		Pasarelas de pago
  		=============================================*/

    if (f.value.paymentMethod === 'paypal') {
      /*=============================================
			Checkout con Paypal
			=============================================*/

      Sweetalert.fnc('html', `<div id="paypal-button-container"></div>`, null);

      /*=============================================
			Ejecutamos función de Paypal pasando el precio total de la venta
			=============================================*/

      Paypal.fnc(this.totalPrice[0]).then((resp) => {
        if (resp) {
          let totalRender = 0;

          /*=============================================
					Tomamos la información de la venta
					=============================================*/

          this.shoppingCart.forEach((product, index) => {
            totalRender++;

            /*=============================================
						Enviar actualización de cantidad de producto vendido a la base de datos
						=============================================*/

            this.productsService
              .getFilterData('url', product.url)
              .subscribe((resp2) => {
                for (const i in resp2) {
                  if (resp2.hasOwnProperty(i)) {
                    const id = Object.keys(resp2).toString();

                    const value = {
                      sales: Number(resp2[i].sales) + Number(product.quantity),
                    };

                    this.productsService
                      .patchDataAuth(id, value, localStorage.getItem('idToken'))
                      .subscribe((resp3) => {});
                  }
                }
              });

            /*=============================================
						Crear el proceso de entrega de la venta
						=============================================*/

            const moment = Math.floor(Number(product.delivery_time) / 2);

            const sentDate = new Date();
            sentDate.setDate(sentDate.getDate() + moment);

            const deliveredDate = new Date();
            deliveredDate.setDate(
              deliveredDate.getDate() + Number(product.delivery_time)
            );

            const proccess = [
              {
                stage: 'reviewed',
                status: 'ok',
                comment:
                  'Hemos recibido tu pedido, lo estamos preparando',
                date: new Date(),
              },

              {
                stage: 'sent',
                status: 'pending',
                comment: '',
                date: sentDate,
              },
              {
                stage: 'delivered',
                status: 'pending',
                comment: '',
                date: deliveredDate,
              },
            ];

            /*=============================================
						Crear orden de venta en la base de datos
						=============================================*/

            const body = {
              store: product.store,
              user: this.user.username,
              product: product.name,
              url: product.url,
              image: product.image,
              category: product.category,
              details: product.details,
              quantity: product.quantity,
              price: this.subTotalPrice[index],
              email: f.value.email,
              country: f.value.country,
              city: f.value.city,
              phone: `${this.dialCode}-${f.value.phone}`,
              address: f.value.address,
              info: f.value.addInfo,
              process: JSON.stringify(proccess),
              status: 'pending',
            };

            this.ordersService
              .registerDatabase(body, localStorage.getItem('idToken'))
              .subscribe((resp2) => {
                if (resp2['name'] !== '') {

                  let commision = 0;
                  let unitPrice = 0;

                  if (this.validateCoupon) {
                    commision = Number(this.subTotalPrice[index]) * 0.05;
                    unitPrice = Number(this.subTotalPrice[index]) * 0.95;
                  } else {
                    commision = Number(this.subTotalPrice[index]) * 0.25;
                    unitPrice = Number(this.subTotalPrice[index]) * 0.75;
                  }

                  /*=============================================
								Enviar información de la venta a la base de datos
								=============================================*/

                  const idPayment = localStorage.getItem('id_payment');

                  const body2 = {
                    id_order: resp2['name'],
                    client: this.user.username,
                    product: product.name,
                    url: product.url,
                    quantity: product.quantity,
                    unit_price: unitPrice.toFixed(2),
                    commision: commision.toFixed(2),
                    total: this.subTotalPrice[index],
                    payment_method: f.value.paymentMethod,
                    id_payment: idPayment,
                    date: new Date(),
                    status: 'pending',
                  };

                  this.salesService
                    .registerDatabase(body2, localStorage.getItem('idToken'))
                    .subscribe((resp3) => {});
                }
              });
          });

          /*=============================================
					Preguntamos cuando haya finalizado el proceso de guardar todo en la base de datos
					=============================================*/

          if (totalRender === this.shoppingCart.length) {
            localStorage.removeItem('list');
            Cookies.remove('coupon');

            Sweetalert.fnc(
              'success',
              'The purchase was successful',
              'account/my-shopping'
            );
          }
        } else {
          Sweetalert.fnc(
            'error',
            'The purchase was not made, please try again',
            null
          );
        }
      });
    } else {
      Sweetalert.fnc('error', 'Invalid request', null);

      return;
    }
  }
}
