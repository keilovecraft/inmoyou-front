import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.sass'],
  providers: [UserService]
})
export class ProfileCardComponent implements OnInit {

  @Input() public id: string;

  public user: User;


  constructor(
    private _userService: UserService,
  ) { }

  ngOnInit() {
    this.getUser(this.id);
  };

  /** Trae los datos del usuario */
  public getUser(id:string) {
    this._userService.getUser(id).subscribe(
      response => {
        this.user = response.user;
      },
      error => {
        console.log(<any>error);
      }
    );
  }

}
