import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Advertisement } from '../../../models/advertisement.model';
import { AdvertisementService } from '../../../services/advertisement.service';
import { EventBusService, EventData } from '../../../services/event.service';
import { orders } from '../../../models/orders';

@Component({
  selector: 'advertisements',
  templateUrl: './advertisements.component.html',
  styleUrls: ['./advertisements.component.sass'],
  providers: [AdvertisementService]
})

export class AdvertisementsComponent implements OnInit {

  public typesOrder: typeof orders = orders;
  public advertisements: Array<Advertisement> = [];
  public advertisementsFiltered: Array<Advertisement>;
  public numAdvertisements: number = 0;
  public gettingAds: boolean = false;
  public selectedOrder: string = '';
  orderForm: FormGroup;

  public filters: any = {}

  constructor(
    private _eventBusService: EventBusService,
    private _advertisementService: AdvertisementService,
    private _route: ActivatedRoute,
    private readonly fb: FormBuilder
  ) {
    this.orderForm = this.fb.group({
      order: ['date']
    });
  }

  ngOnInit(): void {
    this._route.params.subscribe((params: Params) => {

      this.filters = {
        city: params.city,
        type: params.type,
        lessor: params.lessor
      }
    });

    const options = {
      published: true,
      orderBy: '-lastModified'
    };

    this.showLoading(true);
    this.getAdvertisements(options);
  }

  /** Cambia el orden en el que se muestran los anuncios */
  changeOrder(event?: any) {
    if (event) {
      this.selectedOrder = event.substring(3, );
    }

    switch (this.selectedOrder) {
      case 'date':
        this.advertisementsFiltered.sort((val1, val2)=> { return val1.lastModified < val2.lastModified ? 1 : -1})
        break;

      case 'price-asc':
        this.advertisementsFiltered.sort((val1, val2)=> { return val1.price > val2.price ? 1 : -1})
        break;

      case 'price-desc':
        this.advertisementsFiltered.sort((val1, val2)=> { return val1.price < val2.price ? 1 : -1})
        break;

      case 'size-asc':
        this.advertisementsFiltered.sort((val1, val2)=> { return val1.size > val2.size ? 1 : -1})
        break;

      case 'size-desc':
        this.advertisementsFiltered.sort((val1, val2)=> { return val1.size < val2.size ? 1 : -1})
        break;
    }
  }

  /** Muestra el componente spinner */
  private showLoading (state: boolean) {
    this._eventBusService.emit(new EventData('showLoading', state))
  }

  /** Trae los anuncios en BD */
  public getAdvertisements(options: any) {
    this.gettingAds = true;
    this._advertisementService.getAdvertisements(options).subscribe(
      response => {
        this.advertisements = response.advertisements;
        this.advertisements.forEach(ad => {
          ad.description = ad.description.length > 200 ? `${ad.description.substring(0, 200)}...` : ad.description;
        });

        this.advertisementsFiltered = this.advertisements;
        this.filterAdvertisements();
        this.showLoading(false);
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  /** Filtra los anuncios */
  public filterAdvertisements(event?: any) {
    if(event) this.filters = event;
    const hasFilters = Object.values(this.filters).some(x => {
      return x !== undefined && x !== "" && (typeof x == "object" && Object.values(x).length > 0 || typeof x == 'string');
    });
    this.advertisementsFiltered = this.advertisements;

    if (hasFilters) {

      if (this.filters.city && this.filters.city !== '') {
        this.advertisementsFiltered = this.advertisementsFiltered.filter(ad => ad.address.city === this.filters.city);
      }
      
      if (this.filters.lessor && this.filters.lessor !== '') {
        if (this.filters.lessor === 'Particular') {
          this.advertisementsFiltered = this.advertisementsFiltered.filter(ad => !ad.isCompany);
        } else {
          this.advertisementsFiltered = this.advertisementsFiltered.filter(ad => ad.isCompany);
        }
      }
      
      if (this.filters.type && this.filters.type !== '') {
        this.advertisementsFiltered = this.advertisementsFiltered.filter(ad => ad.type === this.filters.type);
      }
      
      if (this.filters.priceMin && this.filters.priceMin !== '') {
        this.advertisementsFiltered = this.advertisementsFiltered.filter(ad => ad.price >= this.filters.priceMin);
      }
      if (this.filters.priceMax && this.filters.priceMax !== '') {
        this.advertisementsFiltered = this.advertisementsFiltered.filter(ad => ad.price <= this.filters.priceMax);
      }
      
      if (this.filters.size && this.filters.size !== '') {
        this.advertisementsFiltered = this.advertisementsFiltered.filter(ad => ad.size >= this.filters.size);
      }
      
      if (this.filters.rooms && this.filters.rooms !== '') {
        this.advertisementsFiltered = this.advertisementsFiltered.filter(ad => ad.rooms >= this.filters.rooms);
      }
      
      if (this.filters.services && this.filters.services.length > 0) {
        this.advertisementsFiltered = this.advertisementsFiltered.filter(ad => {
          return this.filters.services.every(adServices=> ad.otherServices.includes(adServices));
        });
      }
    }

    if (this.advertisementsFiltered) this.numAdvertisements = this.advertisementsFiltered.length;

    this.changeOrder();

    this.gettingAds = false;
  }

}
