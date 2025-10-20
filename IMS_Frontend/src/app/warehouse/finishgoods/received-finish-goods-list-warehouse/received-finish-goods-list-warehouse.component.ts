import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import swal from 'sweetalert2';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { Router } from '@angular/router';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'app-received-fg-list-warehouse',
  templateUrl: './received-finish-goods-list-warehouse.component.html',
  styleUrls: ['./received-finish-goods-list-warehouse.component.css'],
  imports: [FormsModule, CommonModule, TableModule, InputTextModule, DialogModule, ButtonModule],
})
export class ReceivedFinishGoodsWarehouseComponent implements OnInit {
  receivedFinishGoodsList: any[] = [];
  StockLocationItems: any[] = [];
  detailsData: any = null;
  isDetailsVisible = false;
  isDetailsVisible_for_Receive = false;

  constructor(
    private getDataService: GetDataService,
    private gs: GlobalServiceService,
    private title: Title,
    private router: Router,
    private dme: DoubleMasterEntryService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Received Finish Goods List');
    this.loadReceivedFinishGoodsList();
  }

  loadReceivedFinishGoodsList(): void {
    const sentByStr = localStorage.getItem('userId');
    const sentBy = sentByStr ? Number(sentByStr) : null;

    const procedureData = {
      procedureName: 'usp_FinishGoods_Send_and_Receive_InitialData',
      parameters: { Type: '' }
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.receivedFinishGoodsList = JSON.parse(results.data).Tables1;
        } else if (results.msg === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        }
      },
      error: () => {}
    });
  }

 

  onDetails(row: any): void {
    const procedureData = {
      procedureName: 'usp_FinishGoods_Send_and_Receive_GetDataById',
      parameters: { ExportMasterID: row.ExportMasterID }
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          const items = JSON.parse(results.data).Tables1;
          this.detailsData = {
            ExportMasterID: row.ExportMasterID,
            ExportNumber: row.ExportNumber,
            Export_Date: row.Export_Date,
            Note: row.MasterNote,
            Total_Qty: row.Total_Qty,
            Total_Bag: row.Total_Bag,
            Total_Roll: row.Total_Roll,
            Total_Piece: row.Total_Piece,
            Total_KG: row.Total_KG,
            Net_Weight: row.Net_Weight,
            SendBy: row.SendBy,
            ReceiveBy: row.ReceiveBy,
            TotalAcceptQty: row.TotalAcceptQty,
            TotalAcceptRollBagQty: row.TotalAcceptRollBagQty,
            Items: items
          };
          this.isDetailsVisible = true; 
        } else if (results.msg === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
          swal.fire('Error!', 'Failed to load details.', 'info');
        }
      },
      error: () => swal.fire('Error!', 'An error occurred while fetching details.', 'info')
    });
  }

}
