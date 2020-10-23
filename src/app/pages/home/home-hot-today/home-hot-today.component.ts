import { Component, OnInit } from '@angular/core';
import { Path } from '../../../config';
import {
  OwlCarouselConfig,
  CarouselNavigation,
  SlickConfig,
  ProductLightbox,
  CountDown,
  Rating,
  ProgressBar,
} from '../../../functions';

import { ProductsService } from '../../../services/products.service';
import { SalesService } from '../../../services/sales.service';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-home-hot-today',
  templateUrl: './home-hot-today.component.html',
  styleUrls: ['./home-hot-today.component.css'],
})
export class HomeHotTodayComponent implements OnInit {
  path: string = Path.url;
  indexes: any[] = [];
  products: any[] = [];
  render = true;
  cargando = false;
  topSales: any[] = [];
  topSalesBlock: any[] = [];
  renderBestSeller = true;

  constructor(
    private productsService: ProductsService,
    private salesService: SalesService
  ) {}

  ngOnInit(): void {
    this.cargando = true;

    const getProducts = [];
    const hoy = new Date();
    let fechaOferta = null;

    /*=============================================
		Obtenemos la data de los productos
		=============================================*/

    this.productsService.getData().subscribe((resp) => {
      /*=============================================
			Recorremos cada producto para separar las ofertas y el stock
			=============================================*/

      for (const i in resp) {
        if (resp.hasOwnProperty(i)) {
          getProducts.push({
            offer: JSON.parse(resp[i].offer),
            stock: resp[i].stock,
          });

          this.products.push(resp[i]);
        }
      }

      /*=============================================
			Recorremos cada oferta y stock para clasificar las ofertas actuales y los productos que si tengan stock
			=============================================*/

      for (const i in getProducts) {
        if (getProducts.hasOwnProperty(i)) {
          fechaOferta = new Date(
            parseInt(getProducts[i]['offer'][2].split('-')[0], 10),
            parseInt(getProducts[i]['offer'][2].split('-')[1], 10) - 1,
            parseInt(getProducts[i]['offer'][2].split('-')[2], 10)
          );

          if (hoy < fechaOferta && getProducts[i]['stock'] > 0) {
            this.indexes.push(i);
            this.cargando = false;
          }
        }
      }
    });

    /*=============================================
		Obtenemos la data de las ventas
		=============================================*/

    const getSales = [];

    this.salesService.getData().subscribe((resp) => {
      /*=============================================
			Recorremos cada venta para separar los productos y las cantidades
			=============================================*/

      for (const i in resp) {
        if (resp.hasOwnProperty(i)) {
          getSales.push({
            product: resp[i].product,
            quantity: resp[i].quantity,
          });
        }
      }

      /*=============================================
			Ordenamos de mayor a menor el array de objetos
			=============================================*/

      getSales.sort((a, b) => {
        return b.quantity - a.quantity;
      });

      /*=============================================
			Sacamos los productos repetidos dejando los de mayor venta
			=============================================*/

      const filterSales = [];

      getSales.forEach((sale) => {
        if (!filterSales.find((resp2) => resp2.product == sale.product)) {
          const { product, quantity } = sale;

          filterSales.push({ product, quantity });
        }
      });

      /*=============================================
			Filtramos la data de productos buscando coincidencias con las ventas
			=============================================*/

      let block = 0;

      filterSales.forEach((sale, index) => {
        /*=============================================
				Filtramos hasta 20 ventas
				=============================================*/

        if (index < 20) {
          block++;

          this.productsService
            .getFilterData('name', sale.product)
            .subscribe((resp2) => {
              for (const i in resp2) {
                if (resp2.hasOwnProperty(i)) {
                  this.topSales.push(resp2[i]);
                }
              }
            });
        }
      });

      /*=============================================
			Enviamos el máximo de bloques para mostrar 4 productos por bloque
			=============================================*/

      for (let i = 0; i < Math.ceil(block / 4); i++) {
        this.topSalesBlock.push(i);
      }
    });
  }

  /*=============================================
	Función que nos avisa cuando finaliza el renderizado de Angular
	=============================================*/

