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
    this.addItem();
    this.loadPageData();

    this.items.valueChanges
      .pipe(startWith(this.items.value), takeUntil(this.destroy$))
      .subscribe(() => this.recalcTotals());
    let has = this.activeLink.snapshot.queryParamMap.has('ExportMasterID');
    if (has) {
      this.ExportMasterID =
        this.activeLink.snapshot.queryParams['ExportMasterID'];
      this.isEdit = true;
      this.GetExportRMDataById();
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
      items: this.fb.array([], { validators: [this.rowsCompleteValidator()] }),
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
        userID:userId
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
  totalQty = 0;
  totalRoll = 0;
  totalBag = 0;
  totalGross = 0;
  totalWeight = 0;

  // call this on init and whenever the rows change
  private recalcTotals(): void {
    const rows = this.items.getRawValue() as Array<{
      qty: number;
      rollOrBag: 'roll' | 'bag';
      rollBagQty: number;
      weight: number;
      grossWeight: number;
    }>;

    this.totalQty = rows.reduce((s, r) => s + (Number(r.qty) || 0), 0);
    this.totalRoll = rows
      .filter((r) => r.rollOrBag === 'roll')
      .reduce((s, r) => s + (Number(r.rollBagQty) || 0), 0);
    this.totalBag = rows
      .filter((r) => r.rollOrBag === 'bag')
      .reduce((s, r) => s + (Number(r.rollBagQty) || 0), 0);
    this.totalWeight = rows.reduce((s, r) => s + (Number(r.weight) || 0), 0);
    this.totalGross = rows.reduce(
      (s, r) => s + (Number(r.grossWeight) || 0),
      0
    );
  }

  trackById = (_: number, a: any) => a?.RawMaterial_ID ?? _;

  private rowsCompleteValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const arr = control as FormArray;
      if (arr.length === 0) return { noRows: true };

      for (const g of arr.controls) {
        const rawMaterialId = g.get('article')?.value;
        const qty = Number(g.get('qty')?.value);
        const rollBagQty = Number(g.get('rollBagQty')?.value);

        if (
          !rawMaterialId ||
          !qty ||
          qty <= 0 ||
          !rollBagQty ||
          rollBagQty <= 0
        ) {
          return { incompleteRow: true };
        }
      }
      return null;
    };
  }

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

    const sentByStr = localStorage.getItem('userId');
    const sentBy = sentByStr ? Number(sentByStr) : null;

    // 1) Form -> DTO (typed)
    const fv = this.Formgroup.value;

    this.recalcTotals();
    const masterRow = {
      ExportNumber: 'Export - ',
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

    this.doubleMasterEntryService
      .SaveDataMasterDetailsGetId(
        detailRows, // fd (child rows)
        'tbl_export_details', // tableName (child)
        masterRow, // fdMaster (master row)
        'tbl_export_master', // tableNameMaster (master)
        'ExportMasterID', // columnNamePrimary (PK)
        'ExportMasterID', // columnNameForign (FK in child)
        'Export', // serialType (your code uses it)
        'Export' // columnNameSerialNo (series name)
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

  GetExportRMDataById() {
    this.recalcTotals();

    // crm.User_ID,Beneficiary_Bank_ID,crm.Consignee_Name,Customer_Bank,PI_Master_ID,PI_Value,ReceiveAmount,ReceiveDate,Issue_Date,Payment_Term_ID,Remarks
    var ProcedureData = {
      procedureName: '[usp_ExportRM_ById]',
      parameters: {
        ExportMasterID: this.ExportMasterID,
      },
    };
    this.getDataService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          var tableData = JSON.parse(results.data).Tables1;
          var tableDetailsData = JSON.parse(results.data).Tables2;

          console.log(tableDetailsData);

          let frmArray = this.Formgroup.controls.items as FormArray;

          tableData.forEach((e: any) => {
            var exportDate = new Date(e.ExportDate);
            console.log(exportDate);

            const year = exportDate.getFullYear();
            const month = ('0' + (exportDate.getMonth() + 1)).slice(-2);
            const day = ('0' + exportDate.getDate()).slice(-2);

            this.Formgroup.controls.ExportDate.setValue(
              `${year}-${month}-${day}`
            );
            this.Formgroup.controls.Loading_Port.setValue(e.Loading_Port_ID);
            this.Formgroup.controls.Destination_Port.setValue(
              e.Destination_Port_ID
            );
            this.Formgroup.controls.ShippingInformation.setValue(
              e.Shipping_Information
            );
            this.Formgroup.controls.remarks.setValue(e.Note);
          });
          while (frmArray.length !== 0) {
            frmArray.removeAt(0);
          }
          tableDetailsData.forEach((e: any) => {
            let arrayGroup = this.fb.group({
              article: this.fb.control<string | null>(
                null,
                Validators.required
              ),
              description: this.fb.control<string>(''),
              color: this.fb.control<string | null>(null, Validators.required),
              width: this.fb.control<number | null>(null, Validators.required),
              rollOrBag: this.fb.control<'Rolls' | 'Bags'>('Rolls'),
              rollBagQty: this.fb.control<number>(0),
              unitId: this.fb.control<number | null>(null),
              qty: this.fb.control<number>(0, [
                Validators.required,
                Validators.min(1),
              ]),
              weight: this.fb.control<number>(0),
              grossWeight: this.fb.control<number>(0),
            });
            arrayGroup.controls.article.setValue(e.RawMaterial_ID);
            arrayGroup.controls.description.setValue(e.Description);
            arrayGroup.controls.color.setValue(e.Color_ID);
            arrayGroup.controls.width.setValue(e.Width_ID);
            arrayGroup.controls.rollOrBag.setValue(e.Roll_Bag);
            arrayGroup.controls.rollBagQty.setValue(e.RollBag_Quantity);
            arrayGroup.controls.unitId.setValue(e.Unit_ID);
            arrayGroup.controls.qty.setValue(e.Quantity);
            arrayGroup.controls.weight.setValue(e.Weight);
            arrayGroup.controls.grossWeight.setValue(e.Gross_Weight);

            arrayGroup.get('qty')!.valueChanges.subscribe(() => {
              const qty = arrayGroup.get('qty')!.value ?? 0;
              const weight = arrayGroup.get('weight')!.value ?? 0;

              arrayGroup
                .get('grossWeight')!
                .setValue(qty * weight, { emitEvent: false });
            });

            arrayGroup.get('weight')!.valueChanges.subscribe(() => {
              const qty = arrayGroup.get('qty')!.value ?? 0;
              const weight = arrayGroup.get('weight')!.value ?? 0;

              arrayGroup
                .get('grossWeight')!
                .setValue(qty * weight, { emitEvent: false });
            });
            frmArray.push(arrayGroup);
          });
          this.recalcTotals();
        } else if (results.message == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
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

    this.recalcTotals();
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

  RMOptionChange(item: any) {
    console.log(item);

    var ProcedureData = {
      procedureName: '[usp_RawMaterialDetails]',
      parameters: {
        RawMaterial_ID: item.value.article,
      },
    };

    this.getDataService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          var rmDetails = JSON.parse(results.data).Tables1;
          item.controls.color.setValue(rmDetails[0].ColorId);
          item.controls.unitId.setValue(rmDetails[0].UnitId);
          item.controls.width.setValue(rmDetails[0].WidthId);
          item.controls.weight.setValue(rmDetails[0].Weight);
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
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
}
