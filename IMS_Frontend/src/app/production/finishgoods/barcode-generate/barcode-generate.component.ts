import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import swal from 'sweetalert2';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  standalone: true,
  selector: 'app-barcode-generate',
  templateUrl: './barcode-generate.component.html',
  styleUrls: ['./barcode-generate.component.css'],
  imports: [
    FormsModule,
    CommonModule,
    TableModule,
    InputTextModule,
    DialogModule,
    ButtonModule,
    QRCodeModule,
  ],
})
export class BarcodeGenerateComponent {
  qrDataList: any[] = [];
  ExportMasterID: any = '';
  constructor(
    private getDataService: GetDataService,
    private gs: GlobalServiceService,
    private title: Title,
    private router: Router,
    private activeLink: ActivatedRoute,
    private dme: DoubleMasterEntryService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Generate Barcode');

    let has = this.activeLink.snapshot.queryParamMap.has('ExportMasterID');
    if (has) {
      this.ExportMasterID =
        this.activeLink.snapshot.queryParams['ExportMasterID'];

      this.getDetails();
    } else {
    }
  }
  getDetails() {
    const procedureData = {
      procedureName: 'usp_FinishGoods_Send_and_Receive_GetDataById',
      parameters: { ExportMasterID: this.ExportMasterID },
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          const items = JSON.parse(results.data).Tables1;
          this.generateQrCodes(items);
        } else if (results.msg === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
          swal.fire('Error!', 'Failed to load details.', 'info');
        }
      },
      error: () =>
        swal.fire(
          'Error!',
          'An error occurred while fetching details.',
          'info'
        ),
    });
  }

  generateQrCodes(item: any): void {
    this.qrDataList = [];
    const total = item[0].AcceptedRollBag_Qty;
    console.log(total);
    for(var i = 0;i<total;i++){
      var element = item[0];
      const qrInfo = {
        ExportNumber: element.ExportNumber,
        ExportDate: element.Export_Date,
        Article: element.Article_No,
        UoM: element.Roll_Bag,
        AcceptedQty: element.AcceptedQuantity,
        AcceptedRollBagQty: element.AcceptedRollBag_Qty,
        ProductionDate: element.Production_Date,
        RollNo: i,
      };
      this.qrDataList.push(JSON.stringify(qrInfo));
    }   
    
  }
}