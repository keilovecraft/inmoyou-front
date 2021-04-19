import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { cities } from '../../../models/cities';
import { typesHouse } from 'src/app/models/typesHouse';
import { otherServices } from 'src/app/models/otherServices';
import { AdvertisementService } from 'src/app/services/advertisement.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-advertisement-create',
  templateUrl: './advertisement-create.component.html',
  styleUrls: ['./advertisement-create.component.sass'],
  providers: [AdvertisementService, UserService]
})
export class AdvertisementCreateComponent implements OnInit {

  public isSubmitted: boolean = false;
  public myUser: User;
  public energeticsType: Array<string> = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  public typesHouse: typeof typesHouse = typesHouse;
  public otherServices: typeof otherServices = otherServices;
  public cities: Array<string> = cities;
  public selectedFiles?: Array<string> = [];
  /** Id del anuncio */
  public id: string;

  /* Form */
  public advertisementForm = this.fb.group({
    type: ['1: piso', [Validators.required]],
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
    images: [''],
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
    private _advertisementService: AdvertisementService,
    private _userService: UserService,
    public fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit() {
    this._route.params.subscribe((params: Params) => {
      if (params.id) this.id = params.id;
    });

    this.getUser();
    if (this.id) this.getAdvertisement();
  }

  /** Recoge los datos del anuncio */
  public getAdvertisement() {
    this._advertisementService.getAdvertisement(this.id).subscribe(
      response => {
        const advertisement = response.advertisement;
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
      }
    );
  }

  /** Recoge los datos del usuario */
  public getUser() {
    const localUser = JSON.parse(localStorage.getItem('user'));
    this._userService.getUser(localUser.uid).subscribe(
      response => {
        this.myUser = response.user;
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  /** Selecciona los ficheros de imagenes */
  public async selectFile(event: any): Promise<void> {
    const files = event.target.files;

    for (let file of files) {
      const base64: any = await this.fileToBase64(file);
      this.selectedFiles.push(base64);
    }
  }

  /** Convierte ficheros a base64 */
  public fileToBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
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

  /** Llama al servicio para añadir un usuario */
  public addAdvertisement(params: any) {
    this._advertisementService.addAdvertisement(params).subscribe((response: any) => {
      // Agregamos el anuncio al array del usuario
      this.myUser.advertisements.push(response.advertisement._id);
      const update = {
        _id: this.myUser._id,
        advertisements: this.myUser.advertisements
      }
      this._userService.updateUser(update).subscribe((response: {}) => {
      });

      // Navegamos al detalle del anuncio
      this._router.navigate(['/advertisement/' + response.advertisement._id]);
    });
  }

  /** Llama al servicio para añadir un usuario */
  public updateAdvertisement(params: any) {
    this._advertisementService.updateAdvertisement(params).subscribe(
      response => {
        this._router.navigate(['/advertisement/' + this.id]);
      }
    );
  }
  
  /** Recoge los datos del formulario para crear/editar el anuncio */
  public createOrEditAdvertisement() {
    this.isSubmitted = true;
    if (this.advertisementForm.valid) {
      const params = {
        isCompany: this.myUser._type === 'company',
        published: false,
        lastModified: new Date,
        author: this.myUser._id,
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
        otherServices: this.getOtherServices()
      };

      // Llama al servicio de edición o creación
      if (this.id) {
        Object.assign(params, {
          _id: this.id
        });

        this.updateAdvertisement(params);
      } else {
        Object.assign(params, {
          images: this.selectedFiles
        });
        this.addAdvertisement(params);
      }
    }
  }

}
