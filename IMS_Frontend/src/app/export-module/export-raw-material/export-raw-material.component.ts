// Create Page Component
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, FormArray, FormGroup, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import swal from 'sweetalert2';
import { DropdownModule } from 'primeng/dropdown';
import { CreateRmRequisitionItem, CreateRmRequisitionRequest } from 'src/app/models/requisition/rmRequisition';
import { startWith, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';
import { GetDataService } from 'src/app/services/getData/getDataService.service';


@Component({
  selector: 'app-export-raw-material',
  templateUrl: './export-raw-material.component.html',
  styleUrls: ['./export-raw-material.component.css']
})
export class ExportRawMaterialComponent {
  exportForm!: FormGroup;
  private destroy$ = new Subject<void>();
  private unitByArticleId = new Map<number, number | null>();
  rollOrBagOptions = [
    { label: 'Rolls', value: 'Rolls' },
    { label: 'Bags', value: 'Bags' }
  ];
  reloadingArticles = false;
  LoadingPortList: any[] = [];
  DestinationPortList: any[] = [];
  RawMaterialList: any[] = [];
  WidthList: any[] = [];
  ColorList: any[] = [];
  UnitList: any[] = [];


  constructor(
    private fb: FormBuilder,
    private doubleMasterEntryService: DoubleMasterEntryService,
    private getDataService: GetDataService,
    private gs: GlobalServiceService,
    private title: Title,
  ) {

  }

  ngOnInit(): void {
    this.title.setTitle('Export Raw Material');
    this.generateForm();
    this.addItem();
    this.loadPageData();

    this.items.valueChanges
      .pipe(startWith(this.items.value), takeUntil(this.destroy$))
      .subscribe(() => this.recalcTotals());
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  generateForm() {
    this.exportForm = this.fb.group({
      ExportDate: ['', Validators.required],
      InvoiceNo: [''],
      Loading_Port: ['', Validators.required],
      Destination_Port: ['', Validators.required],
      ShippingInformation: [''],
      remarks: [''],
      items: this.fb.array([], { validators: [this.rowsCompleteValidator()] })
    });
  }

  refreshArticles(): void {
    if (this.reloadingArticles) return;
    this.loadPageData();
  }

  loadPageData(): void {
    var ProcedureData = {
      procedureName: '[usp_ExportRM_GetInitialData]',
      parameters: {
      }
    };

    this.getDataService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {

        if (results.status) {
          this.LoadingPortList = JSON.parse(results.data).Tables1;
          this.DestinationPortList = JSON.parse(results.data).Tables2;
          this.RawMaterialList = JSON.parse(results.data).Tables3;
          this.WidthList = JSON.parse(results.data).Tables4;
          this.ColorList = JSON.parse(results.data).Tables5;
          this.UnitList = JSON.parse(results.data).Tables6;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else { }
      },
      error: (err) => { },
    });
  }

  get items(): FormArray {
    return this.exportForm.get('items') as FormArray;
  }

  addItem() {
    this.items.push(
      this.fb.group({
        article: [null, Validators.required],
        description: [''],
        color: [null, Validators.required],
        width: [null, Validators.required],
        rollOrBag: ['Rolls'],
        rollBagQty: [0],
        unitId: [null],
        qty: [0, [Validators.required, Validators.min(1)]],
        weight: [null],
        grossWeight: [null],
      })
    );
  }

  removeItem(i: number) {
    this.items.removeAt(i);
  }

  // totals (bind to UI + send to API)
  totalQty = 0;
  totalRoll = 0;
  totalBag = 0;

  // call this on init and whenever the rows change
  private recalcTotals(): void {
    const rows = this.items.getRawValue() as Array<{
      qty: number;
      rollOrBag: 'Rolls' | 'Bags';
      rollBagQty: number;
    }>;

    this.totalQty = rows.reduce((s, r) => s + (Number(r.qty) || 0), 0);
    this.totalRoll = rows
      .filter(r => r.rollOrBag === 'Rolls')
      .reduce((s, r) => s + (Number(r.rollBagQty) || 0), 0);
    this.totalBag = rows
      .filter(r => r.rollOrBag === 'Bags')
      .reduce((s, r) => s + (Number(r.rollBagQty) || 0), 0);
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

        if (!rawMaterialId || !qty || qty <= 0 || !rollBagQty || rollBagQty <= 0) {
          return { incompleteRow: true };
        }
      }
      return null;
    };
  }

  saveData(): void {
    console.log(this.exportForm);
    
    if (this.exportForm.invalid) {
      swal.fire('Validation Error', 'Please fill all required fields.', 'warning');
      return;
    }

    const sentByStr = localStorage.getItem('userId');
    const sentBy = sentByStr ? Number(sentByStr) : null;

    // 1) Form -> DTO (typed)
    const fv = this.exportForm.value;
// article: [null, Validators.required],
//         description: [''],
//         color: [null, Validators.required],
//         width: [null, Validators.required],
//         rollOrBag: ['Rolls'],
//         rollBagQty: [0],
//         unitId: [null],
//         qty: [0, [Validators.required, Validators.min(1)]],
//         weight: [null],
//         grossWeight: [null],
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
      Total_Bag: 0
    };
    const detailRows = fv.items.map((i: any) => ({
      RawMaterial_ID: i.article,
      Quantity: i.qty,
      Article_No: i.article,
      Description: i.description,
      Color_ID: i.color,
      Width_ID: i.width,
      Roll_Bag: i.rollOrBag === 'Rolls' ? 'roll' : 'bag',
      Unit: i.unitId,
      Weight: i.weight,
      Gross_Weight: i.grossWeight,
      RollBag_Quantity: i.rollBagQty,
      Unit_ID: i.unitId ?? null,
    }));

    this.doubleMasterEntryService.SaveDataMasterDetails(
      detailRows,                          // fd (child rows)
      'tbl_export_details',        // tableName (child)
      masterRow,                           // fdMaster (master row)
      'tbl_export_master',         // tableNameMaster (master)
      'ExportMasterID',           // columnNamePrimary (PK)
      'ExportMasterID',           // columnNameForign (FK in child)
      'Export',                     // serialType (your code uses it)
      'Export'                      // columnNameSerialNo (series name)
    )
      .subscribe({
        next: (res: any) => {
          swal.fire('Success', 'Export saved successfully', 'success');
          // Optionally reset form / navigate
          this.exportForm.reset({ requisitionDate: new Date(), remarks: '' });
          this.items.clear(); this.addItem();
        },
        error: () => {
          swal.fire('Error', 'Could not save requisition', 'error');
        }
      });
  }
}
