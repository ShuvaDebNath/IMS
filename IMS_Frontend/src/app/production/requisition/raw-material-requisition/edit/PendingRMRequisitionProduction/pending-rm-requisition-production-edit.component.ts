// pending-rm-requisition-production-edit.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import swal from 'sweetalert2';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { DropdownModule } from 'primeng/dropdown';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';

@Component({
  standalone: true,
  selector: 'app-pending-rm-requisition-production-edit',
  templateUrl: './pending-rm-requisition-production-edit.component.html',
  styleUrls: ['./pending-rm-requisition-production-edit.component.css'],
  imports: [CommonModule, ReactiveFormsModule, DropdownModule],
})
export class PendingRMRequisitionProductionEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private title = inject(Title);
  private svc = inject(GetDataService);
  private dme = inject(DoubleMasterEntryService);
  private gs = inject(GlobalServiceService);
  masterId!: number;

  /** DDL options for Roll/Bag */
  rollOrBagOptions = [
    { label: 'Rolls', value: 'roll' },
    { label: 'Bags', value: 'bag' }
  ];

  rawMaterialArticles: any[] = [];
  rawMaterialArticlesBackup: any[] = [];
  unitByArticleId: Map<number, number | null> = new Map();

  editForm: FormGroup = this.fb.group({
    RequisitionNumber: ['', Validators.required],
    RequisitionDate: ['', Validators.required],
    Remarks: [''],
    Total_Qty: [0],
    Total_Roll: [0],
    Total_bag: [0],
    Items: this.fb.array<FormGroup>([])
  });

  get items(): FormArray<FormGroup> {
    return this.editForm.get('Items') as FormArray<FormGroup>;
  }

  ngOnInit(): void {

    // const id = this.getReqId();           // <- read from URL/State
    // if (id == null) {
    //   swal.fire('Missing id', 'No reqId found in route.', 'error');
    //   // optional: navigate back
    //   this.router.navigate(['/pending-rm-requisition']);
    //   return;
    // }
    // this.masterId = id;
    //this.title.setTitle('Edit Pending RM Requisition');

    this.title.setTitle('Edit Pending RM Requisition');

    // NOTE: use the route param name you actually configured (reqNo or reqId).
    const reqId = this.route.snapshot.paramMap.get('reqId') ?? this.route.snapshot.paramMap.get('reqId') ?? '';

    this.masterId = Number(reqId);

    this.loadPageData();
    const hdr = (this.router.getCurrentNavigation()?.extras.state as any)?.['header'];
    if (hdr) {
      this.patchHeader(hdr);
    } else {
      this.editForm.patchValue({ RequisitionNumber: reqId });
    }

    this.loadItems(reqId);

    // Backfill header if you didn’t come from list
    if (!this.editForm.get('RequisitionDate')?.value) {
      this.loadHeader(reqId);
    }
  }

  private getReqId(): number | null {
    const fromPath = this.route.snapshot.paramMap.get('reqId')
      ?? this.route.snapshot.paramMap.get('id'); // fallback if route uses :id
    const fromQuery = this.route.snapshot.queryParamMap.get('reqId');
    const fromState = this.router.getCurrentNavigation()?.extras?.state?.['reqId'];

    const raw = fromPath ?? fromQuery ?? fromState ?? null;
    if (raw == null) return null;

    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  private patchHeader(h: any) {
    this.editForm.patchValue({
      RequisitionNumber: h.RequisitionNumber,
      RequisitionDate: this.toYMD(h.RequisitionDate),
      Remarks: h.Remarks ?? '',
      Total_Qty: h.Total_Qty ?? 0,
      Total_Roll: h.Total_Roll ?? 0,
      Total_bag: h.Total_bag ?? 0,
    });
  }

  private toYMD(d: any): string {
    if (!d) return '';
    const dt = new Date(d);
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${dt.getFullYear()}-${m}-${day}`;
  }

  private loadHeader(reqId: string) {
    const procedureData = {
      procedureName: 'usp_Rawmaterial_GetDataById',       // adjust to your actual SP
      parameters: { RM_Requisition_MasterID: reqId }
    };

    this.svc.GetInitialData(procedureData).subscribe({
      next: (res: any) => {
        if (res?.status) {
          const header = JSON.parse(res.data).Tables1?.[0];
          if (header) this.patchHeader(header);
        } else if (res?.msg === 'Invalid Token' || res?.message === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info'); this.gs.Logout();
        }
      },
      error: () => { }
    });
  }

  private loadItems(reqId: string) {
    const procedureData = {
      procedureName: 'usp_Rawmaterial_GetDataById',        // adjust to your actual SP
      parameters: { RM_Requisition_MasterID: reqId }
    };

    this.svc.GetInitialData(procedureData).subscribe({
      next: (results: any) => {
        if (results.status) {
          const rows = JSON.parse(results.data).Tables1 as any[];
          this.items.clear();

          for (const it of rows) {
            const fg = this.createItemGroup(it);
            this.items.push(fg);
          }

          // 1) Initial totals after data load
          this.recomputeTotals();

          // 2) Keep totals in sync with any edit in Quantity / Roll_Bag / RollBag_Quantity
          this.items.valueChanges.subscribe(() => this.recomputeTotals());
        } else if (results.msg === 'Invalid Token' || results.message === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info'); this.gs.Logout();
        } else {
          swal.fire('Error!', 'Failed to load items.', 'error');
        }
      },
      error: () => swal.fire('Error!', 'An error occurred while fetching items.', 'error')
    });
  }

  onArticleChange(i: number, rawMaterialId: number) {
    const row = this.items.at(i) as FormGroup;
    const a = this.rawMaterialArticles.find(x => x.RawMaterial_ID === rawMaterialId);

    row.patchValue({
      RawMaterial_ID: rawMaterialId,
      ConcatArticleNo: a?.ConcatArticleNo ?? '',
      Description: a?.Description ?? '',      // if you want this synced too
      Unit_ID: a?.Unit_ID ?? null             // or use your unit map
    }, { emitEvent: true });
  }

  private createItemGroup(it: any): FormGroup {

    const raw = (it.Roll_Bag ?? it.Roll_Bag ?? '').toString().trim().toLowerCase();
    const rb = raw.startsWith('bag') ? 'bag' : 'roll'; // default to "roll"

    return this.fb.group({
      RawMaterial_ID: [Number(it.RawMaterial_ID) || null, Validators.required],
      Article: [{ value: it.ConcatArticleNo ?? it.Article, disabled: true }],
      Description: [{ value: it.Description, disabled: false }],
      Unit_ID: [{ value: it.Unit_ID, disabled: true }],
      Quantity: [Number(it.Quantity) || 0, [Validators.required]],
      Roll_Bag: [rb],
      RollBag_Quantity: [Number(it.RollBag_Quantity ?? it.RollBag_Quantity) || 0]
    });
  }

  /** Recalculate and set Total_Qty, Total_Roll, Total_bag */
  private recomputeTotals(): void {
    let totalQty = 0;
    let totalRoll = 0;
    let totalBag = 0;

    this.items.controls.forEach(fg => {
      const qty = Number(fg.get('Quantity')?.value) || 0;
      const RollBag_Quantity = Number(fg.get('RollBag_Quantity')?.value) || 0;
      const rb = (fg.get('Roll_Bag')?.value || '').toString();

      totalQty += qty;

      if (rb === 'rolls' || rb === 'roll') totalRoll += RollBag_Quantity;
      else if (rb === 'bags' || rb === 'bag') totalBag += RollBag_Quantity;
    });

    this.editForm.patchValue(
      { Total_Qty: totalQty, Total_Roll: totalRoll, Total_bag: totalBag },
      { emitEvent: false } // don’t trigger valueChanges loop
    );
  }

  loadPageData(): void {
    var ProcedureData = {
      procedureName: '[usp_RawMaterial_GetInitialData]',
      parameters: {
      }
    };

    this.svc.GetInitialData(ProcedureData).subscribe({
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


  addItem() {
    this.items.push(
      this.fb.group({
        RawMaterial_ID: [null, Validators.required],
        ConcatArticleNo: [{ value: '', disabled: true }],
        Description: [{ value: '', disabled: false }],
        Unit_ID: [{ value: null, disabled: true }],
        Quantity: [0, [Validators.required, Validators.min(1)]],
        Roll_Bag: ['roll'],             // 'roll' | 'bag'
        RollBag_Quantity: [0]
      })
    );

    this.recomputeTotals();
  }


  removeItem(i: number) {
    this.items.removeAt(i);
    this.recomputeTotals();
  }


  onSubmit(): void {
    if (this.editForm.invalid) {
      swal.fire('Validation Error!', 'Please fill all required fields.', 'warning');
      return;
    }

    const sentByStr = localStorage.getItem('userId');
    const sentBy = sentByStr ? Number(sentByStr) : null;

    const payload1 = {
      ...this.editForm.getRawValue(),
      Items: this.items.getRawValue()
    };
    const fv = this.editForm.getRawValue();
    const rows = this.items.getRawValue() as any[];

    const masterRow = {
      RequisitionNumber: fv?.RequisitionNumber ?? null,
      RequisitionDate: fv?.RequisitionDate,
      Remarks: fv?.Remarks ?? '',
      Total_Qty: fv?.Total_Qty ?? 0,
      Total_bag: fv?.Total_bag ?? 0,
      Total_Roll: fv?.Total_Roll ?? 0,
      Sent_By: sentBy,
      Status: fv?.Status ?? 'Pending',
      IsSeen: Boolean(fv?.IsSeen ?? false)
    };

    const detailRows = rows.map(r => ({
      RawMaterial_ID: String(r?.RawMaterial_ID ?? ''),
      Quantity: Number(r?.Quantity ?? 0),
      RM_Requisition_MasterID: this.masterId,                 // required on update
      Description: r?.Description ?? '',
      Unit: '',
      Roll_Bag: r?.Roll_Bag,                    // 'Rolls' | 'Bags'
      RollBag_Quantity: Number(r?.RollBag_Quantity ?? 0),
      Unit_ID: r?.Unit_ID == null ? '' : String(r.Unit_ID)
    }));

    const whereParams = { RM_Requisition_MasterID: this.masterId };

    this.dme.UpdateDataMasterDetails(
      detailRows,                         // fd  -> detailsData
      'tbl_rm_requisition_details',       // tableName
      masterRow,                          // fdMaster -> data
      'tbl_rm_requisition_master',        // tableNameMaster
      'RM_Requisition_MasterID',          // primaryColumnName
      'RM_Requisition_MasterID',          // ColumnNameForign
      '',                                 // serialType
      '',                                 // ColumnNameSerialNo
      whereParams                         // Whereparam
    ).subscribe({
      next: (res) => {
        swal.fire('Updated!', 'Requisition updated successfully.', 'success');
        this.router.navigate(['/pending-rm-requisition']);
      },
      error: (err) => {
        console.error(err);
        swal.fire('Update Failed', err?.error?.message || 'Something went wrong.', 'error');
      }
    });
  }
}
