import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { cities } from '../../../models/cities';
import { typesHouse } from '../../../models/typesHouse';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.sass']
})
export class SearchComponent {

  public typesHouse: typeof typesHouse = typesHouse;
  public typesLessors: Array<string> = ['Particular', 'Inmobiliaria'];
  public cities: Array<string> = cities;
  public searchForm = this.fb.group({
    type: ['all', [Validators.required]],
    lessor: ['all', [Validators.required]],
    city: ['all', [Validators.required]]
  });

  constructor(
    public fb: FormBuilder,
    private _router: Router
  ) { }

  /** Envia los datos al formulario */
  public onSubmit() {
    let params:Object = {};

    if (this.searchForm.value.type !== 'all') {
      Object.assign(params, {type: this.searchForm.value.type});
    }
    if (this.searchForm.value.lessor !== 'all') {
      Object.assign(params, {lessor: this.searchForm.value.lessor});
    }
    if (this.searchForm.value.city !== 'all') {
      Object.assign(params, {city: this.searchForm.value.city});
    }

    this._router.navigate(['/advertisements', params]);
  }

}
