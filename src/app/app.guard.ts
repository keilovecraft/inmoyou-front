import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseAuthService } from './services/firebase.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  constructor (
    public _authService: FirebaseAuthService,
    public router: Router
  ) {}

  /** No permite navegar a las páginas que se indiquen en el routing si no estás loggado */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if (!this._authService.isLoggedIn) {
        this.router.navigate(['']);
        return false;
      }
      return true;
  }
}