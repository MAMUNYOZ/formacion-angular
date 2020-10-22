import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Api,
  Register,
  Login,
  SendEmailVerification,
  ConfirmEmailVerification,
  GetUserData,
  SendPasswordResetEmail,
  VerifyPasswordResetCode,
  ConfirmPasswordReset,
  ChangePassword,
} from '../config';

import { UsersModel } from '../models/users.model';
import { ProductsService } from '../services/products.service';

import { Sweetalert } from '../functions';

declare var jQuery: any;
declare var $: any;

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private api: string = Api.url;
  private register: string = Register.url;
  private login: string = Login.url;
  private sendEmailVerification: string = SendEmailVerification.url;
  private confirmEmailVerification: string = ConfirmEmailVerification.url;
  private getUserData: string = GetUserData.url;
  private sendPasswordResetEmail: string = SendPasswordResetEmail.url;
  private verifyPasswordResetCode: string = VerifyPasswordResetCode.url;
  private confirmPasswordReset: string = ConfirmPasswordReset.url;
  private changePassword: string = ChangePassword.url;

  constructor(
    private http: HttpClient,
    private productsService: ProductsService
  ) {}

  /*=============================================
	Registro en Firebase Authentication
	=============================================*/

  registerAuth(user: UsersModel) {
    return this.http.post(`${this.register}`, user);
  }

  /*=============================================
	Registro en Firebase Database
	=============================================*/

  registerDatabase(user: UsersModel) {
    delete user.firstName;
    delete user.lastName;
    delete user.password;
    delete user.returnSecureToken;

    return this.http.post(`${this.api}/users.json`, user);
  }

  /*=============================================
  	Filtrar data para buscar coincidencias
  	=============================================*/

  getFilterData(orderBy: string, equalTo: string) {
    return this.http.get(
      `${this.api}users.json?orderBy="${orderBy}"&equalTo="${equalTo}"&print=pretty`
    );
  }

  /*=============================================
  	Login en Firebase Authentication
  	=============================================*/

  loginAuth(user: UsersModel) {
    return this.http.post(`${this.login}`, user);
  }

  /*=============================================
  	Enviar verificación de correo electrónico
  	=============================================*/

  sendEmailVerificationFnc(body: object) {
    return this.http.post(`${this.sendEmailVerification}`, body);
  }

  /*=============================================
  	Confirmar email de verificación
  	=============================================*/

  confirmEmailVerificationFnc(body: object) {
    return this.http.post(`${this.confirmEmailVerification}`, body);
  }

  /*=============================================
  	Actualizar data de usuario
  	=============================================*/

  patchData(id: string, value: object) {
    return this.http.patch(`${this.api}users/${id}.json`, value);
  }

  /*=============================================
  	Validar idToken de Autenticación
  	=============================================*/

  authActivate() {
    return new Promise((resolve) => {
      /*=============================================
	  		Validamos que el idToken sea real
	  		=============================================*/

      if (localStorage.getItem('idToken')) {
        let body = {
          idToken: localStorage.getItem('idToken'),
        };

        this.http.post(`${this.getUserData}`, body).subscribe(
          (resp) => {
            /*=============================================
	  				Validamos fecha de expiración
	  				=============================================*/

            if (localStorage.getItem('expiresIn')) {
              let expiresIn = Number(localStorage.getItem('expiresIn'));

              let expiresDate = new Date();
              expiresDate.setTime(expiresIn);

              if (expiresDate > new Date()) {
                resolve(true);
              } else {
                localStorage.removeItem('idToken');
                localStorage.removeItem('expiresIn');
                resolve(false);
              }
            } else {
              localStorage.removeItem('idToken');
              localStorage.removeItem('expiresIn');
              resolve(false);
            }
          },
          (err) => {
            localStorage.removeItem('idToken');
            localStorage.removeItem('expiresIn');
            resolve(false);
          }
        );
      } else {
        localStorage.removeItem('idToken');
        localStorage.removeItem('expiresIn');
        resolve(false);
      }
    });
  }

  /*=============================================
	Resetear la contraseña
	=============================================*/

  sendPasswordResetEmailFnc(body: object) {
    return this.http.post(`${this.sendPasswordResetEmail}`, body);
  }

  /*=============================================
	Confirmar el cambio de la contraseña
	=============================================*/

  verifyPasswordResetCodeFnc(body: object) {
    return this.http.post(`${this.verifyPasswordResetCode}`, body);
  }

  /*=============================================
	Enviar la contraseña
	=============================================*/

  confirmPasswordResetFnc(body: object) {
    return this.http.post(`${this.confirmPasswordReset}`, body);
  }

  /*=============================================
	Cambiar la contraseña
	=============================================*/

  changePasswordFnc(body: object) {
    return this.http.post(`${this.changePassword}`, body);
  }

  /*=============================================
	Tomar información de un solo usuario
	=============================================*/

  getUniqueData(value: string) {
    return this.http.get(`${this.api}users/${value}.json`);
  }

  /*=============================================
	Función para agregar productos a la lista de deseos
	=============================================*/

  addWishlist(product: string) {
    /*=============================================
    	Validamos que el usuario esté autenticado
    	=============================================*/

    this.authActivate().then((resp) => {
      if (!resp) {
        Sweetalert.fnc('error', 'The user must be logged in', null);

        return;
      } else {
        /*=============================================
    		Traemos la lista de deseos que ya tenga el usuario
    		=============================================*/
        this.getFilterData(
          'idToken',
          localStorage.getItem('idToken')
        ).subscribe((resp) => {
          /*=============================================
    			Capturamos el id del usuario
    			=============================================*/

          let id = Object.keys(resp).toString();

          for (const i in resp) {
            /*=============================================
      				Pregutnamos si existe una lista de deseos
      				=============================================*/

            if (resp[i].wishlist != undefined) {
              let wishlist = JSON.parse(resp[i].wishlist);

              let length = 0;

              /*=============================================
      					Pregutnamos si existe un producto en la lista de deseos
      					=============================================*/

              if (wishlist.length > 0) {
                wishlist.forEach((list, index) => {
                  if (list == product) {
                    length--;
                  } else {
                    length++;
                  }
                });

                /*=============================================
    						Preguntamos si no ha agregado este producto a la lista de deseos anteriormente
        					=============================================*/

                if (length != wishlist.length) {
                  Sweetalert.fnc(
                    'error',
                    'It already exists on your wishlist',
                    null
                  );
                } else {
                  wishlist.push(product);

                  let body = {
                    wishlist: JSON.stringify(wishlist),
                  };

                  this.patchData(id, body).subscribe((resp) => {
                    if (resp['wishlist'] != '') {
                      let totalWishlist = Number($('.totalWishlist').html());

                      $('.totalWishlist').html(totalWishlist + 1);

                      Sweetalert.fnc(
                        'success',
                        'Product added to wishlist',
                        null
                      );
                    }
                  });
                }
              } else {
                wishlist.push(product);

                let body = {
                  wishlist: JSON.stringify(wishlist),
                };

                this.patchData(id, body).subscribe((resp) => {
                  if (resp['wishlist'] != '') {
                    let totalWishlist = Number($('.totalWishlist').html());

                    $('.totalWishlist').html(totalWishlist + 1);

                    Sweetalert.fnc(
                      'success',
                      'Product added to wishlist',
                      null
                    );
                  }
                });
              }

              /*=============================================
     				Cuando no exista lista de deseos inicialmente
      				=============================================*/
            } else {
              let body = {
                wishlist: `["${product}"]`,
              };

              this.patchData(id, body).subscribe((resp) => {
                if (resp['wishlist'] != '') {
                  let totalWishlist = Number($('.totalWishlist').html());

                  $('.totalWishlist').html(totalWishlist + 1);

                  Sweetalert.fnc('success', 'Product added to wishlist', null);
                }
              });
            }
          }
        });
      }
    });
  }

  /*=============================================
    Función para agregar productos al carrito de compras
    =============================================*/

  addSoppingCart(item: object) {
    /*=============================================
        Filtramos el producto en la data
        =============================================*/

    this.productsService
      .getFilterData('url', item['product'])
      .subscribe((resp) => {
        /*=============================================
            Recorremos el producto para encontrar su información
            =============================================*/

        for (const i in resp) {
          /*=============================================
                Preguntamos primero que el producto tenga stock
                =============================================*/

          if (resp[i]['stock'] == 0) {
            Sweetalert.fnc('error', 'Out of Stock', null);

            return;
          }

          /*=============================================
                Preguntamos si el item detalles viene vacío
                =============================================*/

          if (item['details'].length == 0) {
            if (resp[i].specification != '') {
              let specification = JSON.parse(resp[i].specification);

              item['details'] = `[{`;

              for (const i in specification) {
                let property = Object.keys(specification[i]).toString();

                item[
                  'details'
                ] += `"${property}":"${specification[i][property][0]}",`;
              }

              item['details'] = item['details'].slice(0, -1);

              item['details'] += `}]`;
            }
          }
        }
      });

    /*=============================================
        Agregamos al LocalStorage la variable listado carrito de compras
        =============================================*/

    if (localStorage.getItem('list')) {
      let arrayList = JSON.parse(localStorage.getItem('list'));

      /*=============================================
            Preguntar si el producto se repite
            =============================================*/

      let count = 0;
      let index;

      for (const i in arrayList) {
        if (
          arrayList[i].product == item['product'] &&
          arrayList[i].details.toString() == item['details'].toString()
        ) {
          count--;
          index = i;
        } else {
          count++;
        }
      }

      /*=============================================
            Validamos si el producto se repite
            =============================================*/

      if (count == arrayList.length) {
        arrayList.push(item);
      } else {
        arrayList[index].unit += item['unit'];
      }

      localStorage.setItem('list', JSON.stringify(arrayList));

      Sweetalert.fnc('success', 'Product added to Shopping Cart', item['url']);
    } else {
      let arrayList = [];

      arrayList.push(item);

      localStorage.setItem('list', JSON.stringify(arrayList));

      Sweetalert.fnc('success', 'Product added to Shopping Cart', item['url']);
    }
  }

  /*=============================================
    Función para tomar la lista de países
    =============================================*/

  getCountries() {
    return this.http.get('./assets/json/countries.json');
  }
}
