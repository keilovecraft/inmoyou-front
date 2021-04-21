import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { EventBusService } from './services/event.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {

  public showLoading: boolean = false;

  constructor(
    private _eventBusService: EventBusService,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit () {
    this._eventBusService.on('showLoading', (state) => {
      this.showLoading = state;
      this.cd.detectChanges();
    })
  }
}