  callback(): any {
    if (this.render) {
      this.render = false;

      /*=============================================
			Seleccionar del DOM los elementos de la galería mixta
			=============================================*/

      const galleryMix1 = $('.galleryMix_1');
      const galleryMix2 = $('.galleryMix_2');
      const galleryMix3 = $('.galleryMix_3');

      /*=============================================
			Seleccionar del DOM los elementos de la oferta
			=============================================*/

      const offer1 = $('.offer_1');
      const offer2 = $('.offer_2');
      const offer3 = $('.offer_3');

      /*=============================================
			Seleccionar del DOM los elementos de las reseñas
			=============================================*/

      const review1 = $('.review_1');
      const review2 = $('.review_2');
      const review3 = $('.review_3');

      /*=============================================
			Recorremos todos los índices de productos
			=============================================*/

      for (let i = 0; i < galleryMix1.length; i++) {
        /*=============================================
				Recorremos todos las fotografías de la galería de cada producto
				=============================================*/

        for (
          let f = 0;
          f < JSON.parse($(galleryMix1[i]).attr('gallery')).length;
          f++
        ) {
          /*=============================================
					Agregar imágenes grandes
					=============================================*/

          $(galleryMix2[i]).append(
            `<div class="item">
	                    	<a href="assets/img/products/${$(galleryMix1[i]).attr(
                          'category'
                        )}/gallery/${
              JSON.parse($(galleryMix1[i]).attr('gallery'))[f]
            }">

	                    		<img src="assets/img/products/${$(galleryMix1[i]).attr(
                            'category'
                          )}/gallery/${
              JSON.parse($(galleryMix1[i]).attr('gallery'))[f]
            }">
	                    	</a>
	                    </div>`
          );

          /*=============================================
					Agregar imágenes pequeñas
					=============================================*/

          $(galleryMix3[i]).append(
            `<div class="item">
	                    	<img src="assets/img/products/${$(galleryMix1[i]).attr(
                          'category'
                        )}/gallery/${
              JSON.parse($(galleryMix1[i]).attr('gallery'))[f]
            }">
	                    </div>`
          );
        }

        /*=============================================
				Capturamos el array de ofertas de cada producto
				=============================================*/

        const offer = JSON.parse($(offer1[i]).attr('offer'));

        /*=============================================
				Capturamos el precio de cada producto
				=============================================*/

        const price = Number($(offer1[i]).attr('price'));

        /*=============================================
				Preguntamos si es descuento
				=============================================*/

        if (offer[0] === 'Disccount') {
          $(offer1[i]).html(
            `<span>Save <br> $${((price * offer[1]) / 100).toFixed(2)}</span>`
          );

          $(offer2[i]).html(
            `$${(price - (price * offer[1]) / 100).toFixed(2)}`
          );
        }

        /*=============================================
				Preguntamos si es precio fijo
				=============================================*/

        if (offer[0] === 'Fixed') {
          $(offer1[i]).html(
            `<span>Save <br> $${(price - offer[1]).toFixed(2)}</span>`
          );

          $(offer2[i]).html(`$${offer[1]}`);
        }

        /*=============================================
				Agregamos la fecha al descontador
				=============================================*/

        $(offer3[i]).attr(
          'data-time',

          new Date(
            parseInt(offer[2].split('-')[0], 10),
            parseInt(offer[2].split('-')[1], 10) - 1,
            parseInt(offer[2].split('-')[2], 10)
          )
        );

        /*=============================================
				Calculamos el total de las calificaciones de las reseñas
				=============================================*/

        let totalReview = 0;

        for (
          let f = 0;
          f < JSON.parse($(review1[i]).attr('reviews')).length;
          f++
        ) {
          totalReview += Number(
            JSON.parse($(review1[i]).attr('reviews'))[f]['review']
          );
        }

        /*=============================================
				Imprimimos el total de las calificaciones para cada producto
				=============================================*/

        const rating = Math.round(
          totalReview / JSON.parse($(review1[i]).attr('reviews')).length
        );

        $(review3[i]).html(rating);

        for (let f = 1; f <= 5; f++) {
          $(review2[i]).append(`<option value="2">${f}</option>`);

          if (rating === f) {
            $(review2[i]).children('option').val(1);
          }
        }
      }

      /*=============================================
			Ejecutar funciones globales con respecto a la galería mixta
			=============================================*/

      OwlCarouselConfig.fnc();
      CarouselNavigation.fnc();
      SlickConfig.fnc();
      ProductLightbox.fnc();

      /*=============================================
			Ejecutar funciones globales con respecto a las ofertas
			=============================================*/

      CountDown.fnc();

      /*=============================================
			Ejecutar funciones globales con respecto a las reseñas
			=============================================*/

      Rating.fnc();

      /*=============================================
			Ejecutar funciones globales con respecto al Stock
			=============================================*/

      ProgressBar.fnc();
    }
  }

