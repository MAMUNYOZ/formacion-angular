import { Component, OnInit } from '@angular/core';
import { Path } from '../../config';

declare var jQuery: any;
declare var $: any;

import { CategoriesService } from '../../services/categories.service';
import { SubCategoriesService } from '../../services/sub-categories.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  path: string = Path.url;
  categories: object = null;
  render = true;
  categoriesList: any[] = [];

  constructor(
    private categoriesService: CategoriesService,
    private subCategoriesService: SubCategoriesService
  ) {}

  ngOnInit(): void {
    /*=============================================
		Obtenemos la data de las categorías
		=============================================*/

    this.categoriesService.getData().subscribe((resp) => {
      this.categories = resp;

      /*=============================================
				Separamos los nombres de categorías
				=============================================*/
      for (const index in resp) {
        if (resp.hasOwnProperty(index)) {
          this.categoriesList.push(resp[index].name);
        }
      }
    });
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
				Obtrenemos la colección de las sub-categorías filtrando por los nombres
				=============================================*/

        this.subCategoriesService
          .getFilterData('category', category)
          .subscribe((resp) => {
            /*=============================================
					Hacemos un recorrido por la colección general de subcategorias y clasificamos las subcategorias y url
					de acuerdo a la categoría que correspondan
					=============================================*/

            for (const index in resp) {
              if (resp.hasOwnProperty(index)) {
                arraySubCategories.push({
                  category: resp[index].category,
                  subcategory: resp[index].name,
                  url: resp[index].url,
                });
              }
            }

            /*=============================================
					Recorremos el array de objetos nuevo para buscar coincidencias con los nombres de categorías
					=============================================*/

            for (const index in arraySubCategories) {
              if (category === arraySubCategories[index].category) {
                $(`[category-footer='${category}']`).after(
                  `<a href="products/${arraySubCategories[index].url}">${arraySubCategories[index].subcategory}</a>`
                );
              }
            }
          });
      });
    }
  }
}
