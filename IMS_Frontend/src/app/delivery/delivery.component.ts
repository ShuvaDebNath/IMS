import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import Swal from 'sweetalert2';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { InputNumberModule } from 'primeng/inputnumber';
import { Goods_Delivery_serviceService } from '../services/delivery/Goods_Delivery_service.service';
import { ReportService } from '../services/reportService/report-service.service';

@Component({
  standalone: true,
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css'],
  imports: [
    FormsModule,
    InputTextModule,
    InputNumberModule,
    ReactiveFormsModule,
    CommonModule,
    TableModule,
    ButtonModule,
    DividerModule,
    FieldsetModule,
    DropdownModule,
  ],
})
export class DeliveryComponent implements OnInit {
  PITypeList: any[] = [
    { value: 1, text: 'LC' },
    { value: 2, text: 'Cash' },
  ];
  PIList: any[] = [];
  StoreLocation: any[] = [];
  PITypeID!: number;
  SearchFormgroup!: FormGroup;
  Formgroup!: FormGroup;
  Delivers!: [];
  datePipe = new DatePipe('en-US');

  constructor(
    private service: MasterEntryService,
    private deliveryService: Goods_Delivery_serviceService,
    private getDataService: GetDataService,
    private gs: GlobalServiceService,
    private title: Title,
    private fb: FormBuilder,
    private reportService: ReportService,
  ) {}

  ngOnInit() {
    this.title.setTitle('Delivery');
    this.GenerateSearchFrom();
  }

  GenerateSearchFrom() {
    this.SearchFormgroup = this.fb.group({
      PINo: ['', [Validators.required]],
      PIId: ['', [Validators.required]],
      PIType: ['', [Validators.required]],
    });

    this.Formgroup = this.fb.group({
      PIStatus: ['', [Validators.required]],
      RestQty: ['', [Validators.required]],
      Chalan_No: [''],
      LCNo: [''],
      IsCash: ['', [Validators.required]],

      ItemArray: this.fb.array([]),
    });
  }

  getControls() {
    return (this.Formgroup.get('ItemArray') as FormArray).controls;
  }

  onChange($event: DropdownChangeEvent) {
    let model = new GetDataModel();
    model.procedureName = 'usp_Get_Delivery_Initial_Data';
    model.parameters = {
      TypeId: $event.value,
    };
    this.service.GetInitialData(model).subscribe((res: any) => {
      if (res.status) {
        let DataSet = JSON.parse(res.data);
        this.PIList = DataSet.Tables1;
        this.StoreLocation = DataSet.Tables2;
      } else {
        if (res.msg == 'Invalid Token') {
          this.gs.Logout();
        } else {
        }
      }
    });
  }
  SetMeterValue(event: any, item: any) {
    var deliverQty = 0;
    
    let listData = this.Formgroup.controls['ItemArray'].value;
    
    listData.forEach((e:any)=>{
      deliverQty+=e.Delivered;      
    });

    if (
      deliverQty >
      parseFloat(this.Formgroup.controls['RestQty'].value)
    ) {
      Swal.fire('Info', 'Deliverable Excced.', 'info');
      item.controls['Delivered'].setValue(0);
      return;
    }

    let unitID = item.controls['Unit_ID'].value;
    let value = unitID == 2 ? event.target.value * 1.09361 : 0;
    //item.controls["Delivered"].setValue(value);
  }
  GetPIByPID() {
    let model = new GetDataModel();
    model.procedureName = 'usp_ProformaInvoice_DeliveryInfoByPIId';
    model.parameters = {
      TypeId: this.SearchFormgroup.controls['PIId'].value,
    };
    console.log(model);
    this.Formgroup.setControl('items', this.fb.array([]));

    this.service.GetInitialData(model).subscribe((res: any) => {
      if (res.status) {
        let DataSet = JSON.parse(res.data);
        this.Delivers = DataSet.Tables1;

        this.Formgroup.controls['PIStatus'].setValue(
          DataSet.Tables1[0].IsMPI == 0 ? 'LC' : 'Cash'
        );
        this.Formgroup.controls['RestQty'].setValue(
          DataSet.Tables1[0].Unit_ID == 2
            ? DataSet.Tables1[0].DeliverableQty_In_Meter
            : DataSet.Tables1[0].DeliverableQty
        );
        this.Formgroup.controls['LCNo'].setValue(DataSet.Tables1[0].LC_No);
        this.Formgroup.controls['IsCash'].setValue(DataSet.Tables1[0].CR_NO);

        // Set Chalan_No from the dataset (may come in Tables2 or Tables1 depending on stored proc)
        const chalanFromTables2 =
          DataSet.Tables2 && DataSet.Tables2.length > 0
            ? DataSet.Tables2[0].Chalan_No
            : null;
        const chalanFromTables1 =
          DataSet.Tables1 && DataSet.Tables1.length > 0
            ? DataSet.Tables1[0].Chalan_No
            : null;

        const chalanValue = chalanFromTables2 ?? chalanFromTables1 ?? '';
        if (this.Formgroup.controls['Chalan_No']) {
          this.Formgroup.controls['Chalan_No'].setValue(chalanValue);
        }

        // If nothing is deliverable, inform the user and stop further processing
        const currentRest = Number(
          this.Formgroup.controls['RestQty'].value ?? 0
        );
        if (!currentRest || currentRest === 0) {
          Swal.fire('Info', 'No deliverable quantity available.', 'info');
          // ensure ItemArray is empty
          const clearArray = this.Formgroup.get('ItemArray') as FormArray;
          while (clearArray && clearArray.length !== 0) {
            clearArray.removeAt(0);
          }
          return;
        }

        let itemarray = this.Formgroup.get('ItemArray') as FormArray;
        while (itemarray.length !== 0) {
          itemarray.removeAt(0);
        }
        console.log(DataSet);
        
        DataSet.Tables1.forEach((item: any) => {
          itemarray.push(
            this.fb.group({
              PI_Detail_ID: [item.PI_Detail_ID],
              Date: [new Date()],
              Ordered: [0],
              Delivered: [0, [Validators.required]],
              Roll: [0, [Validators.required]],
              Remark: [''],
              Chalan_No: [DataSet.Tables2[0].Chalan_No ?? 0],
              Item_ID: [item.Item_ID, [Validators.required]],
              Stock_Location_ID: [''],
              Description: [item.Description],
              Color: [item.Color, [Validators.required]],
              Packaging: [item.Packaging, [Validators.required]],
              Measurement: [item.Measurement, [Validators.required]],
              ActualArticle: [item.ActualArticle, [Validators.required]],
              UndeliveredQty: [
                item.Unit_ID == 2
                  ? item.UndeliveredQty_In_Meter
                  : item.UndeliveredQty,
              ],
              UnitName: [item.UnitName],
              Unit_ID: [item.Unit_ID, [Validators.required]],
              Stock: [item.Stock],
              Stock_In_Meter: [item.Stock_In_Meter],
              RollBalance: [item.Roll],
              Bag: [item.Bag],
              Deliverd_In_Meter: [0],
            })
          );
        });
      } else {
        if (res.msg == 'Invalid Token') {
          this.gs.Logout();
        } else {
        }
      }
    });
  }

