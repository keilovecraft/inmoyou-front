import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AdvertisementService } from 'src/app/services/advertisement.service';
import { EventBusService, EventData } from 'src/app/services/event.service';
import { FirebaseStorageService } from 'src/app/services/firestore.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.sass'],
  providers: [AdvertisementService, UserService]
})
export class CardComponent{
  @Input() public id: string;
  @Input() public image: string;
  @Input() public type: string;
  @Input() public street: string;
  @Input() public number: string;
  @Input() public price: string;
  @Input() public rooms: string;
  @Input() public meters: string;
  @Input() public descr: string;
  @Input() public showAuthor: boolean = true;
  @Input() public isEdit: boolean = false;
  @Input() public canFav: boolean = false;
  @Input() public isFav: boolean = false;
  @Input() public isAdmin: boolean = false;
  @Input() public published: boolean = true;
  /** Muestra la modal de borrar */
  public deleteShow: boolean = false;


  @Output() delete = new EventEmitter();
  @Output() edit = new EventEmitter();
  @Output() fav = new EventEmitter();
  @Output() approve = new EventEmitter();

  constructor(
    private _router: Router,
    private cd: ChangeDetectorRef,
    private _userService: UserService,
    private _eventBusService: EventBusService,
    private _advertisementService: AdvertisementService,
    private _firebaseStorageService: FirebaseStorageService,
  ) { }

  /** Navega hasta el detalle del anuncio */
  public navigateDetail() {
    this._router.navigate(['/advertisement/' + this.id]);
  }

  /** Borra el anuncio y lo elimina del usuario */
  public deleteAdvertisement() {
    this._advertisementService.deleteAdvertisement(this.id).subscribe(
      response => {
        // Nos traemos los datos del usuario
        let sessionUser: any = JSON.parse(localStorage.getItem('mongoUser'));
        if (sessionUser) {
          // Lo eliminamos del array de usuario
          const arrAdvertisements = sessionUser.advertisements.filter(item => item !== this.id);
          const updateData = {
            _id: sessionUser._id,
            advertisements : arrAdvertisements
          }
          this._userService.updateUser(updateData)
            .then((value: any) => {
              localStorage.removeItem('mongoUser');
              localStorage.setItem('mongoUser', JSON.stringify(value.user));
              this._firebaseStorageService.removePhotos(sessionUser._id, this.id)
                .then(() => {
                  this.showLoading(false);
                  // Navegamos hasta mis anuncios.
                  this.delete.emit(this.id);
                })
                .catch((err) => {
                  console.error(err);
                });
            })
            .catch((err) => {
              console.error(err);
            });
        }
      },
      error => {
        console.log(<any>error);
      }
      );
  }

  /** Accion que recoge los datos de la modal para borrar un anuncio */
  public deleteAction(option: boolean) {
    if(option) {
      this.showLoading(true);
      this.deleteAdvertisement();
    }
    this.deleteShow = false;
    this.cd.detectChanges();
  }

  /** Muestra el componente spinner */
  private showLoading (state: boolean) {
    this._eventBusService.emit(new EventData('showLoading', state))
  }
  
  /**
   * Muestra el componente de modal para borrar
   */
   public showModalDelete() {
    this.deleteShow = true;
  }

  /** Navega hasta la edición del anuncio */
  public editAction() {
    this._router.navigate(['/advertisement-edit/' + this.id]);
  }

  /** Emite la accion de favorito */
  public favAction() {
    this.fav.emit();
  }

  /** Aprueba el anuncio y lo emite */
  public approveAction() {
    const params = {
      _id: this.id,
      published: true
    }
    this._advertisementService.updateAdvertisement(params).subscribe(
      response => {}
    );
    this.approve.emit(this.id);
  }

}
