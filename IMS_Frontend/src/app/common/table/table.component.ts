import { Component,EventEmitter,Input, Output } from '@angular/core';
export interface ColumnDefinition {
  title: string;
  dataIndex: string;
  key: string;
  render?: (item: any) => string;
}
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})

export class TableComponent {
  @Input() data: any[] = [];
  @Input() columns: ColumnDefinition[] = [];
  @Input() isLoading: boolean = false;
   @Output() editClick = new EventEmitter<any>(); 

  onEdit(item: any): void {
    console.log('Edit clicked in table:', item);
    this.editClick.emit(item); 
  }
    onView(item: any): void {
    console.log('Edit clicked in table:', item);
    this.editClick.emit(item); 
  }

  get showSkeleton(): boolean {
    return this.isLoading || !this.data || this.data.length === 0;
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByColumnKey(index: number, column: ColumnDefinition): string {
    return column.key;
  }

  getColumnValue(item: any, column: ColumnDefinition): any {
    return item[column.dataIndex] || '---';
  }

  shouldRenderActions(column: ColumnDefinition): boolean {
    return column.dataIndex === 'action' && !!column.render;
  }

}
