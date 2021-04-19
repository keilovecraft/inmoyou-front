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
      // Nos traemos los datos del usuario
      if (user) {
        this._userService.getUser(user.uid).subscribe((response: any) => {
          this.isAdmin = response.user.admin;
        });
      };
    });
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
