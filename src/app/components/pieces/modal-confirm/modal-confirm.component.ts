import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-modal-confirm',
  templateUrl: './modal-confirm.component.html',
  styleUrls: ['./modal-confirm.component.sass']
})
export class ModalConfirmComponent implements OnInit{

  @Output() action = new EventEmitter();

  ngOnInit() {
    this.openModal();
  }

  /** Abre la modal */
  public openModal()
  {
    var option = confirm("¿Estás seguro que quieres eliminarlo?");
    this.action.emit(option);
  }

}
