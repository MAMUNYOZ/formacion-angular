import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search-breadcrumb',
  templateUrl: './search-breadcrumb.component.html',
  styleUrls: ['./search-breadcrumb.component.css']
})
export class SearchBreadcrumbComponent implements OnInit {

	breadcrumb:string = null;

 	constructor(private activateRoute: ActivatedRoute) { }

  	ngOnInit(): void {

  		/*=============================================
		Capturamos el parámetro URL
		=============================================*/	

		this.breadcrumb = this.activateRoute.snapshot.params["param"].replace(/[_]/g, " ");

  	}

}
