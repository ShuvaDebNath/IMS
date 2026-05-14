import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dynamic-search-panel',
  templateUrl: './dynamic-search-panel.component.html',
  styleUrls: ['./dynamic-search-panel.component.scss']
})
export class DynamicSearchPanelComponent {

  @Input() fields: any[] = [];

  @Input() formGroup!: FormGroup;

  // STEP 5
  @Output() search = new EventEmitter<void>();

  @Output() clear = new EventEmitter<void>();

}