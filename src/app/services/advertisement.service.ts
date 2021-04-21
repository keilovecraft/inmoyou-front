import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Advertisement } from '../models/advertisement.model';
import { environment } from '../../environments/environment';

@Injectable()
export class AdvertisementService {
  public url: string;

  public httpHeader = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  constructor(
    private _http: HttpClient
  ){
    this.url = environment.url;
  }

  public getAdvertisements(params: any): Observable<any> {
    return this._http.get(this.url+'/advertisements', { headers: this.httpHeader.headers, params: params });
  }

  public getAdvertisement(id: string): Observable<any> {
    return this._http.get(this.url+'/advertisement/'+id);
  }

  public addAdvertisement(ad: Advertisement): Observable<any> {
    let params = JSON.stringify(ad);
    return this._http.post(this.url+'/save-advertisement', params, this.httpHeader);
  }

  public deleteAdvertisement(id: string): Observable<any> {
    return this._http.delete(this.url+'/advertisement/'+id);
  }

  public updateAdvertisement(params: any) {
    const id = params._id;

    return this._http.put(this.url + '/advertisement/'+id, params, this.httpHeader);
  }

}
