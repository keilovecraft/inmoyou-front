import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseAuthService } from "../../../services/firebase.service";
import { cities } from '../../../models/cities';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass'],
  providers: [UserService]
})
export class RegisterComponent {

  public user: User;
  public isCompany: boolean = false;
  public registerForm: FormGroup;
  public cities: Array<string> = cities;
  public selectedFile?: FileList;

  constructor(
    public authService: FirebaseAuthService,
    private _userService: UserService,
    private _router: Router,
    private readonly fb: FormBuilder
    ) {
      this.registerForm = this.fb.group({
        userType: ['people', Validators.required],
        name: [null, Validators.required],
        surname: [null, Validators.required],
        email: [null, Validators.required],
        phone: [null, [Validators.required, Validators.pattern("[0-9]{9}")]],
        password: [null, [Validators.required, Validators.pattern(".{6,}")]],
        contactPhone: [false, Validators.required],
        contactEmail: [false, Validators.required],
        street: [null],
        number: [null],
        postalCode: [null],
        city: [null]
      });
  }

  /** Cambia el formulario segun el tipo de usuario */
  changeTypeUser(type){
    this.isCompany = type === 'company';
    if (type === 'company') {
      this.registerForm.controls['surname'].clearValidators();
    } else {
      this.registerForm.controls['surname'].setValidators([Validators.required]);
    }
    this.registerForm.controls['surname'].updateValueAndValidity()
  }

  /** Selecciona la imagen */
  public selectFile(event: any): void {
    this.selectedFile = event.target.files;
  }

  /** Añade un usuario */
  public addUser() {
    const type: string = this.isCompany ? 'company' : 'people';
    this._userService.addUser(this.user, type).subscribe((response: {}) => {
      this._router.navigate(['/profile']);
    });
  }

  /** Convierte un fichero a base64 */
  public fileToBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  /** Envia los datos del formulario */
  public submitForm() {
    if (this.registerForm.valid) {
      // Registramos el login y guardamos el usuario
      this.authService.SignUp(this.registerForm.get('email').value, this.registerForm.get('password').value).then(async (result) => {

        // Asignamos los datos
        let contactForm: string;

        if (this.registerForm.get('contactPhone').value) {
          if (this.registerForm.get('contactEmail').value) {
            contactForm = 'both';
          } else {
            contactForm = 'tel';
          }
        } else if (this.registerForm.get('contactEmail').value) {
          contactForm = 'mail';
        } else {
          contactForm = 'both';
        }

        this.user = {
          authId: result.user.uid,
          name: this.registerForm.get('name').value,
          email: this.registerForm.get('email').value,
          password: this.registerForm.get('password').value,
          admin: false,
          phone: this.registerForm.get('phone').value,
          contactForm: contactForm
        };

        if (this.isCompany) {
          let base64: any = '';
          if (this.selectedFile) {
            base64 = await this.fileToBase64(this.selectedFile.item(0));
          }
          Object.assign(this.user, {
            logo: base64,
            address: {
              street: this.registerForm.get('street').value,
              number: this.registerForm.get('number').value,
              postalCode: this.registerForm.get('postalCode').value,
              city: this.registerForm.get('city').value
            }
          });
        } else {
          Object.assign(this.user, {
            lastName: this.registerForm.get('surname').value
          });
        }

        this.addUser();

      }).catch((error) => {
        window.alert('No se ha podido crear el usuario.')
      });
    }
  }

}
