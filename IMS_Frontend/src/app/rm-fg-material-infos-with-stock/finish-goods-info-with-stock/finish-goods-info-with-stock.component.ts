import { Component, ViewChild } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import swal from 'sweetalert2';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { Title } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';

@Component({
  standalone: true,
  selector: 'app-finish-goods-info-with-stock',
  templateUrl: './finish-goods-info-with-stock.component.html',
  styleUrls: ['./finish-goods-info-with-stock.component.css'],
  imports: [FormsModule, CommonModule, TableModule, InputTextModule, DialogModule, ButtonModule],
})
export class FinishGoodsInfoWithStockComponent {
  finishGoodsItemsWithStock: any[] = [];
  detailsData: any = null;
  StockLocationItems: any[] = [];
  selectedRow: any = null;
  stockInForm = {
    Item_ID: '',
    Stock_Location_ID: '',
    Stock_In: '',
    Roll_In: '',
    Bag_In: '',
    Note: '',
    Stock_Change_Date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
  };
  stockOutForm = {
    Item_ID: '',
    Stock_Location_ID: '',
    Stock_Out: '',
    Roll_Out: '',
    Bag_Out: '',
    Note: '',
    Stock_Change_Date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
  };
  isStockInVisible = false;
  isStockOutVisible = false;
  constructor(
    private getDataService: GetDataService,
    private masterEntyService: MasterEntryService,
    private gs: GlobalServiceService,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Finish Goods Info with Stock');
    this.loadFinishGoodsStockWithLocation();
  }

  loadFinishGoodsStockWithLocation(): void {
    const procedureData = {
      procedureName: 'usp_Finishgoodsinfos_with_Stock',
      parameters: {}
    };
    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.finishGoodsItemsWithStock = JSON.parse(results.data).Tables1;
          this.StockLocationItems = JSON.parse(results.data).Tables2;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        }
      },
      error: (err) => { },
    });
  }

  onStockIn(row: any) {
    this.selectedRow = row;
    this.stockInForm = {
      Item_ID: row.Item_ID,
      Stock_Location_ID: row.Stock_Location_ID,
      Stock_In: row.Quantity,
      Roll_In: row.Roll,
      Bag_In: row.Bag,
      Note: row.Note,
      Stock_Change_Date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
    };
    this.isStockInVisible = true;
  }

  onStockOut(row: any) {
    this.selectedRow = row;
    this.stockOutForm = {
      Item_ID: row.Item_ID,
      Stock_Location_ID: row.Stock_Location_ID,
      Stock_Out: row.Quantity,
      Roll_Out: row.Roll,
      Bag_Out: row.Bag,
      Note: row.Note,
      Stock_Change_Date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
    };
    this.isStockOutVisible = true;
  }

  onSaveStockIn() {

   this.masterEntyService.SaveSingleData(this.stockInForm,'tbl_stock').subscribe((res:any) => {
         
         if (res.status) {
          this.isStockInVisible = false;
           swal
             .fire({
               title: `${res.message}!`,
               text: `Save Successfully!`,
               icon: 'success',
               timer: 5000,
             })
             .then((result) => {               
               this.ngOnInit();
             });
   
         } else {
   
           if(res.message == 'Data already exist'){
             swal.fire('Data already exist', '', 'warning');
           }
           else if (res.message == 'Invalid Token') {
             this.isStockInVisible = false;
             swal.fire('Session Expierd!', 'Please Login Again.', 'info');
             this.gs.Logout();
           } else {
             this.isStockInVisible = false;
               swal.fire({
                 title: `Faild!`,
                 text: `Save Faild!`,
                 icon: 'error',
                 timer: 5000,
               });
           }
         }
       });
  }

  onSaveStockOut() {
     this.masterEntyService.SaveSingleData(this.stockOutForm,'tbl_stock').subscribe((res:any) => {
         
         if (res.status) {
          this.isStockOutVisible = false;
           swal
             .fire({
               title: `${res.message}!`,
               text: `Save Successfully!`,
               icon: 'success',
               timer: 5000,
             })
             .then((result) => {               
               this.ngOnInit();
             });
   
         } else {
   
           if(res.message == 'Data already exist'){
             this.isStockOutVisible = false;
             swal.fire('Data already exist', '', 'warning');
           }
           else if (res.message == 'Invalid Token') {
             this.isStockOutVisible = false;
             swal.fire('Session Expierd!', 'Please Login Again.', 'info');
             this.gs.Logout();
           } else {
             this.isStockOutVisible = false;
               swal.fire({
                 title: `Faild!`,
                 text: `Save Faild!`,
                 icon: 'error',
                 timer: 5000,
               });
           }
         }
       });
  }
}
