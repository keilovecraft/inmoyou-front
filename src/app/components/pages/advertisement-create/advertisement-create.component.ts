import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { cities } from '../../../models/cities';
import { typesHouse } from 'src/app/models/typesHouse';
import { otherServices } from 'src/app/models/otherServices';
import { AdvertisementService } from 'src/app/services/advertisement.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { FirebaseStorageService } from 'src/app/services/firestore.service';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { EventBusService, EventData } from 'src/app/services/event.service';

@Component({
  selector: 'app-advertisement-create',
  templateUrl: './advertisement-create.component.html',
  styleUrls: ['./advertisement-create.component.sass'],
  providers: [AdvertisementService, UserService]
})
export class AdvertisementCreateComponent implements OnInit, OnDestroy {

  public isSubmitted: boolean = false;
  public user: User;
  public energeticsType: Array<string> = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  public typesHouse: typeof typesHouse = typesHouse;
  public otherServices: typeof otherServices = otherServices;
  public cities: Array<string> = cities;
  public selectedFiles: Array<File> = [];
  public advertisementPhotoURLs: Array<String> = [];
  public advertisementImages: Array<String> = [];
  public uploadingData: Boolean = false;
  /** Id del anuncio */
  public id: string;

  /* Form */
  public advertisementForm = this.fb.group({
    type: ['Piso', [Validators.required]],
    furnished: ['no', [Validators.required]],
    description: [null, [Validators.required]],
    price: [null, [Validators.required]],
    deposit: [null, [Validators.required]],
    size: [null, [Validators.required]],
    rooms: [null, [Validators.required]],
    toilets: [null, [Validators.required]],
    street: [null, [Validators.required]],
    number: [null, [Validators.required]],
    postalCode: [null, [Validators.required]],
    city: [null, [Validators.required]],
    energeticCert: ['G', [Validators.required]],
    contractClauses: [null, [Validators.required]],
    inventory: [''],
    images: [null, [Validators.required]],
    elevator: [false],
    garage: [false],
    trastero: [false],
    aire: [false],
    calefaccion: [false],
    pool: [false],
    portero: [false],
    gym: [false],
    animals: [false]
  })

  constructor(
    private _eventBusService: EventBusService,
    private _firebaseStorageService: FirebaseStorageService,
    private _advertisementService: AdvertisementService,
    private _userService: UserService,
    public fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('mongoUser'));
    this._route.params.subscribe((params: Params) => {
      if (params.id) this.id = params.id;
    });

