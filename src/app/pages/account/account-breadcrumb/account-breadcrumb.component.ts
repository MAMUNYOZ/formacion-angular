import { Component, OnInit } from '@angular/core';

import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-account-breadcrumb',
  templateUrl: './account-breadcrumb.component.html',
  styleUrls: ['./account-breadcrumb.component.css'],
})
export class AccountBreadcrumbComponent implements OnInit {
  displayName: string;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    /*=============================================
		Validar si existe usuario autenticado
		=============================================*/
    this.usersService.authActivate().then((resp) => {
      if (resp) {
        this.usersService
          .getFilterData('idToken', localStorage.getItem('idToken'))
          .subscribe((resp2) => {
            for (const i in resp2) {
              if (resp.hasOwnProperty(i)) {
                this.displayName = resp2[i].displayName;
              }
            }
          });
      }
    });
  }

  /*=============================================
	Salir del sistema
	=============================================*/

  logout(): any {
    localStorage.removeItem('idToken');
    localStorage.removeItem('expiresIn');
    window.open('login', '_top');
  }
}
