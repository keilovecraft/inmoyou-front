import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Global } from './globals';
import { User } from '../models/user.model';

@Injectable()
export class UserService {
  public url: string;
  public images: string;

  constructor(
    private _http: HttpClient
  ){
    this.url = Global.url;
    this.images = Global.images;
  }

  public httpHeader = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  public getUsers(): Observable<any> {
    return this._http.get(this.url+'/users');
  }

  public getUser(id: string): Observable<any> {
    return this._http.get(this.url+'/user/'+id);
  }

  public addUser(user: User, type: string): Observable<any>{
    let route: string;
    let params = JSON.stringify(user);

    if (type === 'people') {
      route = '/save-user';
    } else {
      route = '/save-company';
    }
    return this._http.post(this.url+route, params, this.httpHeader);
  }

  public updateUser(params: any) {
    const id = params._id;

    return this._http.put(this.url + '/user/'+id, params, this.httpHeader);
  }

}