    if (this.id) {
      this.getAdvertisement();
    }
  }

  /** Muestra el componente spinner */
  private showLoading (state: boolean) {
    this._eventBusService.emit(new EventData('showLoading', state))
  }

  /** Recoge los datos del anuncio */
  public getAdvertisement() {
    this._advertisementService.getAdvertisement(this.id).subscribe(
      response => {
        const advertisement = response.advertisement;
        // Si no es nuestro, no podremos editarlo
        if (!advertisement || this.user._id !== advertisement.author) {
          this._router.navigate(['']);
          return;
        }

        this.showLoading(true);
        // Si tiene imagenes las recogemos
        if (advertisement.images) {
          this.advertisementImages = advertisement.images;
        };
        // Guardamos los datos en el formulario
        this.advertisementForm.patchValue({
          type: advertisement.type,
          price: advertisement.price,
          size: advertisement.size,
          energeticCert: advertisement.energeticCert,
          furnished: advertisement.furnished ? 'yes' : 'no',
          rooms: advertisement.rooms,
          toilets: advertisement.toilets,
          deposit: advertisement.deposit,
          description: advertisement.description,
          contractClauses: advertisement.contractClauses,
          inventory: advertisement.inventory,
          street: advertisement.address.street,
          number: advertisement.address.number,
          postalCode: advertisement.address.postalCode,
          city: advertisement.address.city
        });
        this.advertisementForm.controls['images'].clearValidators();
        this.advertisementForm.controls['images'].updateValueAndValidity()

        advertisement.otherServices.forEach(adService => {
          otherServices.forEach(s => {
            if (adService === s.name) {
              this.advertisementForm.patchValue({
                [s.value]: true
              });
              return;
            };
          })
        });
        this.showLoading(false);
      }
    );
  }

  /** Obtiene los servicios marcados del anuncio */
  public getOtherServices (): any {
    let arrServicesName: any = [];

    let services: any = {
      aire: this.advertisementForm.get('aire').value,
      animals: this.advertisementForm.get('animals').value,
      calefaccion: this.advertisementForm.get('calefaccion').value,
      elevator: this.advertisementForm.get('elevator').value,
      garage: this.advertisementForm.get('garage').value,
      gym: this.advertisementForm.get('gym').value,
      pool: this.advertisementForm.get('pool').value,
      portero: this.advertisementForm.get('portero').value,
      trastero: this.advertisementForm.get('trastero').value
    };

    services = Object.keys(services).filter((el)=>services[el]);

    otherServices.forEach(service => {
      services.forEach(s => {
        if (service.value === s) {
          arrServicesName.push(service.name);
          return;
        };
      })
    });

    return arrServicesName;
  }

  /** Selecciona los ficheros de imagenes */
  public selectFile(event: any) {
    const files = event.target.files;
    this.selectedFiles = files;
  }

  /** Llama al servicio para añadir un anuncio */
  public addAdvertisement(params: any) {
    this._advertisementService.addAdvertisement(params).subscribe((response: any) => {
      // Agregamos el anuncio al array del anuncio
      this.user.advertisements.push(response.advertisement._id);
      const update = {
        _id: this.user._id,
        advertisements: this.user.advertisements
      }

      this._userService.updateUser(update)
        .then((value: any) => {
          localStorage.removeItem('mongoUser');
          localStorage.setItem('mongoUser', JSON.stringify(value.user));
          this.id = response.advertisement._id;
          this.uploadAdvertisementPhoto()
            .then((advertisementPhotoURLs) => {
              this.advertisementPhotoURLs = advertisementPhotoURLs;
              const params = {
                _id: this.id,
                images: this.advertisementPhotoURLs,
              };
              this.updateAdvertisement(params);
            })
            .catch((err) => {
              console.error(err);
            })
        })
        .catch((err) => {
          console.error(err);
        });
    });
  }

  /** Llama al servicio para añadir un anuncio */
  public updateAdvertisement(params: any) {
    this._advertisementService.updateAdvertisement(params).subscribe(
      response => {
        this.uploadingData = false;
        this.showLoading(false);
        this._router.navigate(['/advertisement/' + this.id]);
      }
    );
  }

  /** Actualiza las fotos de un anuncio ya creado que está en proceso de edición */
  private updateAdPhotos() {
    this._firebaseStorageService.removePhotos(this.user._id, this.id)
    .then(() => {
      this.uploadAdvertisementPhoto()
        .then((advertisementPhotoURLs) => {
          this.advertisementPhotoURLs = advertisementPhotoURLs;
          this.makeAdvertisementParams();
        })
        .catch((err) => {
          console.error(err);
        })
    })
    .catch((err) => {
      console.error(err);
    })
  }

  /** Recoge los datos del formulario para crear/editar el anuncio */
  public createOrEditAdvertisement() {
    this.isSubmitted = true;
    this.uploadingData = true;
    if (this.advertisementForm.valid) {
      this.showLoading(true);
      if (this.id && this.selectedFiles.length > 0) {
        this.updateAdPhotos();
        return;
      }
      this.makeAdvertisementParams();
    }
  }

  /** Obtiene los datos del formulario */
  private makeAdvertisementParams() {
    const params = {
      isCompany: this.user._type === 'company',
      published: false,
      lastModified: new Date,
      author: this.user._id,
      type: this.advertisementForm.value.type,
      price: this.advertisementForm.value.price,
      size: this.advertisementForm.value.size,
      energeticCert: this.advertisementForm.value.energeticCert,
      furnished: this.advertisementForm.value.furnished,
      rooms: this.advertisementForm.value.rooms,
      toilets: this.advertisementForm.value.toilets,
      deposit: this.advertisementForm.value.deposit,
      description: this.advertisementForm.value.description,
      contractClauses: this.advertisementForm.value.contractClauses,
      inventory: this.advertisementForm.value.inventory,
      address: {
        street: this.advertisementForm.value.street,
        number: this.advertisementForm.value.number,
        postalCode: this.advertisementForm.value.postalCode,
        city: this.advertisementForm.value.city,
      },
      otherServices: this.getOtherServices(),
      images: this.advertisementPhotoURLs.length > 0 ? this.advertisementPhotoURLs : this.advertisementImages,
    };

    // Llama al servicio de edición o creación
    if (this.id) {
      Object.assign(params, {
        _id: this.id
      });

      this.updateAdvertisement(params);
    } else {
      this.addAdvertisement(params);
    }
  }

  /**
   * Devuelve una promesa con todas las imágenes
   */
  private uploadAdvertisementPhoto(): Promise<Array<String>> {
    const photoUploads: Array<Promise<String>> = [];
    return new Promise((response, reject) => {
      // Procesamos cada fichero seleccionado
      Array.from(this.selectedFiles).forEach((file) => {
        const fileUploadPromise = this.uploadPhoto(file);
        photoUploads.push(fileUploadPromise);
      });

      Promise.all(photoUploads)
        .then((values) => {
          response(values);
        })
        .catch((err) => {
          reject(err);
        })
    })
  }

  /**
   * Sube una imagen a Firebase Storage
   */
  private uploadPhoto(file: File): Promise<String> {
    return new Promise((response, reject) => {
      const filename = file.name;
      const userId = this.user._id;
      const path = `images/${userId}/${this.id}/${filename}`

      const fileReference = this._firebaseStorageService.getReferenceFromFilename(filename, userId, path);
      const uploadTask: AngularFireUploadTask =  this._firebaseStorageService.uploadFile(filename, file, userId, path)

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

  ngOnDestroy() {
    this.selectedFiles = [];
    this.advertisementPhotoURLs = [];
    this.id = null;
  }
}
