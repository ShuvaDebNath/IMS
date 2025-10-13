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
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  standalone: true,
  selector: 'app-received-fg-list-production',
  templateUrl: './received-finish-goods-list-production.component.html',
  styleUrls: ['./received-finish-goods-list-production.component.css'],
  imports: [FormsModule, CommonModule, TableModule, InputTextModule, DialogModule, ButtonModule,QRCodeModule],
})
export class ReceivedFinishGoodsProductionComponent implements OnInit {
  receivedFinishGoodsList: any[] = [];
  StockLocationItems: any[] = [];
  detailsData: any = null;
  isDetailsVisible = false;
  isDetailsVisible_for_Receive = false;

  selectedItemForQr: any = null;
isQrDialogVisible = false;
qrDataList: string[] = [];

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
            Export_Date: items[0].Export_Date,
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
          swal.fire('Error!', 'Failed to load details.', 'error');
        }
      },
      error: () => swal.fire('Error!', 'An error occurred while fetching details.', 'error')
    });
  }

  generateQrCodes(item: any): void {
  this.qrDataList = [];
  const total = Number(item.AcceptedRollBag_Qty) || 0;

  for (let i = 1; i <= total; i++) {
    const qrInfo = {
      ExportNumber: this.detailsData.ExportNumber,
      ExportDate: this.detailsData.Export_Date,
      Article: item.Article_No,
      UoM: item.Roll_Bag,
      AcceptedQty: item.AcceptedQuantity,
      AcceptedRollBagQty: item.AcceptedRollBag_Qty,
      ProductionDate: item.Production_Date,
      RollNo: i,
    };
    this.qrDataList.push(JSON.stringify(qrInfo));
  }

  this.isQrDialogVisible = true;

  console.log(this.qrDataList);
  
}


}
