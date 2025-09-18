import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import swal from 'sweetalert2';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { CreateSendFinishGoodsItem, CreateSendFinishGoodsRequest } from 'src/app/models/requisition/sendFinishGoods';

@Component({
  standalone: true,
  selector: 'app-send-finish-goods',
  templateUrl: './send-finish-goods.component.html',
  styleUrls: ['./send-finish-goods.component.css'],
  imports: [CommonModule, TableModule, InputTextModule, DialogModule],
})
export class SendFinishGoodsComponent implements OnInit {
  finishGoodsArticles: any[] = [];
  finishGoodsArticlesBackup: any[] = []; 
  finishGoodsProductionForm!: FormGroup;
  private destroy$ = new Subject<void>();
  private unitByArticleId = new Map<number, number | null>();
  reloadingArticles = false;

  constructor(
     private fb: FormBuilder,
        private doubleMasterEntryService: DoubleMasterEntryService,
        private getDataService: GetDataService,
        private gs: GlobalServiceService,
        private title: Title,
  ) {}

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
    generateForm() {
      this.finishGoodsProductionForm = this.fb.group({
        ExportDate: [new Date(), Validators.required],
        SentFrom: [''],
        Note: [''],
        items: this.fb.array([], { validators: [this.rowsCompleteValidator()] })
      });
    }
  
  
  
  refreshArticles(): void {
    if (this.reloadingArticles) return;
    this.loadPageData();    
  }
  
