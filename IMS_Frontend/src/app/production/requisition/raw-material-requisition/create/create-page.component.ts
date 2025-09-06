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
  standalone: true,
  selector: 'app-create-page',
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.css'],
  imports: [CommonModule, ReactiveFormsModule, DropdownModule]
})
export class CreatePageComponent implements OnInit {
  requisitionData: any[] = [];
  rawMaterialArticles: any[] = [];
  rawMaterialArticlesBackup: any[] = []; // Backup for filtering
  requisitionForm!: FormGroup;
  private destroy$ = new Subject<void>();
  private unitByArticleId = new Map<number, number | null>();
  rollOrBagOptions = [
    { label: 'Rolls', value: 'Rolls' },
    { label: 'Bags', value: 'Bags' }
  ];
  reloadingArticles = false;


  constructor(
    private fb: FormBuilder,
    private doubleMasterEntryService: DoubleMasterEntryService,
    private getDataService: GetDataService,
    private gs: GlobalServiceService,
    private title: Title,
  ) {

  }

  ngOnInit(): void {
    this.title.setTitle('RM Requisition Form');
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
  loadPageData(): void {
    // Logic to load initial data for the page
  }

  generateForm() {
    this.requisitionForm = this.fb.group({
      requisitionDate: [new Date(), Validators.required],
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
      procedureName: '[usp_RawMaterial_GetInitialData]',
      parameters: {
      }
    };

    this.getDataService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {

        if (results.status) {
          this.rawMaterialArticles = JSON.parse(results.data).Tables1;
          this.rawMaterialArticlesBackup = [...this.rawMaterialArticles]; // Initialize backup

          this.unitByArticleId = new Map(
            this.rawMaterialArticles.map((r: any) => {
              const unit =
                r.Unit_ID ?? r.UnitId ?? r.UnitID ?? null; // tolerate naming
              return [Number(r.RawMaterial_ID), unit != null ? Number(unit) : null];
            })
          );

        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else { }
      },
      error: (err) => { },
    });
  }

  get items(): FormArray {
    return this.requisitionForm.get('items') as FormArray;
  }

  addItem() {
    this.items.push(
      this.fb.group({
        rawMaterialId: [null, Validators.required],
        description: [''],
        qty: [0, [Validators.required, Validators.min(1)]],
        rollOrBag: ['Rolls'],
        rollBagQty: [0],
        unitId: [null]
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

  this.totalQty  = rows.reduce((s, r) => s + (Number(r.qty) || 0), 0);
  this.totalRoll = rows
    .filter(r => r.rollOrBag === 'Rolls')
    .reduce((s, r) => s + (Number(r.rollBagQty) || 0), 0);
  this.totalBag  = rows
    .filter(r => r.rollOrBag === 'Bags')
    .reduce((s, r) => s + (Number(r.rollBagQty) || 0), 0);
}


  trackById = (_: number, a: any) => a?.RawMaterial_ID ?? _;

  onArticleChange(i: number, rawMaterialId: number) {
  const unitId = this.unitByArticleId.get(Number(rawMaterialId)) ?? null;
  (this.items.at(i) as FormGroup).patchValue({ unitId });
}


private rowsCompleteValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const arr = control as FormArray;
    if (arr.length === 0) return { noRows: true };

    for (const g of arr.controls) {
      const rawMaterialId = g.get('rawMaterialId')?.value;
      const qty          = Number(g.get('qty')?.value);
      const rollBagQty   = Number(g.get('rollBagQty')?.value);

      if (!rawMaterialId || !qty || qty <= 0 || !rollBagQty || rollBagQty <= 0) {
        return { incompleteRow: true };
      }
    }
    return null;
  };
}

  saveData(): void {
    if (this.requisitionForm.invalid) {
      swal.fire('Validation Error', 'Please fill all required fields.', 'warning');
      return;
    }

    const sentByStr = localStorage.getItem('userId'); 
    const sentBy = sentByStr ? Number(sentByStr) : null;

    // 1) Form -> DTO (typed)
    const fv = this.requisitionForm.value;
    const items: CreateRmRequisitionItem[] = (fv.items ?? []).map((g: any) => ({
      rawMaterialId: Number(g.rawMaterialId),
      description: g.description ?? null,
      quantity: Number(g.qty ?? 0),
      rollBag: g.rollOrBag,  
      rollBagQuantity: Number(g.rollBagQty ?? 0),
      unitId: this.unitByArticleId.get(Number(g.rawMaterialId)) ?? g.unitId ?? null
    }));

    this.recalcTotals();

    const payload: CreateRmRequisitionRequest = {
      requisitionDate: new Date(fv.requisitionDate).toISOString().split('T')[0],
      remarks: fv.remarks ?? null,
      items,
      requisitionNumber: null,
      totalQty: this.totalQty,
      sentBy: sentByStr ? Number(sentByStr) : null,
      status: 'Pending',
      isSeen: false,
      totalRoll: this.totalRoll,
      totalBag: this.totalBag
    };

    const masterRow = {
      RequisitionNumber: 'RMRequisition - ',
      RequisitionDate: payload.requisitionDate,
      Total_Qty: payload.totalQty,
      Sent_By: window.localStorage.getItem('userId'),
      Status: payload.status ?? null,
      IsSeen: payload.isSeen ?? false,
      Remarks: payload.remarks ?? null,
      Total_Roll: payload.totalRoll ?? 0,
      Total_Bag: payload.totalBag ?? 0,
      ActionApplied: payload.actionApplied ?? null
    };
    
    const detailRows = payload.items.map(i => ({
      RawMaterial_ID: i.rawMaterialId,
      Quantity: i.quantity,
      RM_Requisition_MasterID: null,
      Description: i.description,
      Roll_Bag: i.rollBag === 'Rolls' ? 'roll' : 'bag', 
      RollBag_Quantity: i.rollBagQuantity,
      Unit_ID: i.unitId ?? null,
    }));

    this.doubleMasterEntryService.SaveDataMasterDetails(
      detailRows,                          // fd (child rows)
      'tbl_rm_requisition_details',        // tableName (child)
      masterRow,                           // fdMaster (master row)
      'tbl_rm_requisition_master',         // tableNameMaster (master)
      'RM_Requisition_MasterID',           // columnNamePrimary (PK)
      'RM_Requisition_MasterID',           // columnNameForign (FK in child)
      'RMRequisition',                     // serialType (your code uses it)
      'RMRequisition'                      // columnNameSerialNo (series name)
    )
      .subscribe({
        next: (res: any) => {
          swal.fire('Success', 'Requisition saved successfully', 'success');
          // Optionally reset form / navigate
          this.requisitionForm.reset({ requisitionDate: new Date(), remarks: '' });
          this.items.clear(); this.addItem();
        },
        error: () => {
          swal.fire('Error', 'Could not save requisition', 'error');
        }
      });
  }
}
