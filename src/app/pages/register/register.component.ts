import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import * as firebase from 'firebase/app';
import 'firebase/auth';

import { Capitalize, Sweetalert } from '../../functions';

import { UsersModel } from '../../models/users.model';

import { UsersService } from '../../services/users.service';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  user: UsersModel;

  constructor(private usersService: UsersService) {
    this.user = new UsersModel();
  }

  ngOnInit(): void {
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
  }

  /*=============================================
  Capitalizar la primera letra de nombre y apellido
  =============================================*/

  capitalize(input): any {
    input.value = Capitalize.fnc(input.value);
  }

  /*=============================================
  Validación de expresión regular del formulario
  =============================================*/
  validate(input): any {
    let pattern;

    if ($(input).attr('name') === 'username') {
      pattern = /^[A-Za-z]{2,8}$/;

      input.value = input.value.toLowerCase();

      this.usersService
        .getFilterData('username', input.value)
        .subscribe((resp) => {
          if (Object.keys(resp).length > 0) {
            $(input).parent().addClass('was-validated');

            input.value = '';

            Sweetalert.fnc('error', 'El usuario ya existe', null);

            return;
          }
        });
    }

    if ($(input).attr('name') === 'password') {
      pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/;
    }

    if (!pattern.test(input.value)) {
      $(input).parent().addClass('was-validated');

      input.value = '';
    }
  }

  /*=============================================
  Envío del formulario
  =============================================*/

  onSubmit(f: NgForm): any {
    if (f.invalid) {
      return;
    }

    /*=============================================
    Alerta suave mientras se registra el usuario
    =============================================*/

    Sweetalert.fnc('loading', 'Cargando...', null);

    /*=============================================
  	Registro en Firebase Authentication
  	=============================================*/

    this.user.returnSecureToken = true;

    this.usersService.registerAuth(this.user).subscribe(
      (resp) => {
        if (resp['email'] === this.user.email) {
          /*=============================================
        Enviar correo de verificación
        =============================================*/

          const body = {
            requestType: 'VERIFY_EMAIL',
            idToken: resp['idToken'],
          };

          this.usersService.sendEmailVerificationFnc(body).subscribe((resp2) => {
            if (resp2['email'] === this.user.email) {
              /*=============================================
            Registro en Firebase Database
            =============================================*/

              this.user.displayName = `${this.user.firstName} ${this.user.lastName}`;
              this.user.method = 'direct';
              this.user.needConfirm = false;
              this.user.username = this.user.username.toLowerCase();

              this.usersService
                .registerDatabase(this.user)
                .subscribe((resp3) => {
                  Sweetalert.fnc(
                    'success',
                    'Confirma tu cuenta en el email que te hemos enviado (comprueba spam)',
                    'login'
                  );
                });
            }
          });
        }
      },
      (err) => {
        Sweetalert.fnc('error', err.error.error.message, null);
      }
    );
  }

  /*=============================================
  Registro con Facebook
  =============================================*/

  facebookRegister(): any {
    const localUsersService = this.usersService;
    const localUser = this.user;

    // https://firebase.google.com/docs/web/setup
    // Crea una nueva APP en Settings
    // npm install --save firebase
    // Agregar import * as firebase from "firebase/app";
    // import "firebase/auth";

    /*=============================================
    Inicializa Firebase en tu proyecto web
    =============================================*/

    // Your web app's Firebase configuration

    const firebaseConfig = {
      apiKey: 'AIzaSyCqFLh0bhsvNgN0uOIlkQcM88oWLUx9c7A',
      authDomain: 'ecommerce-1b4b4.firebaseapp.com',
      databaseURL: 'https://ecommerce-1b4b4.firebaseio.com',
      projectId: 'ecommerce-1b4b4',
      storageBucket: 'ecommerce-1b4b4.appspot.com',
      messagingSenderId: '352173451063',
      appId: '1:352173451063:web:3fc85f4a390a97396b1cb2',
      measurementId: 'G-32BYRRNGWY',
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // https://firebase.google.com/docs/auth/web/facebook-login

    /*=============================================
    Crea una instancia del objeto proveedor de Facebook
    =============================================*/

    const provider = new firebase.auth.FacebookAuthProvider();

    /*=============================================
    acceder con una ventana emergente y con certificado SSL (https)
    =============================================*/
    // ng serve --ssl true --ssl-cert "/path/to/file.crt" --ssl-key "/path/to/file.key"

    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        registerFirebaseDatabase(result, localUser, localUsersService);
      })
      .catch((error) => {
        const errorMessage = error.message;

        Sweetalert.fnc('error', errorMessage, 'register');
      });

    /*=============================================
    Registramos al usuario en Firebase Database
    =============================================*/

    function registerFirebaseDatabase(result, localUserF, localUsersServiceF): any {
      const user = result.user;

      if (user.P) {
        localUserF.displayName = user.displayName;
        localUserF.email = user.email;
        localUserF.idToken = user.b.b.g;
        localUserF.method = 'facebook';
        localUserF.username = user.email.split('@')[0];
        localUserF.picture = user.photoURL;

        /*=============================================
        Evitar que se dupliquen los registros en Firebase Database
        =============================================*/

        localUsersServiceF
          .getFilterData('email', user.email)
          .subscribe((resp) => {
            if (Object.keys(resp).length > 0) {
              Sweetalert.fnc(
                'error',
                `Ya te has registrado, por favor accede desde el login ${
                  resp[Object.keys(resp)[0]].method
                } method`,
                'login'
              );
            } else {
              localUsersServiceF
                .registerDatabase(localUserF)
                .subscribe((resp2) => {
                  if (resp2['name'] !== '') {
                    Sweetalert.fnc(
                      'success',
                      'Por favor accede con facebook',
                      'login'
                    );
                  }
                });
            }
          });
      }
    }
  }

  /*=============================================
  Registro con Google
  =============================================*/

  googleRegister(): any {
    const localUsersService = this.usersService;
    const localUser = this.user;

    // https://firebase.google.com/docs/web/setup
    // Crea una nueva APP en Settings
    // npm install --save firebase
    // Agregar import * as firebase from "firebase/app";
    // import "firebase/auth";

    /*=============================================
    Inicializa Firebase en tu proyecto web
    =============================================*/

    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: 'AIzaSyCqFLh0bhsvNgN0uOIlkQcM88oWLUx9c7A',
      authDomain: 'ecommerce-1b4b4.firebaseapp.com',
      databaseURL: 'https://ecommerce-1b4b4.firebaseio.com',
      projectId: 'ecommerce-1b4b4',
      storageBucket: 'ecommerce-1b4b4.appspot.com',
      messagingSenderId: '352173451063',
      appId: '1:352173451063:web:3fc85f4a390a97396b1cb2',
      measurementId: 'G-32BYRRNGWY',
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // https://firebase.google.com/docs/auth/web/google-signin

    /*=============================================
    Crea una instancia del objeto proveedor de Google
    =============================================*/

    const provider = new firebase.auth.GoogleAuthProvider();

    /*=============================================
    acceder con una ventana emergente
    =============================================*/

    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        registerFirebaseDatabase(result, localUser, localUsersService);
      })
      .catch((error) => {
        const errorMessage = error.message;

        Sweetalert.fnc('error', errorMessage, 'register');
      });

    /*=============================================
    Registramos al usuario en Firebase Database
    =============================================*/

    function registerFirebaseDatabase(result, localUserG, localUsersServiceG): any {
      const user = result.user;

      if (user.P) {
        localUserG.displayName = user.displayName;
        localUserG.email = user.email;
        localUserG.idToken = user.b.b.g;
        localUserG.method = 'google';
        localUserG.username = user.email.split('@')[0];
        localUserG.picture = user.photoURL;

        /*=============================================
        Evitar que se dupliquen los registros en Firebase Database
        =============================================*/

        localUsersServiceG
          .getFilterData('email', user.email)
          .subscribe((resp) => {
            if (Object.keys(resp).length > 0) {
              Sweetalert.fnc(
                'error',
                `Ya te has registrado, por favor accede desde el login ${
                  resp[Object.keys(resp)[0]].method
                } method`,
                'login'
              );
            } else {
              localUsersServiceG
                .registerDatabase(localUser)
                .subscribe((resp2) => {
                  if (resp2['name'] !== '') {
                    Sweetalert.fnc(
                      'success',
                      'Por favor acceda con Google',
                      'login'
                    );
                  }
                });
            }
          });
      }
    }
  }
}
