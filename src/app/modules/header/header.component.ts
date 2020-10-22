import { Component, OnInit } from '@angular/core';
import { Path } from '../../config';
import { Search, DinamicPrice, Sweetalert } from '../../functions';

import { CategoriesService } from '../../services/categories.service';
import { SubCategoriesService } from '../../services/sub-categories.service';
import { ProductsService } from '../../services/products.service';
import { UsersService } from '../../services/users.service';

import { Router } from '@angular/router';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  path: string = Path.url;
  categories: object = null;
  arrayTitleList: any[] = [];
  render = true;
  authValidate = false;
  picture: string;
  wishlist = 0;
  shoppingCart: any[] = [];
  totalShoppingCart = 0;
  renderShopping = true;
  subTotal = `<h3>Sub Total:<strong class="subTotalHeader"><div class="spinner-border"></div></strong></h3>`;

  constructor(
    private categoriesService: CategoriesService,
    private subCategoriesService: SubCategoriesService,
    private productsService: ProductsService,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    /*=============================================
		Validar si existe usuario autenticado
		=============================================*/
    this.usersService.authActivate().then((resp) => {
      if (resp) {
        this.authValidate = true;

        this.usersService
          .getFilterData('idToken', localStorage.getItem('idToken'))
          .subscribe((resp2) => {
            for (const i in resp2) {
              if (resp2.hasOwnProperty(i)) {
                /*=============================================
						Mostramos cantidad de productos en su lista de deseos
						=============================================*/

                if (resp2[i].wishlist !== undefined) {
                  this.wishlist = Number(JSON.parse(resp2[i].wishlist).length);
                }

                /*=============================================
          Mostramos foto del usuario
          =============================================*/

                if (resp2[i].picture !== undefined) {
                  if (resp2[i].method !== 'direct') {
                    this.picture = `<img src="${resp2[i].picture}" class="img-fluid rounded-circle ml-auto">`;
                  } else {
                    this.picture = `<img src="assets/img/users/${resp2[
                      i
                    ].username.toLowerCase()}/${
                      resp2[i].picture
                    }" class="img-fluid rounded-circle ml-auto">`;
                  }
                } else {
                  this.picture = `<i class="icon-user"></i>`;
                }
              }
            }
          });
      }
    });

    /*=============================================
		Obtenemos la data de las categorías
		=============================================*/

    this.categoriesService.getData().subscribe((resp) => {
      this.categories = resp;

      /*=============================================
			Recorremos la colección de categorías para obtener la lista de títulos
			=============================================*/

      for (const i in resp) {
        if (resp.hasOwnProperty(i)) {
          this.arrayTitleList.push(JSON.parse(resp[i].title_list));
        }
      }
    });

    /*=============================================
		Obtenemos la data del Carrito de Compras del LocalStorage
		=============================================*/

    if (localStorage.getItem('list')) {
      const list = JSON.parse(localStorage.getItem('list'));

      this.totalShoppingCart = list.length;

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
                  let details = `<div class="list-details small text-secondary">`;

                  if (list[i].details.length > 0) {
                    const specification = JSON.parse(list[i].details);

                    for (const j in specification) {
                      if (specification.hasOwnProperty(j)) {
                        const property = Object.keys(specification[j]);

                        for (const k in property) {
                          if (property.hasOwnProperty(k)) {
                            details += `<div>${property[k]}: ${
                              specification[i][property[k]]
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

                      for (const l in specification) {
                        if (specification.hasOwnProperty(l)) {
                          const property = Object.keys(
                            specification[l]
                          ).toString();

                          details += `<div>${property}: ${specification[l][property][0]}</div>`;
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
                }
              }
            });
        }
      }
    }
  }

  /*=============================================
	Declaramos función del buscador
	=============================================*/

  goSearch(search: string): any {
    if (search.length === 0 || Search.fnc(search) === undefined) {
      return;
    }

    window.open(`search/${Search.fnc(search)}`, '_top');
  }

  /*=============================================
	Función que nos avisa cuando finaliza el renderizado de Angular
	=============================================*/

  callback(): any {
    if (this.render) {
      this.render = false;
      const arraySubCategories = [];

      /*=============================================
			Hacemos un recorrido por la lista de títulos
			=============================================*/

      this.arrayTitleList.forEach((titleList) => {
        /*=============================================
				Separar individualmente los títulos
        =============================================*/

        titleList.forEach((value, i) => {
          this.subCategoriesService
            .getFilterData('title_list', titleList[i])
            .subscribe((resp) => {
              arraySubCategories.push(resp);

              /*=============================================
						Hacemos un recorrido por la colección general de subcategorias
						=============================================*/

              let f;
              let g;
              const arrayTitleName = [];

              for (f in arraySubCategories) {
                if (arraySubCategories.hasOwnProperty(f)) {
                  for (g in arraySubCategories[f]) {
                    if (arraySubCategories[f].hasOwnProperty(g)) {
                      /*=============================================
                Creamos un nuevo array de objetos clasificando cada subcategoría
                 con la respectiva lista de título a la que pertenece
								=============================================*/

                      arrayTitleName.push({
                        titleList: arraySubCategories[f][g].title_list,
                        subcategory: arraySubCategories[f][g].name,
                        url: arraySubCategories[f][g].url,
                      });
                    }
                  }
                }
              }

              /*=============================================
						Recorremos el array de objetos nuevo para buscar coincidencias con las listas de título
						=============================================*/

              for (f in arrayTitleName) {
                if (titleList[i] === arrayTitleName[f].titleList) {
                  /*=============================================
								Imprimir el nombre de subcategoría debajo de el listado correspondiente
								=============================================*/

                  $(`[titleList='${titleList[i]}']`).append(
                    `<li>
										<a href="products/${arrayTitleName[f].url}">${arrayTitleName[f].subcategory}</a>
									</li>`
                  );
                }
              }
            });
        });
      });
    }
  }

  /*=============================================
	Función que nos avisa cuando finaliza el renderizado de Angular
	=============================================*/

  callbackShopping(): any {
    if (this.renderShopping) {
      this.renderShopping = false;

      /*=============================================
			Sumar valores para el precio total
			=============================================*/

      const totalProduct = $('.ps-product--cart-mobile');

      setTimeout(() => {
        const price = $('.pShoppingHeader .end-price');
        const quantity = $('.qShoppingHeader');
        const shipping = $('.sShoppingHeader');

        let totalPrice = 0;

        for (let i = 0; i < price.length; i++) {
          /*=============================================
					Sumar precio con envío
					=============================================*/

          const shippingPrice =
            Number($(price[i]).html()) + Number($(shipping[i]).html());

          totalPrice += Number($(quantity[i]).html() * shippingPrice);
        }

        $('.subTotalHeader').html(`$${totalPrice.toFixed(2)}`);
      }, totalProduct.length * 500);
    }
  }

  /*=============================================
	Función para borrar productos de la lista de carrito de compras
	=============================================*/

  removeProduct(product, details): any {
    console.log('product', product);

    if (localStorage.getItem('list')) {
      const shoppingCart = JSON.parse(localStorage.getItem('list'));

      shoppingCart.forEach((list, index) => {
        if (list.product === product && list.details == details.toString()) {
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
}
