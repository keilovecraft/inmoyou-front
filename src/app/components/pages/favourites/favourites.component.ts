import { Component, OnInit } from '@angular/core';
import { Advertisement } from 'src/app/models/advertisement.model';
import { AdvertisementService } from 'src/app/services/advertisement.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.sass'],
  providers: [AdvertisementService, UserService]
})
export class FavouritesComponent implements OnInit {

  /** Id del usuario */
  public userId: string;
  /** Listado de favoritos */
  public advertisements: Array<Advertisement> = [];

  constructor(
    private _advertisementService: AdvertisementService,
    private _userService: UserService
  ) { }

  ngOnInit(): void {
    // Nos traemos los datos del usuario
    const actualUser: any = JSON.parse(localStorage.getItem('user'));
    // Traemos el usuario que tiene ese authId
    if (actualUser) {
      this._userService.getUser(actualUser.uid).subscribe((response: any) => {
        this.userId = response.user._id;
        const myFavs = response.user.favourites;

        // Añadimos cada anuncio al array
        myFavs.forEach(el => {
          this.getAdvertisementById(el);
        });
      });
    };
  }

  /** Trae los datos de cada anuncio y los añade al array */
  public getAdvertisementById(id: string) {
    this._advertisementService.getAdvertisement(id).subscribe(
      response => {
        response.advertisement.description = response.advertisement.description.length > 200 ? `${response.advertisement.description.substring(0, 200)}...` : response.advertisement.description;

        this.advertisements.push(response.advertisement);
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  /** Elimina un anuncio del array */
  public removeFav(id: string) {
    this.advertisements = this.advertisements.filter(item => item._id !== id);
    // Lo eliminamos tambien del array de usuario
    const updateData = {
      _id: this.userId,
      favourites : this.advertisements
    }
    this._userService.updateUser(updateData).subscribe((response: {}) => {
    });
  }

}
