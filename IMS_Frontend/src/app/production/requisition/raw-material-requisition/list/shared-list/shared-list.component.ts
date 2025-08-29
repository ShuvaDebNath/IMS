import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';

/** Column typing used by the template (supports date/text/number, custom format & align) */
export type ColumnType = 'text' | 'date' | 'number';
export interface ColumnDef {
  field: string;
  header: string;
  type?: ColumnType;                  // e.g. 'date'
  dateFormat?: string;                // e.g. 'dd-MMM-yyyy' (defaults to this)
  align?: 'start' | 'center' | 'end'; // optional per-column text align
}

@Component({
  standalone: true,
  selector: 'app-shared-list',
  templateUrl: './shared-list.component.html',
  styleUrls: ['./shared-list.component.css'],
  imports: [CommonModule, TableModule, InputTextModule],
})
export class SharedListComponent {
  /** show SL column (1,2,3,...) */
  @Input() showSerial = true;

  /** table rows */
  @Input() data: any[] = [];

  /** column definitions (now strongly typed) */
  @Input() columns: ColumnDef[] = [];

  /** fields used by PrimeNG global filter */
  @Input() globalFilterFields: string[] = [];

  /** show action buttons column */
  @Input() showActions = true;

  /** actions */
  @Output() edit   = new EventEmitter<any>(); // row object
  @Output() delete = new EventEmitter<any>();
  @Output() details= new EventEmitter<any>();

  onEdit(row: any)    { this.edit.emit(row); }
  onDelete(row: any)  { this.delete.emit(row); }
  onDetails(row: any) { this.details.emit(row); }
}
