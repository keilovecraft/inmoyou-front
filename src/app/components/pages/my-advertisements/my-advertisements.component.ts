import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Advertisement } from 'src/app/models/advertisement.model';
import { AdvertisementService } from 'src/app/services/advertisement.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-my-advertisements',
  templateUrl: './my-advertisements.component.html',
  styleUrls: ['./my-advertisements.component.sass'],
  providers: [AdvertisementService, UserService]
})
export class MyAdvertisementsComponent implements OnInit {

  public advertisements: Array<Advertisement> = [];

  constructor(
    private _advertisementService: AdvertisementService,
    private _userService: UserService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    // Nos traemos los datos del usuario
    const actualUser: any = JSON.parse(localStorage.getItem('user'));
    // Traemos el usuario que tiene ese authId
    if (actualUser) {
      this._userService.getUser(actualUser.uid).subscribe((response: any) => {
        const myAds = response.user.advertisements;

        // Añadimos cada anuncio al array
        myAds.forEach(el => {
          this.getAdvertisementById(el);
        });
      });
    };
  }

  /** Navega a Crear anuncio */
  public navigateToCreate() {
    this._router.navigate(['/advertisement-create']);
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
  public removeFromArray(id: string) {
    this.advertisements = this.advertisements.filter(item => item._id !== id);
  }

}
