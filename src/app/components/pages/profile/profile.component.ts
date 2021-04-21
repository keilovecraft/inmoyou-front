import { Component, OnInit } from '@angular/core';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cities } from 'src/app/models/cities';
import { User } from 'src/app/models/user.model';
import { EventBusService, EventData } from 'src/app/services/event.service';
import { FirebaseStorageService } from 'src/app/services/firestore.service';
import { UserService } from 'src/app/services/user.service';
import { FirebaseAuthService } from "../../../services/firebase.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.sass'],
  providers: [UserService]
})
export class ProfileComponent implements OnInit {

  public isCompany: boolean = true;
  public user: User;
  public profileForm: FormGroup;
  public selectedFile?: FileList;
  public cities: Array<string> = cities;
  private loginUpdateData: any = {};

  constructor(
    private _eventBusService: EventBusService,
    private _firebaseStorageService: FirebaseStorageService,
    public authService: FirebaseAuthService,
    private _userService: UserService,
    private readonly fb: FormBuilder
    ) {
    this.profileForm = this.fb.group({
      name: [null, Validators.required],
      surname: [null, Validators.required],
      email: [null, [Validators.required, Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}")]],
      phone: [null, [Validators.required, Validators.pattern("[0-9]{9}")]],
      password: [null, [Validators.required, Validators.pattern(".{6,}")]],
      contactPhone: [null, Validators.required],
      contactEmail: [null, Validators.required],
      street: [null],
      number: [null],
      postalCode: [null],
      city: [null]
    });
  }

  ngOnInit(): void {
    this.getUserProfile();
  }

  /** Muestra el componente spinner */
  private showLoading (state: boolean) {
    this._eventBusService.emit(new EventData('showLoading', state))
  }

  /** Trae los datos del usuario */
  public getUserProfile(){
    this.showLoading(true);
    // Traemos del localStorage el user
    this.user = JSON.parse(localStorage.getItem('mongoUser'));
    if (this.user) {
      this.isCompany = this.user._type === 'company';

      // Guardamos los datos del usuario en el formulario
      this.profileForm.patchValue({ 
        name: this.user.name,
        email: this.user.email,
        phone: this.user.phone,
        password: this.user.password
      });

      if (this.isCompany) {
        this.profileForm.patchValue({ 
          street: this.user.address.street,
          number: this.user.address.number,
          postalCode: this.user.address.postalCode,
          city: this.user.address.city
        });
        this.profileForm.controls['surname'].clearValidators();
        this.profileForm.controls['surname'].updateValueAndValidity()
      } else {
        this.profileForm.patchValue({ 
          surname: this.user.lastName
        });
      }

      switch (this.user.contactForm) {
        case 'both':
          this.profileForm.patchValue({ 
            contactPhone: true,
            contactEmail: true
          });
          break;
        case 'mail':
          this.profileForm.patchValue({ 
            contactPhone: false,
            contactEmail: true
          });
          break;
        case 'tel':
          this.profileForm.patchValue({ 
            contactPhone: true,
            contactEmail: false
          });
          break;
        default:
          this.profileForm.patchValue({ 
            contactPhone: true,
            contactEmail: true
          });
          break;
      }
    }
    this.showLoading(false);
  }

  /** Selecciona los ficheros */
  public selectFile(event: any): void {
    this.selectedFile = event.target.files;
  }

  /** Envia los datos del formulario */
  public submitForm() {
    this.showLoading(true);
    // Recogemos los datos actuales
    let updateData: any;
    let contactForm: string;

    if (this.profileForm.get('contactPhone').value) {
      if (this.profileForm.get('contactEmail').value) {
        contactForm = 'both';
      } else {
        contactForm = 'tel';
      }
    } else if (this.profileForm.get('contactEmail').value) {
      contactForm = 'mail';
    } else {
      contactForm = 'both';
    }

    if (this.user.email !== this.profileForm.get('email').value) {
      this.loginUpdateData['email'] = this.profileForm.get('email').value;
    }

    if (this.user.password !== this.profileForm.get('password').value) {
      this.loginUpdateData['password'] = this.profileForm.get('password').value;
    }

    updateData = {
      _id: this.user._id,
      _type: this.user._type,
      name: this.profileForm.get('name').value,
      email: this.profileForm.get('email').value,
      password: this.profileForm.get('password').value,
      phone: this.profileForm.get('phone').value,
      contactForm: contactForm
    };

    if (this.isCompany) {
      Object.assign(updateData, {
        address: {
          street: this.profileForm.get('street').value,
          number: this.profileForm.get('number').value,
          postalCode: this.profileForm.get('postalCode').value,
          city: this.profileForm.get('city').value
        }
      });
      if (this.selectedFile) {
        this._firebaseStorageService.removeProfilePhoto(this.user._id)
          .then(() => {
            this.uploadProfilePhoto()
              .then((photoURL) => {
                Object.assign(updateData, {
                  logo: photoURL
                });

                this.updateProfileInfo(updateData);
                return;
              })
              .catch((err) => {
                console.error(err);
                this.showLoading(false);
              })
          })
          .catch((err) => {
            console.error(err);
            this.showLoading(false);
          })
      } else if (this.user.logo){
        Object.assign(updateData, {
          logo: this.user.logo
        });
      }
    } else {
      Object.assign(updateData, {
        lastName: this.profileForm.get('surname').value
      });
    }

    this.updateProfileInfo(updateData);
  }

  /** Sube la foto de perfil del usuario */
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

  /** Actualiza los datos del usuario */
  private updateProfileInfo(updateData: any) {
    const arrPromise: Array<Promise<any>> = [];
    if (Object.keys(this.loginUpdateData).length > 0) {
      const updateEmailPasswordPromise = this.authService.UpdateEmailPassword(this.loginUpdateData['email'], this.loginUpdateData['password']);
      arrPromise.push(updateEmailPasswordPromise);
    }

    const updateUser = this._userService.updateUser(updateData);
    arrPromise.push(updateUser);

    Promise.all(arrPromise)
      .then((values) => {
        values.forEach(res => {
          if (Object.keys(res).includes('user')) {
            localStorage.removeItem('mongoUser');
            localStorage.setItem('mongoUser', JSON.stringify(res.user));
            this.getUserProfile();
            this.showLoading(false);
          }
        });
        this.showLoading(false);
      })
      .catch((err) => {
        console.error(err);
        this.showLoading(false);
      })
  }

}
