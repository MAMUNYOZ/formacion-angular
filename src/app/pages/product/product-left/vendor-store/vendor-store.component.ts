import { Component, OnInit, Input } from '@angular/core';
import { Path } from '../../../../config';

import { StoresService } from '../../../../services/stores.service';

@Component({
  selector: 'app-vendor-store',
  templateUrl: './vendor-store.component.html',
  styleUrls: ['./vendor-store.component.css']
})
export class VendorStoreComponent implements OnInit {

	@Input() childItem:any;
	path:string = Path.url;
	store:any[]= [];

  	constructor(private storesService: StoresService) { }

  	ngOnInit(): void {

  		this.storesService.getFilterData("store", this.childItem)
  		.subscribe( resp => {	
  			
  			for(const i in resp){

  				this.store.push(resp[i])
  			
  			}

  		})
  	}

}
