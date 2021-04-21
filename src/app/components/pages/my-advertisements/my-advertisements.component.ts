import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Advertisement } from 'src/app/models/advertisement.model';
import { AdvertisementService } from 'src/app/services/advertisement.service';
import { EventBusService, EventData } from 'src/app/services/event.service';
import { FirebaseStorageService } from 'src/app/services/firestore.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-my-advertisements',
  templateUrl: './my-advertisements.component.html',
  styleUrls: ['./my-advertisements.component.sass'],
  providers: [AdvertisementService, UserService]
})
export class MyAdvertisementsComponent implements OnInit {

  public advertisements: Array<Advertisement> = [];
  public sessionUser: any;
  private adsToRemove: Array<string> = [];

  constructor(
    private _eventBusService: EventBusService,
    private _advertisementService: AdvertisementService,
    private _userService: UserService,
    private _firebaseStorageService: FirebaseStorageService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    const advertisements: Array<Promise<Advertisement>> = [];
    // Nos traemos los datos del usuario
    this.sessionUser = JSON.parse(localStorage.getItem('mongoUser'));
    if (this.sessionUser) {
      this.showLoading(true); 
      // Procesamos cada anuncio
      this.sessionUser.advertisements.forEach((item) => {
        const addPromise = this.getAdvertisementById(item);
        advertisements.push(addPromise);
      });

      Promise.all(advertisements)
        .then((values: Array<Advertisement>) => {
          this.advertisements = [];
          values.forEach((ad: Advertisement) => {
            if (ad !== null) {
              this.advertisements.push(ad);
            }
          });
          this.adsToRemove.forEach((ad) => {
            this.deleteAdvertisement(ad);
          })
          this.adsToRemove = [];
          this.showLoading(false);
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

  /** Navega a Crear anuncio */
  public navigateToCreate() {
    this._router.navigate(['/advertisement-create']);
  }

  /** Trae los datos de cada anuncio y los añade al array */
  public getAdvertisementById(id: string): Promise<Advertisement> {
    return new Promise((res, rej) => {
      this._advertisementService.getAdvertisement(id).subscribe(
        response => {
          response.advertisement.description = response.advertisement.description.length > 200 ? `${response.advertisement.description.substring(0, 200)}...` : response.advertisement.description;

          res(response.advertisement);
        },
        error => {
          // El anuncio ya no existe. Entonces, lo eliminamos de nuestro array.
          this.adsToRemove.push(id);
          res(null);
        }
      );
    })
  }

  /** Borra el anuncio y lo elimina del usuario */
  public deleteAdvertisement(adId: string) {
    this.advertisements = this.advertisements.filter(item => item._id !== adId);
    this._advertisementService.deleteAdvertisement(adId);
    this.updateUser(adId);
  }

  /** Actualiza el usuario en mongo para eliminar el anuncio */
  public updateUser(adId: string) {
    const arrAdvertisements = this.sessionUser.advertisements.filter(item => item !== adId);
    const updateData = {
      _id: this.sessionUser._id,
      advertisements : arrAdvertisements
    }
    this._userService.updateUser(updateData)
      .then((value: any) => {
        localStorage.removeItem('mongoUser');
        localStorage.setItem('mongoUser', JSON.stringify(value.user));
        this._firebaseStorageService.removePhotos(this.sessionUser._id, adId)
          .then(() => {
            this.showLoading(false);
          })
          .catch((err) => {
            console.error(err);
          });
      });
  }

}
