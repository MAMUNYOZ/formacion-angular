import {
  Component,
  OnInit,
  ɵSWITCH_CHANGE_DETECTOR_REF_FACTORY__POST_R3__,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Path, Server } from '../../../config';
import { Sweetalert, Tooltip } from '../../../functions';

import { UsersService } from '../../../services/users.service';

import { ActivatedRoute } from '@angular/router';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.css'],
})
export class AccountProfileComponent implements OnInit {
  path: string = Path.url;
  vendor = false;
  displayName: string;
  username: string;
  email: string;
  picture: string;
  id: string;
  method = false;
  preload = false;
  server = Server.url;
  image: File = null;
  accountUrl: string = null;

  constructor(
    private usersService: UsersService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.preload = true;

    /*=============================================
		Capturamos la Url de la página de cuentas
		=============================================*/

    this.accountUrl = this.activatedRoute.snapshot.params['param'];

    /*=============================================
		Validar si existe usuario autenticado
		=============================================*/
    this.usersService.authActivate().then((resp) => {
      if (resp) {
        this.usersService
          .getFilterData('idToken', localStorage.getItem('idToken'))
          .subscribe((resp2) => {
            this.id = Object.keys(resp2).toString();

            for (const i in resp2) {
              if (resp2.hasOwnProperty(i)) {
                this.displayName = resp2[i].displayName;
                this.username = resp2[i].username;
                this.email = resp2[i].email;

                if (resp2[i].picture !== undefined) {
                  if (resp2[i].method !== 'direct') {
                    this.picture = resp2[i].picture;
                  } else {
                    this.picture = `assets/img/users/${resp2[
                      i
                    ].username.toLowerCase()}/${resp2[i].picture}`;
                  }
                } else {
                  this.picture = `assets/img/users/default/default.png`;
                }

                if (resp2[i].method !== 'direct') {
                  this.method = true;
                }

                this.preload = false;
              }
            }
          });
      }
    });

    /*=============================================
		Función para ejecutar el Tooltip de Bootstrap 4
		=============================================*/

    Tooltip.fnc();

    /*=============================================
		Validar formulario de Bootstrap 4
		=============================================*/

    // Disable form submissions if there are invalid fields
    (() => {
      'use strict';
      window.addEventListener(
        'load',
        () => {
          // Get the forms we want to add validation styles to
          const forms = document.getElementsByClassName('needs-validation');
          // Loop over them and prevent submission
          const validation = Array.prototype.filter.call(forms, (form) => {
            form.addEventListener(
              'submit',
              (event) => {
                if (form.checkValidity() === false) {
                  event.preventDefault();
                  event.stopPropagation();
                }
                form.classList.add('was-validated');
              },
              false
            );
          });
        },
        false
      );
    })();

    /*=============================================
		Script para subir imagen con el input de boostrap
		=============================================*/

    // Add the following code if you want the name of the file appear on select
    $('.custom-file-input').on('change', () => {
      const fileName = $(this).val().split('\\').pop();
      $(this)
        .siblings('.custom-file-label')
        .addClass('selected')
        .html(fileName);
    });
  }

  /*=============================================
    Validación de expresión regular del formulario
    =============================================*/

  validate(input): any {
    let pattern;

    if ($(input).attr('name') === 'password') {
      pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/;
    }

    if (!pattern.test(input.value)) {
      $(input).parent().addClass('was-validated');

      input.value = '';
    }
  }

  /*=============================================
   	Enviar nueva Contraseña
    =============================================*/

  newPassword(value): any {
    if (value !== '') {
      Sweetalert.fnc('loading', 'Cargando..', null);

      const body = {
        idToken: localStorage.getItem('idToken'),
        password: value,
        returnSecureToken: true,
      };

      this.usersService.changePasswordFnc(body).subscribe(
        (resp1) => {
          const value2 = {
            idToken: resp1['idToken'],
          };

          this.usersService.patchData(this.id, value2).subscribe((resp2) => {
            /*=============================================
					Almacenamos el Token de seguridad en el localstorage
					=============================================*/

            localStorage.setItem('idToken', resp1['idToken']);

            /*=============================================
					Almacenamos la fecha de expiración localstorage
					=============================================*/

            const today = new Date();

            today.setSeconds(resp1['expiresIn']);

            localStorage.setItem('expiresIn', today.getTime().toString());

            Sweetalert.fnc('success', 'Clave cambiada correctamente', 'account');
          });
        },
        (err) => {
          Sweetalert.fnc('error', err.error.error.message, null);
        }
      );
    }
  }

  /*=============================================
   	Validar Imagen
    =============================================*/

  validateImage(e): any {
    this.image = e.target.files[0];

    /*=============================================
        Validamos el formato
        =============================================*/

    if (
      this.image['type'] !== 'image/jpeg' &&
      this.image['type'] !== 'image/png'
    ) {
      Sweetalert.fnc('error', 'The image must be in JPG or PNG format', null);

      return;
    } else if (this.image['size'] > 2000000) {
      /*=============================================
        Validamos el tamaño
        =============================================*/
      Sweetalert.fnc('error', 'La imagen debe pesar menos de 2MB', null);

      return;
    } else {
      /*=============================================
        Mostramos la imagen temporal
        =============================================*/
      const data = new FileReader();
      data.readAsDataURL(this.image);

      $(data).on('load', (event) => {
        const path = event.target.result;

        $('.changePicture').attr('src', path);
      });
    }
  }

  /*=============================================
   	Subir imagen al servidor
    =============================================*/

  uploadImage(): any {
    const formData = new FormData();

    formData.append('file', this.image);
    formData.append('folder', this.username);
    formData.append('path', 'users');
    formData.append('width', '200');
    formData.append('height', '200');

    this.http.post(this.server, formData).subscribe((resp) => {
      if (resp['status'] === 200) {
        const body = {
          picture: resp['result'],
        };

        this.usersService.patchData(this.id, body).subscribe((resp2) => {
          if (resp['picture'] !== '') {
            Sweetalert.fnc(
              'success',
              'Tu foto ha sido actualizada',
              'account'
            );
          }
        });
      }
    });
  }
}