  /*=============================================
	Función que nos avisa cuando finaliza el renderizado de Angular
	=============================================*/

  callbackBestSeller(topSales): any {
    if (this.renderBestSeller) {
      this.renderBestSeller = false;

      /*=============================================
			Capturamos la cantidad de bloques que existe en el DOM
			=============================================*/
      const topSaleBlock = $('.topSaleBlock');
      const top20Array = [];

      /*=============================================
			Ejecutamos en SetTimeOut - por cada bloque un segundo de espera
			=============================================*/

      setTimeout(() => {
        /*=============================================
				Removemos el preload
				=============================================*/

        $('.preload').remove();

        /*=============================================
				Hacemos un ciclo por la cantidad de bloques
				=============================================*/

        for (let i = 0; i < topSaleBlock.length; i++) {
          /*=============================================
					Agrupamos la cantidad de 4 productos por bloque
					=============================================*/

          top20Array.push(
            topSales.slice(
              i * topSaleBlock.length,
              i * topSaleBlock.length + topSaleBlock.length
            )
          );

          /*=============================================
          Hacemos un recorrido por el nuevo array de objetos y
          Definimos si el precio del producto tiene oferta o no
						=============================================*/
          for (const f in top20Array[i]) {
            if (top20Array[i].hasOwnProperty(f)) {
              let price;
              let type;
              let value;
              let offer;
              let offerDate;
              const today = new Date();

              if (top20Array[i][f].offer !== '') {
                offerDate = new Date(
                  parseInt(JSON.parse(top20Array[i][f].offer)[2].split('-')[0], 10),
                  parseInt(
                    JSON.parse(top20Array[i][f].offer)[2].split('-')[1], 10
                  ) - 1,
                  parseInt(JSON.parse(top20Array[i][f].offer)[2].split('-')[2], 10)
                );

                if (today < offerDate) {
                  type = JSON.parse(top20Array[i][f].offer)[0];
                  value = JSON.parse(top20Array[i][f].offer)[1];

                  if (type === 'Disccount') {
                    offer = (
                      top20Array[i][f].price -
                      (top20Array[i][f].price * value) / 100
                    ).toFixed(2);
                  }

                  if (type === 'Fixed') {
                    offer = value;
                  }

                  price = `<p class="ps-product__price sale">$${offer} <del>$${top20Array[i][f].price} </del></p>`;
                } else {
                  price = `<p class="ps-product__price">$${top20Array[i][f].price} </p>`;
                }
              } else {
                price = `<p class="ps-product__price">$${top20Array[i][f].price} </p>`;
              }

              /*=============================================
              Adicionar a la vista los productos clasificados
              =============================================*/

              $(topSaleBlock[i]).append(`

                 <div class="ps-product--horizontal" style="z-index:10000">

                                  <div class="ps-product__thumbnail">
                                    <a href="product/${top20Array[i][f].url}">
                                      <img src="assets/img/products/${top20Array[i][f].category}/${top20Array[i][f].image}">
                                    </a>
                                  </div>

                                  <div class="ps-product__content">

                                    <a class="ps-product__title" href="product/${top20Array[i][f].url}">${top20Array[i][f].name}</a>

                                      ${price}
                                 </div>

                              </div>

              `);
            }
          }
        }

        /*=============================================
				Modificamos el estilo del plugin OWL Carousel
				=============================================*/
        $('.owl-dots').css({ bottom: '0' });
        $('.owl-dot').css({ background: '#ddd' });
      }, topSaleBlock.length * 1000);
    }
  }
}
