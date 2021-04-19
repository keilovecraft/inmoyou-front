import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { otherServices } from '../../../models/otherServices';
import { cities } from '../../../models/cities';
import { typesHouse } from '../../../models/typesHouse';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.sass']
})
export class FiltersComponent implements OnInit{
  @Input() public paramsFilters: any;
  @Output() filters = new EventEmitter();

public prices: Array<number> = [400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1500, 1600, 1700, 1800, 1900, 2000]

public filtersForm: FormGroup;
public isSubmitted: boolean = false;
public typesHouse: typeof typesHouse = typesHouse;
public typesLessors: Array<string> = ['Particular', 'Inmobiliaria'];
public cities: Array<string> = cities;
public pricesMin: Array<number> = this.prices;
public pricesMax: Array<number> = this.prices;
public sizes: Array<number> = [50, 60, 70, 80, 90, 100, 120];
public roomsArr: Array<number> = [0, 1, 2, 3, 4, 5];
public otherServices: typeof otherServices = otherServices;


  constructor(
    private readonly fb: FormBuilder
    ) {
    this.filtersForm = this.fb.group({
      type: [''],
      lessor: [''],
      city: [''],
      priceMin: [''],
      priceMax: [''],
      size: [''],
      rooms: [''],
      elevator: [false],
      garage: [false],
      trastero: [false],
      aire: [false],
      calefaccion: [false],
      pool: [false],
      portero: [false],
      gym: [false],
      animals: [false]
    });
  }

  ngOnInit() {
    if(this.paramsFilters.city) {
      this.filtersForm.patchValue({ city: this.paramsFilters.city });
    };
    if(this.paramsFilters.lessor) {
      this.filtersForm.patchValue({ lessor: this.paramsFilters.lessor });
    };
    if(this.paramsFilters.type) {
      this.filtersForm.patchValue({ type: this.paramsFilters.type });
    };
  }

  /** Envía el formulario */
  submitForm() {
    const newFilters: any = {
      type: this.filtersForm.get('type').value,
      lessor: this.filtersForm.get('lessor').value,
      city: this.filtersForm.get('city').value,
      priceMin: this.filtersForm.get('priceMin').value,
      priceMax: this.filtersForm.get('priceMax').value,
      size: this.filtersForm.get('size').value,
      rooms: this.filtersForm.get('rooms').value,
      services: []
    };

    let services: any = {
      aire: this.filtersForm.get('aire').value,
      animals: this.filtersForm.get('animals').value,
      calefaccion: this.filtersForm.get('calefaccion').value,
      elevator: this.filtersForm.get('elevator').value,
      garage: this.filtersForm.get('garage').value,
      gym: this.filtersForm.get('gym').value,
      pool: this.filtersForm.get('pool').value,
      portero: this.filtersForm.get('portero').value,
      trastero: this.filtersForm.get('trastero').value
    };
    services = Object.keys(services).filter((el)=>services[el]);

    otherServices.forEach(service => {
      services.forEach(s => { 
        if (service.value === s) {
          newFilters.services.push(service.name);
          return;
        };
      })
    });

    this.filters.emit(newFilters);
  }

}
