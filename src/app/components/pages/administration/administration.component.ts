import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Advertisement } from 'src/app/models/advertisement.model';
import { User } from 'src/app/models/user.model';
import { AdvertisementService } from 'src/app/services/advertisement.service';
import { EventBusService, EventData } from 'src/app/services/event.service';

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.sass'],
  providers: [AdvertisementService]

})
export class AdministrationComponent implements OnInit {

  public advertisements: Array<Advertisement>;

  constructor(
    private _advertisementService: AdvertisementService,
    private _router: Router,
    private _eventBusService: EventBusService
  ) { }

  ngOnInit(): void {
    this.showLoading(true);
    const sessionUser: User = JSON.parse(localStorage.getItem('mongoUser'));
    if (!sessionUser.admin) {
      this._router.navigate(['']);
      return;
    }
    const options = {
      published: false,
      orderBy: '-lastModified'
    };
    this.getAdvertisements(options);
  }

  /** Muestra el componente spinner */
  private showLoading (state: boolean) {
    this._eventBusService.emit(new EventData('showLoading', state))
  }

  /** Trae un array de anuncios sin publicar */
  public getAdvertisements(options?: any) {
    this._advertisementService.getAdvertisements(options).subscribe(
      response => {
        this.advertisements = response.advertisements.filter(ad => ad.published === false);
        this.advertisements.forEach(ad => {
          ad.description = ad.description.length > 200 ? `${ad.description.substring(0, 200)}...` : ad.description;
        });
        this.showLoading(false);
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  /** Elimina un anuncio del array */
  public removeFromArray(id: string) {
    this.advertisements = this.advertisements.filter(item => item._id !== id);
  }

}
