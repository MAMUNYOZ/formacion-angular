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
  selector: 'app-header-mobile',
  templateUrl: './header-mobile.component.html',
  styleUrls: ['./header-mobile.component.css'],
})
export class HeaderMobileComponent implements OnInit {
  path: string = Path.url;
  categories: object = null;
  render = true;
  categoriesList: any[] = [];
  authValidate = false;
  picture: string;
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
          });
      }
    });

    /*=============================================
		Obtenemos la data de las categorías
		=============================================*/

    this.categoriesService.getData().subscribe((resp) => {
      this.categories = resp;

      /*=============================================
			Recorrido la data de categorías
			=============================================*/

      for (const i in resp) {
        if (resp.hasOwnProperty(i)) {
          this.categoriesList.push(resp[i].name);
        }
      }
    });

    /*=============================================
		Activamos el efecto toggle en el listado de subcategorías
		=============================================*/

    $(document).on('click', '.sub-toggle', function(): any {
      $(this).parent().children('ul').toggle();
    });

    /*=============================================
		Obtenemos la data del Carrito de Compras del LocalStorage
		=============================================*/

    if (localStorage.getItem('list')) {
      const list = JSON.parse(localStorage.getItem('list'));

      this.totalShoppingCart = list.length;

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
                      if (specification.hasOwnPropety(i)) {
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

                      for (const j in specification) {
                        if (specification.hasOwnProperty(j)) {
                          const property = Object.keys(
                            specification[j]
                          ).toString();

                          details += `<div>${property}: ${specification[j][property][0]}</div>`;
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
			Separar las categorías
			=============================================*/

      this.categoriesList.forEach((category) => {
        /*=============================================
				Obtenemos la colección de las sub-categorías filtrando con los nombres de categoría
				=============================================*/

        this.subCategoriesService
          .getFilterData('category', category)
          .subscribe((resp) => {
            /*=============================================
					Hacemos un recorrido por la colección general de subcategorias y clasificamos
					las subcategorias y url de acuerdo a la categoría que correspondan
					=============================================*/

            for (const i in resp) {
              if (resp.hasOwnProperty(i)) {
                arraySubCategories.push({
                  category: resp[i].category,
                  subcategory: resp[i].name,
                  url: resp[i].url,
                });
              }
            }

            /*=============================================
					Recorremos el array de objetos nuevo para buscar coincidencias con los nombres de categorías
					=============================================*/

            for (const i in arraySubCategories) {
              if (category === arraySubCategories[i].category) {
                $(`[category='${category}']`).append(
                  `<li class="current-menu-item ">
		                        	<a href="products/${arraySubCategories[i].url}">${arraySubCategories[i].subcategory}</a>
		                        </li>`
                );
              }
            }
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
        const price = $('.pShoppingHeaderM .end-price');
        const quantity = $('.qShoppingHeaderM');
        const shipping = $('.sShoppingHeaderM');

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
