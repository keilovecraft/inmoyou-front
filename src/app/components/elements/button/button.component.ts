import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.sass']
})
export class ButtonComponent {
  @Input() public id: string = '';
  @Input() public type: string = '';
  @Input() public isDisabled: boolean = false;
  @Input() public text: string = '';

  @Output() action = new EventEmitter();

  /** Emite el click del botón */
  buttonClicked() {
    this.action.emit();
  }

}
