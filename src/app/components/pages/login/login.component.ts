import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseAuthService } from "../../../services/firebase.service";
import { EventBusService, EventData } from 'src/app/services/event.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;

  constructor(
    private _eventBusService: EventBusService,
    public authService: FirebaseAuthService,
    private readonly fb: FormBuilder,
    private _router: Router,
    ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.checkIfHasPermission();
  }

  /** Muestra el componente spinner */
  private showLoading (state: boolean) {
    this._eventBusService.emit(new EventData('showLoading', state))
  }

  /** Comprueba si el usuario está logado, para no permitir el acceso */
  private checkIfHasPermission() {
    const sessionUser = JSON.parse(localStorage.getItem('mongoUser'));
    if (sessionUser) {
      this._router.navigate(['/profile']);
    }
  }

  /** Envía los datos del formulario */
  public submitForm() {
    if (this.loginForm.valid) {
      this.showLoading(true);
      localStorage.setItem('imLogin', "true");
      this.authService.SignIn(this.loginForm.get('email').value, this.loginForm.get('password').value).then((result) => {
        this.showLoading(false);
      });
    }
  }

}
