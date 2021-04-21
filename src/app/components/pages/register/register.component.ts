import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseAuthService } from "../../../services/firebase.service";
import { cities } from '../../../models/cities';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { Router } from '@angular/router';
import { FirebaseStorageService } from 'src/app/services/firestore.service';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { EventBusService, EventData } from 'src/app/services/event.service';

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
  public creatingUser: boolean = false;

  constructor(
    private _eventBusService: EventBusService,
    private _firebaseStorageService: FirebaseStorageService,
    public authService: FirebaseAuthService,
    private _userService: UserService,
    private _router: Router,
    private readonly fb: FormBuilder
    ) {
      this.registerForm = this.fb.group({
        userType: ['people', Validators.required],
        name: [null, Validators.required],
        surname: [null, Validators.required],
        email: [null, [Validators.required, Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}")]],
        phone: [null, [Validators.required, Validators.pattern("[0-9]{9}")]],
        password: [null, [Validators.required, Validators.pattern(".{6,}")]],
        contactPhone: [true, Validators.required],
        contactEmail: [true, Validators.required],
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

    // Creamos el usuario
    this._userService.addUser(this.user, type).subscribe((response: any) => {
      const userType: string = this.isCompany ? 'company' : 'person';

      this.user= response[userType];
      // Si tenemos logo, subimos el logo
      if (this.selectedFile && this.isCompany) {
        this.uploadProfilePhoto()
          .then((photoURL) => {
            // Actualizamos el usuario
            const update = {
              _id: this.user._id,
              _type: this.user._type,
              logo: photoURL
            }
            this._userService.updateUser(update)
              .then((value: any) => {
                localStorage.removeItem('mongoUser');
                localStorage.setItem('mongoUser', JSON.stringify(value.user));
                this.showLoading(false);
                this._router.navigate(['']);

                return;
              })
              .catch((err: any) => {
                console.log(err)
              })

          })
      } else {
        localStorage.setItem('mongoUser', JSON.stringify(response[userType]));
        this.showLoading(false);
        this._router.navigate(['']);
      }

    });
  }

  /** Muestra el componente spinner */
  private showLoading (state: boolean) {
    this._eventBusService.emit(new EventData('showLoading', state))
  }

  /** Envia los datos del formulario */
  public submitForm() {
    if (this.registerForm.valid) {
      this.showLoading(true);
      this.creatingUser = true;
      localStorage.removeItem('imLogin');
      // Registramos el login y guardamos el usuario
      this.authService.SignUp(this.registerForm.get('email').value, this.registerForm.get('password').value).then((result) => {
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
          Object.assign(this.user, {
            logo: '',
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
        this.showLoading(false);
        this.creatingUser = false;
        window.alert('El usuario ya existe.');
      });
    }
  }


  private uploadProfilePhoto(): Promise<String> {
    return new Promise((response, reject) => {
      const filename = this.selectedFile[0].name;
      const userId = this.user._id;
      const route = `images/${userId}/profileImage/${filename}`;

      const fileReference = this._firebaseStorageService.getReferenceFromFilename(filename, userId, route);
      const uploadTask: AngularFireUploadTask = this._firebaseStorageService.uploadFile(filename, this.selectedFile[0], userId, route)

      uploadTask.percentageChanges().subscribe((percent) => {
        let actualProgress = Math.round(percent);

        if (actualProgress === 100) {
          fileReference.getDownloadURL().subscribe((photoURL) => {
            response(photoURL);
          })
        }
      });
    })
  }
}
