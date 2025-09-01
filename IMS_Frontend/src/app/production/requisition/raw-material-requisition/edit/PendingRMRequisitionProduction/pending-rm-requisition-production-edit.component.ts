// pending-rm-requisition-production-edit.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import swal from 'sweetalert2';

import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import { GlobalServiceService } from 'src/app/services/Global-service.service';

@Component({
  standalone: true,
  selector: 'app-pending-rm-requisition-production-edit',
  templateUrl: './pending-rm-requisition-production-edit.component.html',
  styleUrls: ['./pending-rm-requisition-production-edit.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class PendingRMRequisitionProductionEditComponent implements OnInit {
  private fb   = inject(FormBuilder);
  private route= inject(ActivatedRoute);
  private router = inject(Router);
  private title  = inject(Title);
  private svc    = inject(MasterEntryService);
  private gs     = inject(GlobalServiceService);

  editForm: FormGroup = this.fb.group({
    RequisitionNumber: ['', Validators.required],
    RequisitionDate:   ['', Validators.required],
    Remarks:           [''],
    Items:             this.fb.array<FormGroup>([])
  });

  get items(): FormArray<FormGroup> {
    return this.editForm.get('Items') as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    this.title.setTitle('Edit Pending RM Requisition');

    const reqNo = this.route.snapshot.paramMap.get('reqNo') ?? '';

    // Prefill header from router state (if you came from the list)
    const hdr = (this.router.getCurrentNavigation()?.extras.state as any)?.['header'];
    if (hdr) {
      this.patchHeader(hdr);
    } else {
      // At least set the number (e.g., hard refresh)
      this.editForm.patchValue({ RequisitionNumber: reqNo });
    }

    // Always load detail items by RequisitionNumber
    this.loadItems(reqNo);

    // If date is still empty (hard refresh, no state), try to fetch header by req no
    if (!this.editForm.get('RequisitionDate')?.value) {
      this.loadHeader(reqNo);
    }
  }

  private patchHeader(h: any) {
    this.editForm.patchValue({
      RequisitionNumber: h.RequisitionNumber,
      RequisitionDate:   this.toYMD(h.RequisitionDate),
      Remarks:           h.Remarks ?? ''
    });
  }

  // normalize any date-ish value to yyyy-MM-dd for <input type="date">
  private toYMD(d: any): string {
    if (!d) return '';
    const dt = new Date(d);
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${dt.getFullYear()}-${m}-${day}`;
  }

  private loadHeader(reqNo: string) {
    // If you have a header-by-number SP, call it here. Fallback is harmless.
    const procedureData = {
      procedureName: 'usp_RawMaterial_GetRequisitionHeaderByNumber',
      parameters: { RequisitionNumber: reqNo }
    };

    this.svc.GetInitialData(procedureData).subscribe({
      next: (res) => {
        if (res?.status) {
          const header = JSON.parse(res.data).Tables1?.[0];
          if (header) this.patchHeader(header);
        } else if (res?.msg === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info'); this.gs.Logout();
        }
      },
      error: () => {}
    });
  }

  private loadItems(reqNo: string) {
    const procedureData = {
      procedureName: 'usp_Rawmaterial_GetDataByRequisitionNumber',
      parameters: { RequisitionNumber: reqNo }
    };

    this.svc.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          const rows = JSON.parse(results.data).Tables1 as any[];
          this.items.clear();
          for (const it of rows) this.items.push(this.createItemGroup(it));
        } else if (results.message === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info'); this.gs.Logout();
        } else {
          swal.fire('Error!', 'Failed to load items.', 'error');
        }
      },
      error: () => swal.fire('Error!', 'An error occurred while fetching items.', 'error')
    });
  }

  private createItemGroup(it: any): FormGroup {
    return this.fb.group({
      Article:     [{ value: it.ConcatArticleNo ?? it.Article, disabled: true }],
      Description: [{ value: it.Description, disabled: true }],
      Color:       [{ value: it.Color, disabled: true }],
      Width:       [{ value: it.Width, disabled: true }],
      Weight:      [{ value: it.Weight, disabled: true }],
      Unit:        [{ value: it.Unit, disabled: true }],
      Quantity:    [it.Quantity, [Validators.required]],
      RollBag:     [it.Roll_Bag ?? it.RollBag],
      RBQty:       [it.RollBag_Quantity ?? it.RBQty]
    });
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      swal.fire('Validation Error!', 'Please fill all required fields.', 'warning');
      return;
    }

    const payload = {
      ...this.editForm.getRawValue(),
      Items: this.items.getRawValue()
    };

    const procedureData = {
      procedureName: 'usp_RawMaterial_UpdateRequisition',
      parameters: payload
    };

    this.svc.SaveData(procedureData, true).subscribe({
      next: (results) => {
        if (results.status) {
          swal.fire('Success!', 'Requisition updated successfully.', 'success');
        } else if (results.message === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info'); this.gs.Logout();
        } else {
          swal.fire('Error!', 'Failed to update requisition.', 'error');
        }
      },
      error: () => swal.fire('Error!', 'An error occurred while updating requisition.', 'error')
    });
  }
}
