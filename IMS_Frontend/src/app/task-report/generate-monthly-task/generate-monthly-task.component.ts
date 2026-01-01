import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  FormArray,
  FormGroup,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import swal from 'sweetalert2';
import { DropdownModule } from 'primeng/dropdown';
import { startWith, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';

@Component({
  selector: 'app-generate-monthly-task',
  templateUrl: './generate-monthly-task.component.html',
  styleUrls: ['./generate-monthly-task.component.css']
})
export class GenerateMonthlyTaskComponent implements OnInit {
  taskForm!: FormGroup;
  isEdit = false;
  exportDate: Date = new Date();
  private destroy$ = new Subject<void>();

  teamOptions = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
  ];

  orderSeasons = [
    { label: 'N/A', value: 'N/A' },
    { label: 'Regular', value: 'Regular' },
    { label: '1 Season', value: '1 Season' },
    { label: '2 Season', value: '2 Season' },
    { label: '3 Season', value: '3 Season' },
  ];
  reloadingArticles = false;
  TaskId: any = '';
  CustomerList: any[] = [];
  BuyerList: any[] = [];
  userId: any = '';
  superiorId: any = '';

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
    this.title.setTitle('Generate Monthly Task Report');
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
          this.superiorId = JSON.parse(results.data).Tables2[0];
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
      TeamSize: this.fb.control<number | null>(null),
      OrderSeason: this.fb.control<string | null>('N/A'),
      Description: this.fb.control<string | null>(null),
      Visit1: this.fb.control<string | null>(null),
      Visit2: this.fb.control<string | null>(null),
      Visit3: this.fb.control<string | null>(null),
      OrderSummary: this.fb.control<string | null>(null),
      SampleSummary: this.fb.control<string | null>(null),
      NewArticleSummary: this.fb.control<string | null>(null),
    });

    this.items.push(row);
  }

  removeItem(i: number) {
    this.items.removeAt(i);
  }

  private outTimeAfterInValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control) return null;
      const group = control as FormGroup;

      const inVal = group.get('InTime')?.value;
      const outVal = group.get('OutTime')?.value;

      // If either is missing keep other validators (required) to handle empty
      if (!inVal || !outVal) {
        // remove previous outBeforeIn error if present
        const outCtrl = group.get('OutTime');
        if (outCtrl && outCtrl.hasError && outCtrl.hasError('outBeforeIn')) {
          const errs = { ...outCtrl.errors };
          delete errs['outBeforeIn'];
          outCtrl.setErrors(Object.keys(errs).length ? errs : null);
        }
        return null;
      }

      const inDate = new Date(inVal);
      const outDate = new Date(outVal);

      if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) return null;

      if (outDate < inDate) {
        const outCtrl = group.get('OutTime');
        const errs = { ...(outCtrl?.errors || {}) } as any;
        errs['outBeforeIn'] = true;
        outCtrl?.setErrors(errs);
        return { outBeforeIn: true };
      }

      // clear error if previously set
      const outCtrl = group.get('OutTime');
      if (outCtrl && outCtrl.hasError && outCtrl.hasError('outBeforeIn')) {
        const errs = { ...outCtrl.errors };
        delete errs['outBeforeIn'];
        outCtrl.setErrors(Object.keys(errs).length ? errs : null);
      }

      return null;
    };
  }

  saveData() {
    console.log(this.taskForm);

    if (this.taskForm.invalid) {
      // mark all controls so validation messages show in the UI
      this.taskForm.markAllAsTouched();
      swal.fire(
        'Validation Error',
        'Please fill all required fields.',
        'warning'
      );
      return;
    }

    const sentByStr = localStorage.getItem('userId');
    const sentBy = sentByStr ? Number(sentByStr) : null;

    const nowUtc = new Date();
    const bdOffsetMs = 6 * 60 * 60 * 1000;
    const bdLocal = new Date(nowUtc.getTime() + bdOffsetMs);
    const sqlDate = bdLocal.toISOString().slice(0, 19).replace('T', ' ');

    const formatted = sqlDate;

    // 1) Form -> DTO (typed)
    const fv = this.taskForm.value;

    const masterRow = {
      User_ID: this.userId,
      Superior_ID: fv.superiorId,
      Date: fv.Date,
      Task_Report_Code: fv.TaskNo,
    };

    
    var index = 0;
    const detailRows = fv.items.map((i: any) => {
      index++;
      const custId = i.CustomerName ?? null;
      const cust = this.CustomerList?.find(
        (c: any) => String(c.Customer_ID) === String(custId)
      );

      const customerDisplay = cust ? cust.CustomerName : '';
      const Location = cust ? cust.Customer_Address : '';
      const customerPhone = cust ? cust.Phone_No : '';
      const customerContactPerson = cust ? cust.Contact_Name : '';

      return {
        Customer_ID: custId,
        Customer_name: customerDisplay,
        TeamSize: i.TeamSize,
        OrderSeason: i.OrderSeason,
        Description: i.Description,
        Visit1: i.Visit1,
        Visit2: i.Visit2,
        Visit3: i.Visit3,
        OrderSummary: i.OrderSummary,
        SampleSummary: i.SampleSummary,
        NewArticleSummary: i.NewArticleSummary,
        Task_Report_ID: '',
      };
    });



    this.doubleMasterEntryService
      .SaveDataMasterDetails(
        detailRows, // fd (child rows)
        'tbl_task_monthly_report_details', // tableName (child)
        masterRow, // fdMaster (master row)
        'tbl_task_monthly_report', // tableNameMaster (master)
        'Task_Report_ID', // columnNamePrimary (PK)
        'Task_Report_ID', // columnNameForign (FK in child)
        'TR', // serialType (your code uses it)
        'TR' // columnNameSerialNo (series name)
      )
      .subscribe({
        next: (res: any) => {
          if (res.messageType === 'Success' && res.status) {
            swal.fire('Success', 'Task saved successfully', 'success');
            this.items.clear();
            this.taskForm.reset();
            this.addItem();
          } else {
            swal.fire(
              'Task Update Failed',
              res?.message || 'Task update failed.',
              'info'
            );
          }
        },
        error: () => {
          swal.fire('info', 'Could not save Task', 'info');
        },
      });
  }

  UpdateData(): void {
    if (this.taskForm.invalid) {
      swal.fire(
        'Validation Error',
        'Please fill all required fields.',
        'warning'
      );
      return;
    }

    const sentByStr = localStorage.getItem('userId');
    const sentBy = sentByStr ? Number(sentByStr) : null;

    const nowUtc = new Date();
    const bdOffsetMs = 6 * 60 * 60 * 1000;
    const bdLocal = new Date(nowUtc.getTime() + bdOffsetMs);
    const sqlDate = bdLocal.toISOString().slice(0, 19).replace('T', ' ');

    const formatted = sqlDate;

    // 1) Form -> DTO (typed)
    const fv = this.taskForm.value;

    const masterRow = {
      User_ID: this.userId,
      Superior_ID: fv.superiorId,
      Date: fv.Date,
      Task_Report_Code: fv.TaskNo,
    };

    var index = 0;
    const detailRows = fv.items.map((i: any) => {
      index++;
      // row can store the selected customer id in CustomerName control
      const custId = i.CustomerName ?? i.CustomerId ?? null;
      const cust = this.CustomerList?.find(
        (c: any) => String(c.Customer_ID) === String(custId)
      );
      console.log(i);
      
      const customerDisplay = cust ? cust.CustomerName : '';
      const Location = cust ? cust.Customer_Address : '';
      const customerPhone = cust ? cust.Phone_No : '';
      const customerContactPerson = cust ? cust.Contact_Name : '';
      const Buyer_Name = i ? i.Buyer_Name : '';
      const Type = i ? i.Type : '';
      const PaymentIssue = i ? i.PaymentIssue : '';
      const CommercialIssue = i ? i.CommercialIssue : '';
      const SampleSubmit = i ? i.SampleSubmit : '';
      const customerInfo = cust ? cust.Company_Info : '';
      return {
        Customer_ID: custId,
        Customer_name: customerDisplay,
        TeamSize: i.TeamSize,
        OrderSeason: i.OrderSeason,
        Description: i.Description,
        Visit1: i.Visit1,
        Visit2: i.Visit2,
        Visit3: i.Visit3,
        OrderSummary: i.OrderSummary,
        SampleSummary: i.SampleSummary,
        NewArticleSummary: i.NewArticleSummary,
        Task_Report_ID: '',
      };
    });

    // build Subject dynamically: Employee Daily Report - <YYYYMMDD>-<USERNAME>
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}${String(now.getDate()).padStart(2, '0')}`;
    const username = (localStorage.getItem('userName') || '').toString();
    var whereParam = {
      Task_Report_ID: this.TaskId,
    };

    console.log((detailRows));
    

    this.doubleMasterEntryService
      .UpdateDataMasterDetails(
        detailRows, // fd (child rows)
        'tbl_task_monthly_report_details', // tableName (child)
        masterRow, // fdMaster (master row)
        'tbl_task_monthly_report', // tableNameMaster (master)
        'Task_Report_ID', // columnNamePrimary (PK)
        'Task_Report_ID', // columnNameForign (FK in child)
        'TR', // serialType (your code uses it)
        'TR', // columnNameSerialNo (series name)
        whereParam
      )
      .subscribe({
        next: (res: any) => {
          if (res.messageType === 'Success' && res.status) {
            swal.fire('Success', 'Task Update successfully', 'success');
          } else {
            swal.fire(
              'Task Update Failed',
              res?.message || 'Task update failed.',
              'info'
            );
          }
        },
        error: () => {
          swal.fire('info', 'Could not save Task', 'info');
        },
      });
  }

  private formatDateTime(value: any): string | null {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;

    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const HH = String(d.getHours()).padStart(2, '0');
    const MM = String(d.getMinutes()).padStart(2, '0');
    const SS = String(d.getSeconds()).padStart(2, '0');

    return `${yyyy}/${mm}/${dd} ${HH}:${MM}:${SS}`;
  }

  /**
   * Parse an ISO-like timestamp (e.g. '2025-02-12T15:19:25') into a local Date.
   * Handles timestamps without timezone by treating them as local values.
   */
  private parseISOToLocalDate(iso?: string | null): Date | null {
    if (!iso) return null;

    // match YYYY-MM-DDTHH:mm:ss (seconds optional)
    const s = String(iso).trim();

    // Primary match: ISO-like 'YYYY-MM-DDTHH:mm:ss' or 'YYYY-MM-DD HH:mm:ss'
    const isoMatch = s.match(
      /^([0-9]{4})-([0-9]{2})-([0-9]{2})(?:[T\s]([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?)?/
    );
    if (isoMatch) {
      const year = Number(isoMatch[1]);
      const month = Number(isoMatch[2]) - 1;
      const day = Number(isoMatch[3]);
      const hour = Number(isoMatch[4] ?? '0');
      const minute = Number(isoMatch[5] ?? '0');
      const second = Number(isoMatch[6] ?? '0');
      return new Date(year, month, day, hour, minute, second);
    }

    // fallback (handles strings with timezone like 'Z' or +05:30)
    const tokens = s.split(/[^0-9]+/).filter(Boolean);
    if (tokens.length >= 3) {
      const a = Number(tokens[0]);
      const b = Number(tokens[1]);
      const c = Number(tokens[2]);

      // If first token looks like year (>=1000), treat as YYYY/MM/DD
      if (a >= 1000) {
        const year = a;
        const month = (b || 1) - 1;
        const day = c || 1;
        const hour = Number(tokens[3] ?? '0');
        const minute = Number(tokens[4] ?? '0');
        const second = Number(tokens[5] ?? '0');
        return new Date(year, month, day, hour, minute, second);
      }

      // If first token > 12 assume it's a day -> DD/MM/YYYY
      if (a > 12) {
        const day = a;
        const month = (b || 1) - 1;
        const year = c;
        const hour = Number(tokens[3] ?? '0');
        const minute = Number(tokens[4] ?? '0');
        const second = Number(tokens[5] ?? '0');
        return new Date(year, month, day, hour, minute, second);
      }

      // Otherwise if second token > 12 assume first is month (MM/DD/YYYY)
      if (b > 12) {
        const month = a - 1;
        const day = b;
        const year = c;
        const hour = Number(tokens[3] ?? '0');
        const minute = Number(tokens[4] ?? '0');
        const second = Number(tokens[5] ?? '0');
        return new Date(year, month, day, hour, minute, second);
      }

      // Ambiguous small numbers — assume DD/MM/YYYY by default (common outside US)
      const day = a;
      const month = (b || 1) - 1;
      const year = c;
      const hour = Number(tokens[3] ?? '0');
      const minute = Number(tokens[4] ?? '0');
      const second = Number(tokens[5] ?? '0');
      return new Date(year, month, day, hour, minute, second);
    }

    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  getEditData(): void {
    console.log(this.TaskId);

    var ProcedureData = {
      procedureName: '[usp_Task_monthly_GetDataById]',
      parameters: {
        Id: this.TaskId,
      },
    };

    this.getDataService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          var data = JSON.parse(results.data).Tables1;
          console.log(data);
          
          const formArray = this.taskForm.get('items') as FormArray;
          formArray.clear();
          console.log(data, new Date(data[0].Date));
          const d = new Date(data[0].Date);

          const localDate =
            d.getFullYear() +
            '-' +
            String(d.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(d.getDate()).padStart(2, '0');

          this.taskForm.controls['TaskNo'].setValue(data[0].Task_Report_Code);
          this.taskForm.controls['Date'].setValue(
            localDate
          );

          JSON.parse(results.data).Tables1.forEach((item: any) => {
            // accept multiple possible server field names for team size and coerce to number
            const teamSizeRaw = item.TeamSize ?? item.Team_Size ?? item.Team ?? item.teamSize ?? null;
            const teamSize = teamSizeRaw != null && String(teamSizeRaw).trim() !== '' && !isNaN(Number(teamSizeRaw))
              ? Number(teamSizeRaw)
              : null;
            const orderSeason = item.OrderSeason ?? item.Order_Season ?? item.Season ?? 'N/A';

            formArray.push(
              this.fb.group({
                CustomerName: [item.Customer_ID],
                TeamSize: [teamSize],
                OrderSeason: [orderSeason],
                Description: [item.Description ?? item.Discussion ?? null],
                Visit1: [item.Visit1 ?? null],
                Visit2: [item.Visit2 ?? null],
                Visit3: [item.Visit3 ?? null],
                OrderSummary: [item.OrderSummary ?? null],
                SampleSummary: [item.SampleSummary ?? item.SampleSubmit ?? null],
                NewArticleSummary: [item.NewArticleSummary ?? null],
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
