import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { FirebaseAuthService } from "../../../services/firebase.service";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.sass'],
  providers: [UserService]
})
export class MenuComponent implements OnInit {
  @Input() public isCompany: boolean = false;
  public isLogged: boolean = false;
  public isAdmin: boolean = false;

  constructor(
    public authService: FirebaseAuthService,
    private _router: Router,
    private _userService: UserService
  ) { }

  ngOnInit(): void {
    this.authService.ReturnState().subscribe((user) => {
      this.isLogged = (user) ? Object.entries(user).length > 0 : false;

      const imLogin = localStorage.getItem('imLogin') === 'true';
      // Nos traemos los datos del usuario
      if (imLogin) {
        this._userService.getUser(user.uid).subscribe((response: any) => {
          this.isAdmin = response.user.admin;
          localStorage.setItem('mongoUser', JSON.stringify(response.user));
          localStorage.removeItem('imLogin');

          this.getUserType();
        });
      };
    });
  }

  /** Obtenemos el tipo de usuario */
  public getUserType() {
    const mongoUser = JSON.parse(localStorage.getItem('mongoUser'));
    this.isAdmin = mongoUser.admin;
    this.isCompany = mongoUser._type === 'company';
  }

  /** Navega hasta la autenticación o cerrar sesión */
  public navigateToAuth() {
    if (this.isLogged) {
      this.authService.SignOut();
    } else {
      this._router.navigate(['/login']);
    }
  }

}
