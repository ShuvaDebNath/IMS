// Create Page Component
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  FormArray,
  FormGroup,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import swal from 'sweetalert2';
import { DropdownModule } from 'primeng/dropdown';
import {
  CreateRmRequisitionItem,
  CreateRmRequisitionRequest,
} from 'src/app/models/requisition/rmRequisition';
import { startWith, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';

@Component({
  selector: 'app-generate-application',
  templateUrl: './generate-application.component.html',
  styleUrls: ['./generate-application.component.css'],
})
export class GenerateApplicationComponent {
  Formgroup!: FormGroup;
  isEdit = false;
  exportDate: Date = new Date();
  private destroy$ = new Subject<void>();
  private unitByArticleId = new Map<number, number | null>();
  rollOrBagOptions = [
    { label: 'Rolls', value: 'roll' },
    { label: 'Bags', value: 'bag' },
  ];
  reloadingArticles = false;
  LoadingPortList: any[] = [];
  DestinationPortList: any[] = [];
  RawMaterialList: any[] = [];
  WidthList: any[] = [];
  ColorList: any[] = [];
  UnitList: any[] = [];
  ExportMasterID: any = '';
  CustomerList: any[] = [];
  PIList: any[] = [];
  PIPreviewList: any[] = [];
  FormType: any[] = [
    {
      value: '0',
      text: '--Select Form Type--',
    },
    {
      value: 'PI Amendment Application',
      text: 'PI Amendment Application',
    },
    {
      value: 'Special Delivery Application',
      text: 'Special Delivery Application',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private doubleMasterEntryService: DoubleMasterEntryService,
    private getDataService: GetDataService,
    private gs: GlobalServiceService,
    private activeLink: ActivatedRoute,
    private title: Title,
    private masterEntryService: MasterEntryService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Export Raw Material');
    this.generateForm();
    this.loadPageData();

    let has = this.activeLink.snapshot.queryParamMap.has('ExportMasterID');
    if (has) {
      this.ExportMasterID =
        this.activeLink.snapshot.queryParams['ExportMasterID'];
      this.isEdit = true;
    } else {
      this.isEdit = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  generateForm() {
    this.Formgroup = this.fb.group({
      Date: ['', Validators.required],
      FormType: ['', Validators.required],
      Customer: ['', Validators.required],
      PINo: ['', Validators.required],
      items: this.fb.array([]),
    });
  }

  refreshArticles(): void {
    if (this.reloadingArticles) return;
    this.loadPageData();
  }

  loadPageData(): void {
    var userId = window.localStorage.getItem('userId');
    var ProcedureData = {
      procedureName: '[usp_Application_GetInitialData]',
      parameters: {
        userID: userId,
      },
    };

    this.getDataService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.CustomerList = JSON.parse(results.data).Tables1;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }

  get items(): FormArray {
    return this.Formgroup.get('items') as FormArray;
  }

  addItem() {
    const row = this.fb.group({
      article: this.fb.control<string | null>(null, Validators.required),
      description: this.fb.control<string>(''),
      color: this.fb.control<string | null>(null, Validators.required),
      width: this.fb.control<number | null>(null, Validators.required),
      rollOrBag: this.fb.control<'Rolls' | 'Bags'>('Rolls'),
      rollBagQty: this.fb.control<number>(0),
      unitId: this.fb.control<number | null>(null),
      qty: this.fb.control<number>(0, [Validators.required, Validators.min(1)]),
      weight: this.fb.control<number>(0),
      grossWeight: this.fb.control<number>(0),
    });

    row.get('qty')!.valueChanges.subscribe(() => {
      const qty = row.get('qty')!.value ?? 0;
      const weight = row.get('weight')!.value ?? 0;

      row.get('grossWeight')!.setValue(qty * weight, { emitEvent: false });
    });

    row.get('weight')!.valueChanges.subscribe(() => {
      const qty = row.get('qty')!.value ?? 0;
      const weight = row.get('weight')!.value ?? 0;

      row.get('grossWeight')!.setValue(qty * weight, { emitEvent: false });
    });

    this.items.push(row);
  }

  removeItem(i: number) {
    this.items.removeAt(i);
  }

  // totals (bind to UI + send to API)

  saveData(): void {
    console.log(this.Formgroup);

    if (this.Formgroup.invalid) {
      swal.fire(
        'Validation Error',
        'Please fill all required fields.',
        'warning'
      );
      return;
    }
    
    var userId = window.localStorage.getItem('userId');

    var fDate = new Date();
    const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();

    const formatted = `${mm}/${dd}/${yyyy}`;

    // 1) Form -> DTO (typed)
    const fv = this.Formgroup.value;

    var totalQty = 0;
    var totalDeliveredQuantity = 0;
    var totalAproveQty = 0;

    var SuperiorId = this.PIList.filter((e:any)=>e.value == this.Formgroup.value.PINo)[0].Superior_ID;

    const formArray = this.Formgroup.get('items') as FormArray;

    formArray.controls.forEach((group) => {
      const item = group.value;
      totalQty += Number(item.Quantity) || 0;
      totalDeliveredQuantity += Number(item.Delivered_Quantity) || 0;
      totalAproveQty += Number(item.ApproveQty) || 0;
    });

    const masterRow = {

      FormTypeId: this.Formgroup.value.FormType,
      TotalQuantity: totalQty,
      TotalDeliveredQuantity: totalDeliveredQuantity,
      TotalAppliedDelQty: totalAproveQty,
      Date: this.Formgroup.value.Date,
      SuperiorId: SuperiorId,
      UserId: userId,
      Status: 'Pending',
      FormTypeName: this.Formgroup.value.FormType,
      CreatedDate: formatted,
      PiNos: this.Formgroup.value.PINo,
    };

    const detailRows = fv.items.map((i: any) => ({
      PiNo:i.PINo,
      ArticleNo:i.Article,
      CustomerName:i.customer_name,
      ApplyDeliveryQty:i.Delivered_Quantity,
      TblPiMasterId:i.PI_Master_ID,
      TblPiDetailId:i.PI_Detail_ID,
      ActualArticleNo:i.ActualArticle,
      CreatedDate:formatted,
      CreatedById:userId,
      Colour:i.Color,
      Width:i.Width,
      Unit:i.Unit,
      Quantity:i.Quantity,
      UnitPrice:i.Unit_Price,
      UnitCommission:i.CommissionUnit,
      PaymentTerms:i.PaymentTerms,
      DeliveredQuantity:i.Delivered_Quantity,
    }));

    this.doubleMasterEntryService
      .SaveDataMasterDetailsGetId(
        detailRows, // fd (child rows)
        'tbl_po_form_detail', // tableName (child)
        masterRow, // fdMaster (master row)
        'tbl_po_form_master', // tableNameMaster (master)
        'Id', // columnNamePrimary (PK)
        'TblPoFormMasterId', // columnNameForign (FK in child)
        'Application', // serialType (your code uses it)
        'Application' // columnNameSerialNo (series name)
      )
      .subscribe({
        next: (res: any) => {
          console.log(res);

          const detailRowsForStockUpdate = fv.items.map((r: any) => ({
            RawMaterial_ID: r?.article,
            Stock_Out: Number(r?.qty ?? 0),
            ExportMasterID: res,
            Roll_Out:
              r?.Roll_Bag === 'roll' ? Number(r?.RollBag_Quantity ?? 0) : 0,
            Bag_Out:
              r?.Roll_Bag === 'bag' ? Number(r?.RollBag_Quantity ?? 0) : 0,
          }));
          this.doubleMasterEntryService
            .SaveData(detailRowsForStockUpdate, 'tbl_stock')
            .subscribe({
              next: (res) => {
                if (res.messageType === 'Success' && res.status) {
                  swal.fire('Success', 'Export saved successfully', 'success');
                  // Optionally reset form / navigate
                  this.Formgroup.reset({
                    requisitionDate: new Date(),
                    remarks: '',
                  });
                  this.items.clear();
                  this.addItem();
                } else {
                  swal.fire(
                    'Stock Update Failed',
                    res?.message || 'Stock update failed.',
                    'info'
                  );
                }
              },
              error: (err) => {
                console.error(err);
                swal.fire(
                  'Stock Update Failed',
                  err?.error?.message || 'Stock update failed.',
                  'info'
                );
              },
            });
        },
        error: () => {
          swal.fire('info', 'Could not save requisition', 'info');
        },
      });
  }

  UpdateData(): void {
    if (this.Formgroup.invalid) {
      swal.fire(
        'Validation Error',
        'Please fill all required fields.',
        'warning'
      );
      return;
    }

    const sentByStr = localStorage.getItem('userId');
    const sentBy = sentByStr ? Number(sentByStr) : null;

    // 1) Form -> DTO (typed)
    const fv = this.Formgroup.value;

    const masterRow = {
      ExportDate: fv.ExportDate,
      Shipping_Information: fv.ShippingInformation ?? '',
      Loading_Port_ID: fv.Loading_Port,
      Destination_Port_ID: fv.Destination_Port,
      Net_Weight: 0,
      Sent_By: window.localStorage.getItem('userId'),
      Total_Qty: 0,
      Status: 'Pending',
      Note: fv.remarks,
      Total_Roll: 0,
      Total_Bag: 0,
    };
    console.log(fv);
    const detailRows = fv.items.map((i: any) => ({
      RawMaterial_ID: i.article,
      Quantity: i.qty,
      Article_No: i.article,
      Description: i.description,
      Color_ID: i.color,
      Width_ID: i.width,
      Roll_Bag: i.rollOrBag === 'roll' ? 'roll' : 'bag',
      Unit: i.unitId,
      Weight: i.weight,
      Gross_Weight: i.grossWeight,
      RollBag_Quantity: i.rollBagQty,
      Unit_ID: i.unitId ?? null,
      ExportMasterID: null,
    }));

    var whereParam = {
      ExportMasterID: this.ExportMasterID,
    };

    this.doubleMasterEntryService
      .UpdateDataMasterDetails(
        detailRows, // fd (child rows)
        'tbl_export_details', // tableName (child)
        masterRow, // fdMaster (master row)
        'tbl_export_master', // tableNameMaster (master)
        'ExportMasterID', // columnNamePrimary (PK)
        'ExportMasterID', // columnNameForign (FK in child)
        'Export', // serialType (your code uses it)
        'Export', // columnNameSerialNo (series name)
        whereParam
      )
      .subscribe({
        next: (res: any) => {
          const detailRowsForStockUpdate = fv.items.map((r: any) => ({
            RawMaterial_ID: r?.article,
            Stock_Out: Number(r?.qty ?? 0),
            ExportMasterID: this.ExportMasterID,
            Roll_Out:
              r?.Roll_Bag === 'roll' ? Number(r?.RollBag_Quantity ?? 0) : 0,
            Bag_Out:
              r?.Roll_Bag === 'bag' ? Number(r?.RollBag_Quantity ?? 0) : 0,
          }));

          detailRowsForStockUpdate.forEach((e: any) => {
            this.masterEntryService
              .UpdateData(e, whereParam, 'tbl_stock')
              .subscribe({
                next: (res) => {
                  if (res.messageType === 'Success' && res.status) {
                    swal.fire(
                      'Success',
                      'Export Update successfully',
                      'success'
                    );
                  } else {
                    swal.fire(
                      'Stock Update Failed',
                      res?.message || 'Stock update failed.',
                      'info'
                    );
                  }
                },
                error: (err) => {
                  console.error(err);
                  swal.fire(
                    'Stock Update Failed',
                    err?.error?.message || 'Stock update failed.',
                    'info'
                  );
                },
              });
          });
        },
        error: () => {
          swal.fire('info', 'Could not save requisition', 'info');
        },
      });
  }

  getCustomerList() {
    var userId = window.localStorage.getItem('userId');
    var procedureName = 'usp_SC_PINo_ByMarketingConcern';
    var ProcedureData = {
      procedureName: procedureName,
      parameters: {
        UserID: userId,
      },
    };

    this.masterEntryService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.PIList = JSON.parse(results.data).Tables1;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }

  getPIDetails() {
    var userId = window.localStorage.getItem('userId');
    var PINo = this.Formgroup.value.PINo;

    this.PIPreviewList.forEach((e: any) => {
      if (e.PINo == PINo) {
        swal.fire('info', 'this pi data already contain in the list', 'info');
        return;
      }
    });

    var procedureName = 'usp_Application_GetPIInfo';
    var ProcedureData = {
      procedureName: procedureName,
      parameters: {
        PIId: PINo,
      },
    };

    this.masterEntryService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        console.log(results);
        if (results.status) {
          const formArray = this.Formgroup.get('items') as FormArray;
          formArray.clear();
          JSON.parse(results.data).Tables1.forEach((item: any) => {
            formArray.push(
              this.fb.group({
                customer_name: [item.customer_name],
                PINo: [item.PINo],
                PIMasterId: [item.PINo],
                PIDetailsId: [item.PINo],
                Article: [item.Article],
                ActualArticle: [item.ActualArticle],
                Color: [item.Color],
                Width: [item.Width],
                Unit: [item.Unit],
                Quantity: [item.Quantity],
                Unit_Price: [item.Unit_Price],
                CommissionUnit: [item.CommissionUnit],
                PaymentTerms: [item.PaymentTerms],
                Delivered_Quantity: [item.Delivered_Quantity],
                ApprovedQty: [null, [Validators.required, Validators.min(1)]],
                Remarks: ['', [Validators.required, Validators.minLength(3)]],
                PI_Detail_ID: [item.PI_Detail_ID],
                PI_Master_ID: [item.PI_Master_ID],
              })
            );
          });
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }

  approveQtyChange(item: any) {
    if (item.value.Quantity < item.value.ApprovedQty) {
      console.log(item);
      item.value.ApprovedQty = 0;
      swal.fire('info', 'Approve Qty can not be greater then Pi Qty', 'info');
    }
  }
}
