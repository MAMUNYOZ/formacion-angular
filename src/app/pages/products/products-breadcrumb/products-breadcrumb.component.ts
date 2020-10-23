import { Component, OnInit } from '@angular/core';

import { CategoriesService } from '../../../services/categories.service';
import { SubCategoriesService } from '../../../services/sub-categories.service';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-products-breadcrumb',
  templateUrl: './products-breadcrumb.component.html',
  styleUrls: ['./products-breadcrumb.component.css'],
})
export class ProductsBreadcrumbComponent implements OnInit {
  breadcrumb: string = null;

  constructor(
    private categoriesService: CategoriesService,
    private subCategoriesService: SubCategoriesService,
    private activateRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    /*=============================================
	Refrescamos el RouterLink para actualizar la ruta de la página
	=============================================*/
    // this.activateRoute.params.subscribe(param => { })

    const params = this.activateRoute.snapshot.params['param'].split('&')[0];

    /*=============================================
	Filtramos data de categorías
	=============================================*/

    this.categoriesService.getFilterData('url', params).subscribe((resp1) => {
      if (Object.keys(resp1).length > 0) {
        for (const i in resp1) {
          if (resp1.hasOwnProperty(i)) {
            this.breadcrumb = resp1[i].name;

            const id = Object.keys(resp1).toString();

            const value = {
              view: Number(resp1[i].view + 1),
            };

            this.categoriesService.patchData(id, value).subscribe((resp) => {});
          }
        }
      } else {
        /*=============================================
			Filtramos data de subategorías
			=============================================*/

        this.subCategoriesService
          .getFilterData('url', params)
          .subscribe((resp2) => {
            for (const i in resp2) {
              if (resp2.hasOwnProperty(i)) {
                this.breadcrumb = resp2[i].name;

                const id = Object.keys(resp2).toString();

                const value = {
                  view: Number(resp2[i].view + 1),
                };

                this.subCategoriesService
                  .patchData(id, value)
                  .subscribe((resp) => {});
              }
            }
          });
      }
    });
  }
}
