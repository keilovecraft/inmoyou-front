import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseAuthService } from "../../../services/firebase.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent {
  public loginForm: FormGroup;

  constructor(
    public authService: FirebaseAuthService,
    private readonly fb: FormBuilder
    ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  /** Envía los datos del formulario */
  public submitForm() {
    if (this.loginForm.valid) {
      this.authService.SignIn(this.loginForm.get('email').value, this.loginForm.get('password').value);
    }
  }

}
