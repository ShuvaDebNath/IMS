import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import swal from 'sweetalert2';
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';

@Component({
  selector: 'app-generate-customer-visit',
  templateUrl: './generate-customer-visit.component.html',
  styleUrls: ['./generate-customer-visit.component.css']
})
export class GenerateCustomerVisitComponent {
taskForm!: FormGroup;
  isEdit = false;
  TaskId: any = '';
  CustomerList: any[] = [];
  userId: any = '';
  private destroy$ = new Subject<void>();

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
    this.userId = window.localStorage.getItem('userId') || '';
    this.title.setTitle('Generate Customer Visit');
    this.generateForm();
    this.addItem();
    this.loadPageData();

    const has = this.activeLink.snapshot.queryParamMap.has('Id');
    if (has) {
      this.TaskId = this.activeLink.snapshot.queryParams['Id'];
      this.isEdit = true;
      this.getEditData();
    } else {
      this.isEdit = false;
    }
  }

  generateForm() {
    const userName = window.localStorage.getItem('userName') || '';
    const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const taskNo = yyyymmdd + '-' + userName;

    this.taskForm = this.fb.group({
      TaskNo: [taskNo, [Validators.required]],
      Date: ['', [Validators.required]],
      items: this.fb.array([], { validators: [this.rowsCompleteValidator()] }),
    });
  }

  private rowsCompleteValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const arr = control as FormArray;
      if (arr.length === 0) return { noRows: true };

      for (const g of arr.controls) {
        const CustomerName = g.get('CustomerName')?.value;
        if (!CustomerName) return { incompleteRow: true };
      }
      return null;
    };
  }

  loadPageData(): void {
    var ProcedureData = {
      procedureName: '[usp_Task_GetInitialData]',
      parameters: {
        userID: this.userId,
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
    return this.taskForm.get('items') as FormArray;
  }

  addItem() {
    const row = this.fb.group({
      CustomerName: this.fb.control<number | null>(null, Validators.required),
      Buyer: this.fb.control<string | null>(null),
      Description: this.fb.control<string | null>(null),
      AlreadyReceivedArticle: this.fb.control<string | null>(null),
      UnitPriceUSD: this.fb.control<string | null>(null),
      UnitPriceBDT: this.fb.control<string | null>(null),
      ProdCostUnit: this.fb.control<string | null>(null),
      VisitPurpose: this.fb.control<string | null>(null),
      FirstOrderReceivedTime: this.fb.control<string | null>(null),
      LatestOrderReceivedTime: this.fb.control<string | null>(null),
    });

    this.items.push(row);
  }

  removeItem(i: number) {
    this.items.removeAt(i);
  }

  saveData() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      swal.fire('Validation Error', 'Please fill all required fields.', 'warning');
      return;
    }

    const fv = this.taskForm.value;

    const masterRow = {
      User_ID: this.userId,
      Date: fv.Date,
      Task_Report_Code: fv.TaskNo,
    };

    const detailRows = fv.items.map((i: any) => {
      const custId = i.CustomerName ?? null;
      const cust = this.CustomerList?.find((c: any) => String(c.Customer_ID) === String(custId));

      return {
        Customer_ID: custId,
        Buying_House: i.Buyer,
        Description: i.Description,
        Already_Receive_Order_Article: i.AlreadyReceivedArticle,
        Unit_Price_USD: i.UnitPriceUSD,
        Unit_Price_BDT: i.UnitPriceBDT,
        Prod_Cost_Unit: i.ProdCostUnit,
        Visit_Purpose: i.VisitPurpose,
        First_Received_Time: i.FirstOrderReceivedTime,
        Latest_Order_Receive_Time: i.LatestOrderReceivedTime,
        Task_Report_ID: '',
      };
    });

    this.doubleMasterEntryService
      .SaveDataMasterDetails(
        detailRows,
        'tbl_task_customer_visit_details',
        masterRow,
        'tbl_task_customer_visit_report',
        'Task_Report_ID',
        'Task_Report_ID',
        'CV',
        'CV'
      )
      .subscribe({
        next: (res: any) => {
          if (res.messageType === 'Success' && res.status) {
            swal.fire('Success', 'Report saved successfully', 'success');
            this.items.clear();
            this.taskForm.reset();
            this.addItem();
          } else {
            swal.fire('Save Failed', res?.message || 'Save failed.', 'info');
          }
        },
        error: () => {
          swal.fire('info', 'Could not save Report', 'info');
        },
      });
  }

  UpdateData(): void {
    if (this.taskForm.invalid) {
      swal.fire('Validation Error', 'Please fill all required fields.', 'warning');
      return;
    }

    const fv = this.taskForm.value;
    const masterRow = {
      User_ID: this.userId,
      Date: fv.Date,
      Task_Report_Code: fv.TaskNo,
    };

    const detailRows = fv.items.map((i: any) => {
      const custId = i.CustomerName ?? null;
      const cust = this.CustomerList?.find((c: any) => String(c.Customer_ID) === String(custId));
      const customerDisplay = cust ? cust.CustomerName : '';
      return {
        Customer_ID: custId,
        Buying_House: i.Buyer,
        Description: i.Description,
        Already_Receive_Order_Article: i.AlreadyReceivedArticle,
        Unit_Price_USD: i.UnitPriceUSD,
        Unit_Price_BDT: i.UnitPriceBDT,
        Prod_Cost_Unit: i.ProdCostUnit,
        Visit_Purpose: i.VisitPurpose,
        First_Received_Time: i.FirstOrderReceivedTime,
        Latest_Order_Receive_Time: i.LatestOrderReceivedTime,
        Task_Report_ID: '',
      };
    });

    var whereParam = {
      Task_Report_ID: this.TaskId,
    };

    this.doubleMasterEntryService
      .UpdateDataMasterDetails(
        detailRows,
        'tbl_task_customer_visit_details',
        masterRow,
        'tbl_task_customer_visit_report',
        'Task_Report_ID',
        'Task_Report_ID',
        'CV',
        'CV',
        whereParam
      )
      .subscribe({
        next: (res: any) => {
          if (res.messageType === 'Success' && res.status) {
            swal.fire('Success', 'Report Update successfully', 'success');
          } else {
            swal.fire('Update Failed', res?.message || 'Update failed.', 'info');
          }
        },
        error: () => {
          swal.fire('info', 'Could not update Report', 'info');
        },
      });
  }

  getEditData(): void {
    var ProcedureData = {
      procedureName: '[usp_Task_Customer_Visit_GetDataById]',
      parameters: {
        Id: this.TaskId,
      },
    };

    this.getDataService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          console.log(results);
          
          var data = JSON.parse(results.data).Tables1;
          const formArray = this.taskForm.get('items') as FormArray;
          formArray.clear();

          if (data && data.length > 0) {
            const d = new Date(data[0].Date);
            const localDate =
              d.getFullYear() +
              '-' +
              String(d.getMonth() + 1).padStart(2, '0') +
              '-' +
              String(d.getDate()).padStart(2, '0');

            this.taskForm.controls['TaskNo'].setValue(data[0].Task_Report_Code);
            this.taskForm.controls['Date'].setValue(localDate);
          }

          JSON.parse(results.data).Tables1.forEach((item: any) => {
            // map various possible names
            const buyer = item.Buying_House;
            const already = item.Already_Receive_Order_Article;
            const up1 = item.Unit_Price_USD;
            const up2 = item.Unit_Price_BDT;

            formArray.push(
              this.fb.group({
                CustomerName: [item.Customer_ID],
                Buyer: [buyer],
                Description: [item.Description ?? null],
                AlreadyReceivedArticle: [already],
                UnitPriceUSD: [up1],
                UnitPriceBDT: [up2],
                ProdCostUnit: [item.Prod_Cost_Unit],
                VisitPurpose: [item.Visit_Purpose],
                FirstOrderReceivedTime: [item.First_Received_Time],
                LatestOrderReceivedTime: [item.Latest_Order_Receive_Time],
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
}