    loadPageData(): void {
      var ProcedureData = {
        procedureName: '[usp_ProformaInvoice_GetInitialData]',
        parameters: {
          userID:this.gs.getSessionData('userId'),
          roleID:this.gs.getSessionData('roleId'),
          PaymentType:2
        }
      };
  
      this.getDataService.GetInitialData(ProcedureData).subscribe({
        next: (results) => {
  
          if (results.status) {
            this.finishGoodsArticles = JSON.parse(results.data).Tables28;
            this.finishGoodsArticlesBackup = [...this.finishGoodsArticles];

            this.unitByArticleId = new Map(
              this.finishGoodsArticles.map((r: any) => {
                const unit =
                  r.Unit_ID ?? r.UnitId ?? r.UnitID ?? null; 
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
      return this.finishGoodsProductionForm.get('items') as FormArray;
    }
  
    addItem() {
      this.items.push(
        this.fb.group({
          Item_ID: [null, Validators.required],
          Note: [''],
          Quantity: [0, [Validators.required, Validators.min(1)]],
          Sent_RollBag_Quantity: [0, [Validators.required, Validators.min(1)]],
          Gross_Weight: [0, [Validators.required, Validators.min(0.1)]]
        })
      );
    }
  
    removeItem(i: number) {
      this.items.removeAt(i);
    }
  
    // totals (bind to UI + send to API)
  totalQty = 0;
  totalSentRollBagQty = 0;
  totalGrossWeight = 0;

  // call this on init and whenever the rows change
  private recalcTotals(): void {
    const rows = this.items.getRawValue() as Array<{
      qty: number;
      Sent_RollBag_Quantity: number;
      Gross_Weight: number;
    }>;
  
    this.totalQty  = rows.reduce((s, r) => s + (Number(r.qty) || 0), 0);
    this.totalSentRollBagQty  = rows.reduce((s, r) => s + (Number(r.Sent_RollBag_Quantity) || 0), 0);
    this.totalGrossWeight  = rows.reduce((s, r) => s + (Number(r.Gross_Weight) || 0), 0);

  }
  
  
    trackById = (_: number, a: any) => a?.Item_ID ?? _;
  
    onArticleChange(i: number, Item_ID: number) {
    const unitId = this.unitByArticleId.get(Number(Item_ID)) ?? null;
    (this.items.at(i) as FormGroup).patchValue({ unitId });
  }
  
  
  private rowsCompleteValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const arr = control as FormArray;
      if (arr.length === 0) return { noRows: true };
  
      for (const g of arr.controls) {
        const Item_ID = g.get('Item_ID')?.value;
        const Quantity = Number(g.get('Quantity')?.value);
        const Sent_RollBag_Quantity = Number(g.get('Sent_RollBag_Quantity')?.value);
        const Gross_Weight = Number(g.get('Gross_Weight')?.value);

        if (!Item_ID || !Quantity || Quantity <= 0 || !Sent_RollBag_Quantity || Sent_RollBag_Quantity <= 0 || !Gross_Weight || Gross_Weight <= 0) {
          return { incompleteRow: true };
        }
      }
      return null;
    };
  }
  
    saveData(): void {
      if (this.finishGoodsProductionForm.invalid) {
        swal.fire('Validation Error', 'Please fill all required fields.', 'warning');
        return;
      }
  
      const sentByStr = localStorage.getItem('userId'); 
      const sentBy = sentByStr ? Number(sentByStr) : null;
  
      // 1) Form -> DTO (typed)
      const fv = this.finishGoodsProductionForm.value;
      const items: CreateSendFinishGoodsItem[] = (fv.items ?? []).map((g: any) => ({
        Item_ID: Number(g.Item_ID),
        Note: g.Note ?? null,
        Quantity: Number(g.Quantity ?? 0),
        Roll_Bag: g.Roll_Bag,
        Sent_RollBag_Quantity: Number(g.Sent_RollBag_Quantity ?? 0),
        Gross_Weight: Number(g.Gross_Weight ?? 0)
      }));
  
      this.recalcTotals();
  
      const payload: CreateSendFinishGoodsRequest = {
        exportDate: new Date(fv.ExportDate).toISOString().split('T')[0],
        note: fv.note ?? null,
        items,
        exportNumber: null,
        totalQty: this.totalQty,
        sentBy: sentByStr ? Number(sentByStr) : null,
        status: 'Pending',
        isSeen: false,
        totalRoll: 0,
        totalBag: 0,
        totalKG: 0,
        totalPiece: 0,
        totalNetWeight: this.totalGrossWeight,
        actionApplied: null

      };
  
      const masterRow = {
        ExportNumber: 'RMRequisition - ',
        ExportDate: payload.exportDate,
        Total_Qty: payload.totalQty,
        Sent_By: window.localStorage.getItem('userId'),
        Status: payload.status ?? null,
        IsSeen: payload.isSeen ?? false,
        Remarks: payload.note ?? null,
        Total_Roll: payload.totalRoll ?? 0,
        Total_Bag: payload.totalBag ?? 0,
        Total_KG: payload.totalKG ?? 0,
        Total_Piece: payload.totalPiece ?? 0,
        Total_Net_Weight: payload.totalNetWeight ?? 0,
        ActionApplied: payload.actionApplied ?? null
      };
      
      const detailRows = payload.items.map(i => ({
        Item_ID: i.Item_ID,
        Quantity: i.Quantity,
        FG_DeliveryMasterID: null,
        Note: i.Note,
        Roll_Bag: i.Roll_Bag,
        Sent_RollBag_Quantity: i.Sent_RollBag_Quantity,
        Gross_Weight: i.Gross_Weight ?? null,
      }));
  
      // this.doubleMasterEntryService.SaveDataMasterDetails(
      //   detailRows,                          // fd (child rows)
      //   'tbl_finished_goods_delivery_details',        // tableName (child)
      //   masterRow,                           // fdMaster (master row)
      //   'tbl_finished_goods_delivery_master',         // tableNameMaster (master)
      //   'ExportMasterID',           // columnNamePrimary (PK)
      //   'FG_DeliveryMasterID',           // columnNameForign (FK in child)
      //   'Export',                     // serialType (your code uses it)
      //   'Export'                      // columnNameSerialNo (series name)
      // )
      //   .subscribe({
      //     next: (res: any) => {
      //       swal.fire('Success', 'Finish Goods sent saved successfully', 'success');
      //       this.finishGoodsProductionForm.reset({ ExportDate: new Date(), SentFrom: '', Note: '' });
      //       this.items.clear(); this.addItem();
      //     },
      //     error: () => {
      //       swal.fire('Error', 'Could not save requisition', 'error');
      //     }
      //   });
    }
}
