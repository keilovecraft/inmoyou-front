import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Advertisement } from 'src/app/models/advertisement.model';
import { AdvertisementService } from 'src/app/services/advertisement.service';
import { EventBusService, EventData } from 'src/app/services/event.service';
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
  private sessionUser: any = null;
  private favsToRemove: Array<string> = [];

  constructor(
    private _eventBusService: EventBusService,
    private _advertisementService: AdvertisementService,
    private _userService: UserService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    const favourites: Array<Promise<Advertisement>> = [];
    // Nos traemos los datos del usuario
    this.sessionUser = JSON.parse(localStorage.getItem('mongoUser'));
    this.userId = this.sessionUser._id;

    // Si es una compañía, no podemos acceder a favoritos
    if (this.sessionUser) {
      if (this.sessionUser._type === 'company') {
        this._router.navigate(['']);
        return;
      }

      this.showLoading(true);
      // Procesamos cada anuncio
      this.sessionUser.favourites.forEach((item) => {
        const favPromise = this.getAdvertisementById(item);
        favourites.push(favPromise);
      });

      Promise.all(favourites)
        .then((values: Array<Advertisement>) => {
          const arrPromise: Array<Promise<void>> = [];
          this.advertisements = [];
          values.forEach((ad: Advertisement) => {
            if (ad !== null) {
              this.advertisements.push(ad);
            }
          });
          this.favsToRemove.forEach((fav) => {
            const removePromise = this.removeFav(fav);
            arrPromise.push(removePromise);
          })

          Promise.all(arrPromise)
            .then(() => {
              this.favsToRemove = [];
              this.showLoading(false);
            })
            .catch((err) => {
              console.error(err);
              this.showLoading(false);
            })
          
        })
        .catch((err) => {
          this.showLoading(false);
        });
    };
  }

  /** Muestra el componente spinner */
  private showLoading (state: boolean) {
    this._eventBusService.emit(new EventData('showLoading', state))
  }

  /** Trae los datos de cada anuncio y los añade al array */
  public getAdvertisementById(id: string): Promise<Advertisement> {
    return new Promise((res, rej) => {
      this._advertisementService.getAdvertisement(id).subscribe(
        response => {
          if (response.advertisement.published) {
            response.advertisement.description = response.advertisement.description.length > 200 ? `${response.advertisement.description.substring(0, 200)}...` : response.advertisement.description;
            res(response.advertisement);
          } else {
            this.favsToRemove.push(id);
            res(null);
          }
        },
        error => {
          // El anuncio ya no existe. Entonces, lo eliminamos de nuestro array.
          this.favsToRemove.push(id);
          res(null);
        }
      );
    })
  }

  /** Elimina un anuncio del array */
  public removeFav(id: string): Promise<void> {
    return new Promise<void>((res, rej) => {
      this.advertisements = this.advertisements.filter(item => item._id !== id);
      // Lo eliminamos tambien del array de usuario
      const updateData = {
        _id: this.userId,
        favourites : this.advertisements
      }
      this._userService.updateUser(updateData)
        .then((value: any) => {
          localStorage.removeItem('mongoUser');
          localStorage.setItem('mongoUser', JSON.stringify(value.user));
          res();
        })
        .catch((err) => {
          rej(err);
        });
    })
  }

}
