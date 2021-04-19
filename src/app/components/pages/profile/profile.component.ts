import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cities } from 'src/app/models/cities';
import { User } from 'src/app/models/user.model';
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

  constructor(
    public authService: FirebaseAuthService,
    private _userService: UserService,
    private readonly fb: FormBuilder
    ) {
    const validatorPeople = !this.isCompany ? Validators.required : '';
    this.profileForm = this.fb.group({
      name: [null, Validators.required],
      surname: [null, validatorPeople],
      email: [null, Validators.required],
      phone: [null, Validators.pattern("[0-9]{9}")],
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

  /** Trae los datos del usuario */
  public getUserProfile(){
    // Traemos del localStorage el user
    const actualUser: any = JSON.parse(localStorage.getItem('user'));
    // Traemos el usuario que tiene ese authId
    this._userService.getUser(actualUser.uid).subscribe((response: any) => {
      this.user = response.user;
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
    });
  }

  /** Selecciona los ficheros */
  public selectFile(event: any): void {
    this.selectedFile = event.target.files;
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
  public async submitForm() {
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
      let base64: any;
      if (this.selectedFile) {
        base64 = await this.fileToBase64(this.selectedFile.item(0));
      }
      Object.assign(updateData, {
        logo: base64,
        address: {
          street: this.profileForm.get('street').value,
          number: this.profileForm.get('number').value,
          postalCode: this.profileForm.get('postalCode').value,
          city: this.profileForm.get('city').value
        }
      });
    } else {
      Object.assign(updateData, {
        lastName: this.profileForm.get('surname').value
      });
    }

    // Actualizar datos de usuario
    this._userService.updateUser(updateData).subscribe((response: {}) => {
      this.getUserProfile();
    });
  }

}