  Save() {
     if (this.Formgroup.invalid) {
          Swal.fire(
            'Invlid Inputs!',
            'Form is Invalid!',
            'info'
          );
          return;
        }
    console.log(this.Formgroup.controls['ItemArray'].value);
    let listData = this.Formgroup.controls['ItemArray'].value;
    let restQty = this.Formgroup.controls['RestQty'].value;
    let sum = 0;
    listData.forEach((element: any) => {
      sum += element.Delivered;
      console.log(element.Delivered);
      
      if (element.Unit_ID == 2) {
        element.Deliverd_In_Meter = element.Delivered;
        element.Delivered = element.Deliverd_In_Meter * 1.09361;
      }
    });
    
    if (sum > restQty) {
      Swal.fire('Save Fail!', 'Deliverable Excced.', 'info');
      return;
    }

    let unAllowedList = listData.filter(
      (x: any) =>
        (x.Unit_ID != 2 && x.Delivered > x.StockBalance) ||
        (x.Unit_ID == 2 && x.Deliverd_In_Meter > x.Stock_In_MeterBalance)
    );

    console.log(unAllowedList,listData);
    if (unAllowedList.length > 0) {
      Swal.fire('Save Fail!', 'Stock Unavailable.', 'info');
      return;
    }

    this.deliveryService.SaveData(listData).subscribe((res) => {
        if (res.messageType == 'Success' && res.status) {
        Swal.fire(res.messageType, res.message, 'success').then(() => {
          // After successful save, prompt user to view/download the Delivery Challan report
          this.ReportViewerOptionsBySwal();
          this.ngOnInit();
        });
      } else {
        if (!res.isAuthorized) {
          this.gs.Logout();
        } else {
          Swal.fire(res.messageType, res.message, 'info');
        }
      }
    });
  }

   ReportViewerOptionsBySwal(reportType?: string) {
        var actionType = '';
        const item: any = {
          Chalan_No:
            (this.Formgroup && this.Formgroup.controls['Chalan_No']
              ? this.Formgroup.controls['Chalan_No'].value
              : '') || ''
        };
        Swal.fire({
          title: 'Please select what you want to do!!',
          icon: 'info',
          showCancelButton: false,
          showConfirmButton: false,
          allowOutsideClick: true,
          // Put Swal container/popup on top of other app modals by assigning high z-index classes
          customClass: {
            container: 'swal-container-high',
            popup: 'swal-popup-high',
          },
          html: `
            <div style="display: flex; justify-content: center; gap: 10px;">
              <button id="view" class="swal2-confirm swal2-styled" style="background:green">Excel</button>
              <button id="download" class="swal2-confirm swal2-styled" style="background:red">PDF</button>
              <button id="print" class="swal2-confirm swal2-styled" style="background:blue">Word</button>
            </div>
          `,
        });
  
        // Add event listeners for buttons after Swal opens
        Swal.getPopup()
          ?.querySelector('#view')
          ?.addEventListener('click', () => {
              // Close the selection Swal first so the report-service loader Swal isn't immediately closed.
              Swal.close();
              this.reportService.PrintDeliveryChallanReport(item, 'excel', true);
            });
  
        Swal.getPopup()
          ?.querySelector('#download')
          ?.addEventListener('click', () => {
              // Close selection modal first, then trigger report. This prevents the
              // selection's Swal.close() from closing the loader Swal opened by the report service.
              Swal.close();
              this.reportService.PrintDeliveryChallanReport(item, 'pdf', true);
            });
  
        Swal.getPopup()
          ?.querySelector('#print')
          ?.addEventListener('click', () => {
              Swal.close();
              this.reportService.PrintDeliveryChallanReport(item, 'word', true);
            });
  
        // The caller-specific reportType is included in `item` so the report service
        // can dispatch the correct report variant based on that flag.
      }
}
