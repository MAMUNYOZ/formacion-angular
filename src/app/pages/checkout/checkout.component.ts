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
  saveAddress: boolean = false;
  countries: any = null;
  dialCode: string = null;
  shoppingCart: any[] = [];
  totalShoppingCart: number = 0;
  render: boolean = true;
  totalP: string = ` <h3 class="text-right">Total <span class="totalCheckout"><div class="spinner-border"></div></span></h3>`;
  totalPrice: any[] = [];
  subTotalPrice: any[] = [];
  paymentMethod: string = '';
  addInfo: string = '';
  validateCoupon: boolean = false;

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
    if (Cookies.get('coupon') != undefined) {
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
          .subscribe((resp) => {
            this.id = Object.keys(resp).toString();

            for (const i in resp) {
              this.user.displayName = resp[i].displayName;
              this.user.username = resp[i].username;
              this.user.email = resp[i].email;
              this.user.country = resp[i].country;
              this.user.city = resp[i].city;

              if (resp[i].phone != undefined) {
                this.user.phone = resp[i].phone.split('-')[1];
                this.dialCode = resp[i].phone.split('-')[0];
              }

              this.user.address = resp[i].address;

              /*=============================================
						Traer listado de países
						=============================================*/

              this.usersService.getCountries().subscribe((resp) => {
                this.countries = resp;
              });
            }
          });
      }
    });

    /*=============================================
		Traer la lista del carrito de compras
		=============================================*/

    if (localStorage.getItem('list')) {
      let list = JSON.parse(localStorage.getItem('list'));

      this.totalShoppingCart = list.length;

      if (list.length == 0) {
        this.router.navigateByUrl('/shopping-cart');

        return;
      }

      /*=============================================
			Recorremos el arreglo del listado
			=============================================*/

      for (const i in list) {
        /*=============================================
				Filtramos los productos del carrito de compras
				=============================================*/

        this.productsService
          .getFilterData('url', list[i].product)
          .subscribe((resp) => {
            for (const f in resp) {
              let details = `<div class="list-details small text-secondary">`;

              if (list[i].details.length > 0) {
                let specification = JSON.parse(list[i].details);

                for (const i in specification) {
                  let property = Object.keys(specification[i]);

                  for (const f in property) {
                    details += `<div>${property[f]}: ${
                      specification[i][property[f]]
                    }</div>`;
                  }
                }
              } else {
                /*=============================================
							Mostrar los detalles por defecto del producto 
							=============================================*/

                if (resp[f].specification != '') {
                  let specification = JSON.parse(resp[f].specification);

                  for (const i in specification) {
                    let property = Object.keys(specification[i]).toString();

                    details += `<div>${property}: ${specification[i][property][0]}</div>`;
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
          });
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
  ) {
    if (this.saveAddress) {
      if (
        inputCountry.value != '' &&
        inputCity.value != '' &&
        inputPhone.value != '' &&
        inputAddress.value != ''
      ) {
        let body = {
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
	Agregar código dial al input telefónico
	=============================================*/

  changeCountry(inputCountry) {
    this.countries.forEach((country) => {
      if (inputCountry.value == country.name) {
        this.dialCode = country.dial_code;
        this.user.countryCode = country.code;
      }
    });
  }

  /*=============================================
	Función Callback()
	=============================================*/

  callback() {
    if (this.render) {
      this.render = false;

      let totalShoppingCart = this.totalShoppingCart;
      let localTotalPrice = this.totalPrice;
      let localSubTotalPrice = this.subTotalPrice;
      let localActivatedRoute = this.activatedRoute;
      let localShoppingCart = this.shoppingCart;
      let localProductsService = this.productsService;
      let localUser = this.user;
      let localDialCode = this.dialCode;
      let localAddInfo = this.addInfo;
      let localOrdersService = this.ordersService;
      let localValidateCoupon = this.validateCoupon;
      let localPaymentMethod = this.paymentMethod;
      let localSalesService = this.salesService;

      /*=============================================
			Mostrar lista del carrito de compras con los precios definitivos
			=============================================*/

      setTimeout(function () {
        let price = $('.pCheckout .end-price');
        let quantity = $('.qCheckout');
        let shipping = $('.sCheckout');
        let subTotalPrice = $('.subTotalPriceCheckout');

        let total = 0;

        for (let i = 0; i < price.length; i++) {
          /*=============================================
					Sumar precio con envío
					=============================================*/
          let shipping_price =
            Number($(price[i]).html()) + Number($(shipping[i]).html());

          /*=============================================
					Multiplicar cantidad por precio con envío
					=============================================*/

          let subTotal = Number($(quantity[i]).html()) * shipping_price;

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

        /*=============================================
				Validar la compra de PAYU
				=============================================*/

        if (localActivatedRoute.snapshot.queryParams['transactionState'] == 4) {
          let totalRender = 0;

          /*=============================================
					Tomamos la información de la venta
					=============================================*/

          localShoppingCart.forEach((product, index) => {
            totalRender++;

            /*=============================================
						Enviar actualización de cantidad de producto vendido a la base de datos
						=============================================*/

            localProductsService
              .getFilterData('url', product.url)
              .subscribe((resp) => {
                for (const i in resp) {
                  let id = Object.keys(resp).toString();

                  let value = {
                    sales: Number(resp[i].sales) + Number(product.quantity),
                  };

                  localProductsService
                    .patchDataAuth(id, value, localStorage.getItem('idToken'))
                    .subscribe((resp) => {});
                }
              });

            /*=============================================
						Crear el proceso de entrega de la venta
						=============================================*/

            let moment = Math.floor(Number(product.delivery_time) / 2);

            let sentDate = new Date();
            sentDate.setDate(sentDate.getDate() + moment);

            let deliveredDate = new Date();
            deliveredDate.setDate(
              deliveredDate.getDate() + Number(product.delivery_time)
            );

            let proccess = [
              {
                stage: 'reviewed',
                status: 'ok',
                comment:
                  'We have received your order, we start delivery process',
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

            let body = {
              store: product.store,
              user: localUser.username,
              product: product.name,
              url: product.url,
              image: product.image,
              category: product.category,
              details: product.details,
              quantity: product.quantity,
              price: localSubTotalPrice[index],
              email: localUser.email,
              country: localUser.country,
              city: localUser.city,
              phone: `${localDialCode}-${localUser.phone}`,
              address: localUser.address,
              info: localAddInfo,
              process: JSON.stringify(proccess),
              status: 'pending',
            };

            localOrdersService
              .registerDatabase(body, localStorage.getItem('idToken'))
              .subscribe((resp) => {
                if (resp['name'] != '') {
                  /*=============================================
								Separamos la comisión del Marketplace y el pago a la tienda del precio total de cada producto
								=============================================*/

                  let commision = 0;
                  let unitPrice = 0;

                  if (localValidateCoupon) {
                    commision = Number(localSubTotalPrice[index]) * 0.05;
                    unitPrice = Number(localSubTotalPrice[index]) * 0.95;
                  } else {
                    commision = Number(localSubTotalPrice[index]) * 0.25;
                    unitPrice = Number(localSubTotalPrice[index]) * 0.75;
                  }

                  /*=============================================
								Enviar información de la venta a la base de datos
								=============================================*/

                  let body = {
                    id_order: resp['name'],
                    client: localUser.username,
                    product: product.name,
                    url: product.url,
                    quantity: product.quantity,
                    unit_price: unitPrice.toFixed(2),
                    commision: commision.toFixed(2),
                    total: localSubTotalPrice[index],
                    payment_method: 'Payu',
                    id_payment:
                      localActivatedRoute.snapshot.queryParams['transactionId'],
                    date: new Date(),
                    status: 'pending',
                  };

                  localSalesService
                    .registerDatabase(body, localStorage.getItem('idToken'))
                    .subscribe((resp) => {});
                }
              });
          });

          /*=============================================
					Preguntamos cuando haya finalizado el proceso de guardar todo en la base de datos
					=============================================*/

          if (totalRender == localShoppingCart.length) {
            localStorage.removeItem('list');
            Cookies.remove('coupon');

            Sweetalert.fnc(
              'success',
              'The purchase was successful',
              'account/my-shopping'
            );
          }
        }
      }, totalShoppingCart * 500);
    }
  }

  /*=============================================
  	Envío del formulario checkout
  	=============================================*/

  onSubmit(f: NgForm) {
    /*=============================================
  		Validamos formulario para evitar campos vacíos
  		=============================================*/

    if (f.invalid) {
      Sweetalert.fnc('error', 'Invalid Request', null);

      return;
    }

    /*=============================================
  		Sweetalert para esperar el proceso de ejecución
  		=============================================*/

    Sweetalert.fnc('loading', 'Loading...', null);

    /*=============================================
  		Pasarelas de pago
  		=============================================*/

    if (f.value.paymentMethod == 'paypal') {
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
              .subscribe((resp) => {
                for (const i in resp) {
                  let id = Object.keys(resp).toString();

                  let value = {
                    sales: Number(resp[i].sales) + Number(product.quantity),
                  };

                  this.productsService
                    .patchDataAuth(id, value, localStorage.getItem('idToken'))
                    .subscribe((resp) => {});
                }
              });

            /*=============================================
						Crear el proceso de entrega de la venta
						=============================================*/

            let moment = Math.floor(Number(product.delivery_time) / 2);

            let sentDate = new Date();
            sentDate.setDate(sentDate.getDate() + moment);

            let deliveredDate = new Date();
            deliveredDate.setDate(
              deliveredDate.getDate() + Number(product.delivery_time)
            );

            let proccess = [
              {
                stage: 'reviewed',
                status: 'ok',
                comment:
                  'We have received your order, we start delivery process',
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

            let body = {
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
              .subscribe((resp) => {
                if (resp['name'] != '') {
                  /*=============================================
								Separamos la comisión del Marketplace y el pago a la tienda del precio total de cada producto
								=============================================*/

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

                  let id_payment = localStorage.getItem('id_payment');

                  let body = {
                    id_order: resp['name'],
                    client: this.user.username,
                    product: product.name,
                    url: product.url,
                    quantity: product.quantity,
                    unit_price: unitPrice.toFixed(2),
                    commision: commision.toFixed(2),
                    total: this.subTotalPrice[index],
                    payment_method: f.value.paymentMethod,
                    id_payment: id_payment,
                    date: new Date(),
                    status: 'pending',
                  };

                  this.salesService
                    .registerDatabase(body, localStorage.getItem('idToken'))
                    .subscribe((resp) => {});
                }
              });
          });

          /*=============================================
					Preguntamos cuando haya finalizado el proceso de guardar todo en la base de datos
					=============================================*/

          if (totalRender == this.shoppingCart.length) {
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
    } else if (f.value.paymentMethod == 'payu') {
      /*=============================================
			Checkout con Payu
			=============================================*/

      let action = Payu.action;
      let merchantId = Payu.merchantId;
      let accountId = Payu.accountId;
      let responseUrl = Payu.responseUrl;
      let confirmationUrl = Payu.confirmationUrl;
      let apiKey = Payu.apiKey;
      let test = Payu.test;

      /*=============================================
			Capturar la descripción
			=============================================*/

      let description = '';

      this.shoppingCart.forEach((product) => {
        description += `${product.name} x${product.quantity}, `;
      });

      description = description.slice(0, -2);

      /*=============================================
			Creamos el código de referencia
			=============================================*/

      let referenceCode = Math.ceil(Math.random() * 1000000);

      /*=============================================
			Creamos la firma de Payu
			=============================================*/

      let signature = Md5.init(
        `${apiKey}~${merchantId}~${referenceCode}~${this.totalPrice[0]}~USD`
      );

      /*=============================================
			Formulario web checkout de Payu
			=============================================*/

      let formPayu = `

				<img src="assets/img/payment-method/payu_logo.png" style="width:100px" />

				 <form method="post" action="${action}">
				  <input name="merchantId"    type="hidden"  value="${merchantId}"   >
				  <input name="accountId"     type="hidden"  value="${accountId}" >
				  <input name="description"   type="hidden"  value="${description}"  >
				  <input name="referenceCode" type="hidden"  value="${referenceCode}" >
				  <input name="amount"        type="hidden"  value="${this.totalPrice[0]}"   >
				  <input name="tax"           type="hidden"  value="0"  >
				  <input name="taxReturnBase" type="hidden"  value="0" >
				  <input name="currency"      type="hidden"  value="USD" >
				  <input name="signature"     type="hidden"  value="${signature}"  >
				  <input name="test"          type="hidden"  value="${test}" >
				  <input name="buyerEmail"    type="hidden"  value="${this.user.email}" >
				  <input name="responseUrl"    type="hidden"  value="${responseUrl}" >
				  <input name="confirmationUrl"    type="hidden"  value="${confirmationUrl}" >
				  <input name="Submit" type="submit" class="ps-btn p-0 px-5"  value="Next" >
				</form>`;

      /*=============================================
			Listado de tarjetas de crédito
			=============================================*/

      //https://www.mercadopago.com.co/developers/es/guides/payments/web-tokenize-checkout/testing/

      /*=============================================
			Sacar el botón de Payu en una alerta suave
			=============================================*/

      Sweetalert.fnc('html', formPayu, null);
    } else if (f.value.paymentMethod == 'mercado-pago') {
      /*=============================================
			Checkout con Mercado Pago
			=============================================*/

      let formMP = `<img src="assets/img/payment-method/mp_logo.png" style="width:100px" />
						  <div><a class="ps-btn p-0 px-5 popupMP">Next</a></div>`;

      /*=============================================
			Sacar el botón de MercadoPago en una alerta suave
			=============================================*/

      Sweetalert.fnc('html', formMP, null);

      /*=============================================
			Abrir ventana emergente de MP
			=============================================*/

      let localTotalPrice = this.totalPrice[0].toString();

      /*=============================================
			Capturar la descripción
			=============================================*/

      let description = '';

      this.shoppingCart.forEach((product) => {
        description += `${product.name} x${product.quantity}, `;
      });

      description = description.slice(0, -2);

      /*=============================================
			Capturar el email
			=============================================*/

      let email = this.user.email;

      $(document).on('click', '.popupMP', function () {
        Cookies.set('_x', window.btoa(localTotalPrice), { expires: 1 });
        Cookies.set('_p', description, { expires: 1 });
        Cookies.set('_e', email, { expires: 1 });

        window.open(
          `http://localhost/marketplace-checkout/src/mercadopago/index.php?_x=${Md5.init(
            localTotalPrice
          )}`,
          '_blank',
          'width=950,height=650,scrollbars=NO'
        );
      });

      /*=============================================
			Validar la compra de Mercado Pago
			=============================================*/

      let count = 0;

      /*=============================================
			Convertir variables globales en locales
			=============================================*/

      let localSubTotalPrice = this.subTotalPrice;
      let localShoppingCart = this.shoppingCart;
      let localProductsService = this.productsService;
      let localUser = this.user;
      let localDialCode = this.dialCode;
      let localAddInfo = this.addInfo;
      let localOrdersService = this.ordersService;
      let localValidateCoupon = this.validateCoupon;
      let localPaymentMethod = this.paymentMethod;
      let localSalesService = this.salesService;

      let interval = setInterval(function () {
        count++;
        console.log('count', count);

        /*=============================================
				Validar la compra de Mercado Pago
				=============================================*/

        if (
          Cookies.get('_i') != undefined &&
          Cookies.get('_k') != undefined &&
          Cookies.get('_a') != undefined &&
          Cookies.get('_k') == MercadoPago.public_key &&
          Cookies.get('_a') == MercadoPago.access_token
        ) {
          let totalRender = 0;

          /*=============================================
					Tomamos la información de la venta
					=============================================*/

          localShoppingCart.forEach((product, index) => {
            totalRender++;

            /*=============================================
						Enviar actualización de cantidad de producto vendido a la base de datos
						=============================================*/

            localProductsService
              .getFilterData('url', product.url)
              .subscribe((resp) => {
                for (const i in resp) {
                  let id = Object.keys(resp).toString();

                  let value = {
                    sales: Number(resp[i].sales) + Number(product.quantity),
                  };

                  localProductsService
                    .patchDataAuth(id, value, localStorage.getItem('idToken'))
                    .subscribe((resp) => {});
                }
              });

            /*=============================================
						Crear el proceso de entrega de la venta
						=============================================*/

            let moment = Math.floor(Number(product.delivery_time) / 2);

            let sentDate = new Date();
            sentDate.setDate(sentDate.getDate() + moment);

            let deliveredDate = new Date();
            deliveredDate.setDate(
              deliveredDate.getDate() + Number(product.delivery_time)
            );

            let proccess = [
              {
                stage: 'reviewed',
                status: 'ok',
                comment:
                  'We have received your order, we start delivery process',
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

            let body = {
              store: product.store,
              user: localUser.username,
              product: product.name,
              url: product.url,
              image: product.image,
              category: product.category,
              details: product.details,
              quantity: product.quantity,
              price: localSubTotalPrice[index],
              email: localUser.email,
              country: localUser.country,
              city: localUser.city,
              phone: `${localDialCode}-${localUser.phone}`,
              address: localUser.address,
              info: localAddInfo,
              process: JSON.stringify(proccess),
              status: 'pending',
            };

            localOrdersService
              .registerDatabase(body, localStorage.getItem('idToken'))
              .subscribe((resp) => {
                if (resp['name'] != '') {
                  /*=============================================
								Separamos la comisión del Marketplace y el pago a la tienda del precio total de cada producto
								=============================================*/

                  let commision = 0;
                  let unitPrice = 0;

                  if (localValidateCoupon) {
                    commision = Number(localSubTotalPrice[index]) * 0.05;
                    unitPrice = Number(localSubTotalPrice[index]) * 0.95;
                  } else {
                    commision = Number(localSubTotalPrice[index]) * 0.25;
                    unitPrice = Number(localSubTotalPrice[index]) * 0.75;
                  }

                  /*=============================================
								Enviar información de la venta a la base de datos
								=============================================*/

                  let id_payment = Cookies.get('_i');

                  let body = {
                    id_order: resp['name'],
                    client: localUser.username,
                    product: product.name,
                    url: product.url,
                    quantity: product.quantity,
                    unit_price: unitPrice.toFixed(2),
                    commision: commision.toFixed(2),
                    total: localSubTotalPrice[index],
                    payment_method: 'Mercado Pago',
                    id_payment: id_payment,
                    date: new Date(),
                    status: 'pending',
                  };

                  localSalesService
                    .registerDatabase(body, localStorage.getItem('idToken'))
                    .subscribe((resp) => {});
                }
              });
          });

          /*=============================================
					Preguntamos cuando haya finalizado el proceso de guardar todo en la base de datos
					=============================================*/

          if (totalRender == localShoppingCart.length) {
            clearInterval(interval);
            Cookies.remove('_a');
            Cookies.remove('_k');

            localStorage.removeItem('list');
            Cookies.remove('coupon');

            Sweetalert.fnc(
              'success',
              'The purchase was successful',
              'account/my-shopping'
            );
          }
        }
      }, 1000);

      /*=============================================
			Detenemos el intervalo
			=============================================*/

      if (count > 300) {
        clearInterval(interval);
        window.open('account', '_parent');
      }
    } else {
      Sweetalert.fnc('error', 'Invalid request', null);

      return;
    }
  }
}
