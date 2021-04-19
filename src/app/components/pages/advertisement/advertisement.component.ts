import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Advertisement } from 'src/app/models/advertisement.model';
import { User } from 'src/app/models/user.model';
import { AdvertisementService } from 'src/app/services/advertisement.service';
import { UserService } from 'src/app/services/user.service';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-advertisement',
  templateUrl: './advertisement.component.html',
  styleUrls: ['./advertisement.component.sass'],
  providers: [AdvertisementService, UserService]
})
export class AdvertisementComponent implements OnInit {

  /** Configuración del swiper de imágenes */
  config: SwiperOptions = {
    pagination: { 
      el: '.swiper-pagination', 
      clickable: true 
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    }
  };

  /** Guarda los datos del usuario */
  public user: User;
  /** Detalle del anuncio */
  public advertisement: Advertisement;
  /** Id del anuncio */
  public id: string;
  /** Título del anuncio */
  public title: string;

  /** Muestra la modal de borrar */
  public deleteShow: boolean = false;
  /** Si puedo editar el anuncio */
  public isEdit: boolean = false;
  /** Si puedo hacer el anuncio favorito */
  public canFav: boolean = false;
  /** Si es un anuncio favorito */
  public isFav: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    private _userService: UserService,
    private _advertisementService: AdvertisementService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe((params: Params) => {
      if (params.id) this.id = params.id;
    });

    this.getData();
  }

  /** Trae los datos del anuncio */
  public getAdvertisement() {
    this._advertisementService.getAdvertisement(this.id).subscribe(
      response => {
        this.advertisement = response.advertisement;
        this.title = `${this.advertisement.type} en calle ${this.advertisement.address.street}, ${this.advertisement.address.number}`;
        // Vemos si es nuestro anuncio
        if (this.user && this.advertisement.author === this.user._id) {
          this.isEdit = true;
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  /** Método para traer los datos del usuario */
  public getData(){
    // Nos traemos los datos del usuario
    const actualUser: any = JSON.parse(localStorage.getItem('user'));
    // Traemos el usuario que tiene ese authId
    if (actualUser) {
      this._userService.getUser(actualUser.uid).subscribe((response: any) => {
        this.user = response.user;

        // Si somos particulares, lo podemos añadir como favorito
        if (this.user._type !== 'company') {
          this.canFav = true;
        }
        // Vemos si ya lo tenemos como favorito
        if (this.canFav) {
          this.isFav = this.user.favourites.includes(this.id);
        }

        // Recogemos los datos del anuncio
        this.getAdvertisement();
      });
    } else {
      // Recogemos los datos del anuncio
      this.getAdvertisement();
    }
  }

  /** Borra el anuncio y lo elimina del array del usuario */
  public deleteAdvertisement() {
    this._advertisementService.deleteAdvertisement(this.id).subscribe(
      response => {
        // Lo eliminamos del array de usuario
        const arrAdvertisements = this.user.advertisements.filter(item => item !== this.id);
        const updateData = {
          _id: this.user._id,
          advertisements : arrAdvertisements
        }
        this._userService.updateUser(updateData).subscribe((response: {}) => {
        });

        // Navegamos a mis anuncios
        this._router.navigate(['/my-advertisements']);
      },
      error => {
        console.log(<any>error);
      }
      );
  }

  /** Accion que recoge los datos de la modal para borrar un anuncio */
  public deleteAction(option: boolean) {
    if(option) {
      this.deleteAdvertisement();
    }
    this.deleteShow = false;
    this.cd.detectChanges();
  }

  /**
   * Muestra el componente de modal para borrar
   */
   public showModalDelete() {
    this.deleteShow = true;
  }

  /** Navega a editar el anuncio */
  public editAction() {
    this._router.navigate(['/advertisement-edit/'+ this.id]);
  }

  /** Añade o elimina un anuncio de favorito */
  public favAction() {
    if (this.isFav) {
      // Eliminamos el elemento del array
      const arrFavourites = this.user.favourites.filter(item => item !== this.id);
      this.user.favourites = arrFavourites;
    } else {
      // Pusheamos nuestro id al array
      this.user.favourites.push(this.id);
    };

    // Creamos el objeto a editar con la información
    let updateData = {
      _id: this.user._id,
      _type: this.user._type,
      favourites : this.user.favourites
    };

    // Actualizar datos de usuario
    this._userService.updateUser(updateData).subscribe((response: {}) => {
      this.isFav = !this.isFav;
    });
  }

}
