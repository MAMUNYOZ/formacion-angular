import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';
import {
  Rating,
  DinamicRating,
  DinamicReviews,
  DinamicPrice,
  Pagination,
  Select2Cofig,
  Tabs,
} from '../../../functions';

import { ProductsService } from '../../../services/products.service';
import { UsersService } from '../../../services/users.service';

import { ActivatedRoute, Router } from '@angular/router';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-products-showcase',
  templateUrl: './products-showcase.component.html',
  styleUrls: ['./products-showcase.component.css'],
})
export class ProductsShowcaseComponent implements OnInit {
  path: string = Path.url;
  products: any[] = [];
  render = true;
  cargando = false;
  rating: any[] = [];
  reviews: any[] = [];
  price: any[] = [];
  params: string = null;
  page;
  productFound = 0;
  currentRoute: string = null;
  totalPage = 0;
  sort: any;
  sortItems: any[] = [];
  sortValues: any[] = [];

  constructor(
    private productsService: ProductsService,
    private activateRoute: ActivatedRoute,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargando = true;

    /*=============================================
		Capturamos el parámetro URL
		=============================================*/

    this.params = this.activateRoute.snapshot.params['param'].split('&')[0];
    this.sort = this.activateRoute.snapshot.params['param'].split('&')[1];
    this.page = this.activateRoute.snapshot.params['param'].split('&')[2];

    /*=============================================
		Evaluamos que el segundo parámetro sea de paginación
		=============================================*/
    if (Number.isInteger(Number(this.sort))) {
      this.page = this.sort;
      this.sort = undefined;
    }

    /*=============================================
		Evaluamos que el parámetro de orden no esté definido
		=============================================*/

    if (this.sort === undefined) {
      this.currentRoute = `products/${this.params}`;
    } else {
      this.currentRoute = `products/${this.params}&${this.sort}`;
    }

    /*=============================================
		Filtramos data de productos con categorías
		=============================================*/

    this.productsService
      .getFilterData('category', this.params)
      .subscribe((resp1) => {
        if (Object.keys(resp1).length > 0) {
          this.productsFnc(resp1);
        } else {
          /*=============================================
				Filtramos data de subategorías
				=============================================*/

          this.productsService
            .getFilterData('sub_category', this.params)
            .subscribe((resp2) => {
              this.productsFnc(resp2);
            });
        }
      });
  }

  /*=============================================
	Declaramos función para mostrar el catálogo de productos
	=============================================*/

  productsFnc(response): any {
    this.products = [];

    /*=============================================
		Hacemos un recorrido por la respuesta que nos traiga el filtrado
		=============================================*/

    const getProducts = [];
    let total = 0;

    for (const i in response) {
      if (response.hasOwnProperty(i)) {
        total++;
        getProducts.push(response[i]);
      }
    }

    /*=============================================
		Definimos el total de productos y la paginación de productos
		=============================================*/

    this.productFound = total;
    this.totalPage = Math.ceil(Number(this.productFound) / 6);

    /*=============================================
		Ordenamos el arreglo de objetos lo mas actual a lo más antiguo
		=============================================*/
    if (this.sort === undefined || this.sort === 'first') {
      getProducts.sort((a, b) => {
        return b.date_created - a.date_created;
      });

      this.sortItems = [
        'Los más nuevos',
        'Los mas antiguos',
        'Los más populares',
        'Los más baratos',
        'Los más caros',
      ];

      this.sortValues = ['first', 'latest', 'popularity', 'low', 'high'];
    }

    /*=============================================
		Ordenamos el arreglo de objetos lo mas antiguo a lo más actual
		=============================================*/

    if (this.sort === 'latest') {
      getProducts.sort((a, b) => {
        return a.date_created - b.date_created;
      });

      this.sortItems = [
        'Los más antiguos',
        'Los más nuevos',
        'Los más populares',
        'Los más baratos',
        'Los más caros',
      ];

      this.sortValues = ['latest', 'first', 'popularity', 'low', 'high'];
    }

    /*=============================================
		Ordenamos el arreglo de objetos lo mas visto
		=============================================*/

    if (this.sort === 'popularity') {
      getProducts.sort((a, b) => {
        return b.views - a.views;
      });

      this.sortItems = [
        'Los más populares',
        'Los más nuevos',
        'Los más antiguos',
        'Los más baratos',
        'Los más caros',
      ];

      this.sortValues = ['popularity', 'first', 'latest', 'low', 'high'];
    }

    /*=============================================
		Ordenamos el arreglo de objetos de menor a mayor precio
		=============================================*/

    if (this.sort === 'low') {
      getProducts.sort((a, b) => {
        return a.price - b.price;
      });

      this.sortItems = [
        'Los más baratos',
        'Los más nuevos',
        'Los mas antiguos',
        'Los más populares',
        'Los más caros',
      ];

      this.sortValues = ['low', 'first', 'latest', 'popularity', 'high'];
    }

    /*=============================================
		Ordenamos el arreglo de objetos de mayor a menor precio
		=============================================*/

    if (this.sort === 'high') {
      getProducts.sort((a, b) => {
        return b.price - a.price;
      });

      this.sortItems = [
        'Los más caros',
        'Los más nuevos',
        'Los mas antiguos',
        'Los más populares',
        'Los más baratos',
      ];

      this.sortValues = ['high', 'first', 'latest', 'popularity', 'low'];
    }

    /*=============================================
		Filtramos solo hasta 10 productos
		=============================================*/

    getProducts.forEach((product, index) => {
      /*=============================================
			Evaluamos si viene número de página definida
			=============================================*/

      if (this.page === undefined) {
        this.page = 1;
      }

      /*=============================================
			Configuramos la paginación desde - hasta
			=============================================*/

      const first = Number(index) + this.page * 6 - 6;
      const last = 6 * this.page;

      /*=============================================
			Filtramos los productos a mostrar
			=============================================*/

      if (first < last) {
        if (getProducts[first] !== undefined) {
          this.products.push(getProducts[first]);

          this.rating.push(DinamicRating.fnc(getProducts[first]));

          this.reviews.push(DinamicReviews.fnc(this.rating[index]));

          this.price.push(DinamicPrice.fnc(getProducts[first]));

          this.cargando = false;
        }
      }
    });
  }

  /*=============================================
	Función que nos avisa cuando finaliza el renderizado de Angular
	=============================================*/

  callback(params): any {
    if (this.render) {
      this.render = false;

      Rating.fnc();
      Pagination.fnc();
      Select2Cofig.fnc();
      Tabs.fnc();

      /*=============================================
			Captura del Select Sort Items
			=============================================*/

      $('.sortItems').change(function(): any {
        window.open(`products/${params}&${$(this).val()}`, '_top');
      });
    }
  }

  /*=============================================
	Función para agregar productos a la lista de deseos
	=============================================*/

  addWishlist(product): any {
    this.usersService.addWishlist(product);
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
