import { Component, OnInit } from '@angular/core';
import { Advertisement } from 'src/app/models/advertisement.model';
import { AdvertisementService } from 'src/app/services/advertisement.service';

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
  ) { }

  ngOnInit(): void {
    this.getAdvertisements();
  }

  /** Trae un array de anuncios sin publicar */
  public getAdvertisements() {
    this._advertisementService.getAdvertisements().subscribe(
      response => {
        this.advertisements = response.advertisements.filter(ad => ad.published === false);
        this.advertisements.forEach(ad => {
          ad.description = ad.description.length > 200 ? `${ad.description.substring(0, 200)}...` : ad.description;
        });
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
