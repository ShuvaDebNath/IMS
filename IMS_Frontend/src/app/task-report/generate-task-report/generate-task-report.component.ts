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
  selector: 'app-generate-task-report',
  templateUrl: './generate-task-report.component.html',
  styleUrls: ['./generate-task-report.component.css'],
})
export class GenerateTaskReportComponent {
  taskForm!: FormGroup;
  isEdit = false;
  exportDate: Date = new Date();
  private destroy$ = new Subject<void>();
  private unitByArticleId = new Map<number, number | null>();
  rollOrBagOptions = [
    { label: 'Rolls', value: 'roll' },
    { label: 'Bags', value: 'bag' },
  ];

  type = [
    { label: 'N/A', value: 'N/A' },
    { label: 'Old', value: 'Old' },
    { label: 'New', value: 'New' },
  ];
  solveList = [
    { label: 'N/A', value: 'N/A' },
    { label: 'Yes solved', value: 'Yes solved' },
    { label: 'Not Solved', value: 'Not Solved' },
  ];
  reloadingArticles = false;
  LoadingPortList: any[] = [];
  DestinationPortList: any[] = [];
  RawMaterialList: any[] = [];
  WidthList: any[] = [];
  ColorList: any[] = [];
  UnitList: any[] = [];
  TaskId: any = '';
  CustomerList: any[] = [];
  userId: any = '';
  superiorId: any = '';
  BuyerList: any[] = [];

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
    this.userId = window.localStorage.getItem('userId');
    this.title.setTitle('Generate Task Report');
    this.generateForm();
    this.addItem();
    this.loadPageData();
    console.log(this.userId);

    let has = this.activeLink.snapshot.queryParamMap.has('Id');
    if (has) {
      this.TaskId = this.activeLink.snapshot.queryParams['Id'];
      this.isEdit = true;
      this.getEditData();
    } else {
      this.isEdit = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  generateForm() {
    var userName = window.localStorage.getItem('userName');
    const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    var taskNo = yyyymmdd + '-' + userName;

    console.log(taskNo);

    this.taskForm = this.fb.group({
      TaskNo: [taskNo, [Validators.required]],
      ToMail: ['', [Validators.required, Validators.email]],
      CcMail: [
        'lilya@sunshineinterlining.com',
        [Validators.required, Validators.email],
      ],
      Date: ['', [Validators.required]],
      items: this.fb.array([], { validators: [this.rowsCompleteValidator()] }),
    });
  }

  private rowsCompleteValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const arr = control as FormArray;
      if (arr.length === 0) return { noRows: true };

      for (const g of arr.controls) {
        const InTime = g.get('InTime')?.value;
        const OutTime = g.get('OutTime')?.value;
        const CustomerName = g.get('CustomerName')?.value;
        const Discussion = g.get('discussion')?.value;

        if (!Discussion || !InTime || !OutTime || !CustomerName) {
          return { incompleteRow: true };
        }
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
          this.BuyerList = JSON.parse(results.data).Tables3;
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
    const row = this.fb.group(
      {
        Buyer_Name: this.fb.control<string | null>(null, Validators.required),
        CustomerName: this.fb.control<string | null>(null, Validators.required),
        InTime: this.fb.control<string | null>(null, Validators.required),
        OutTime: this.fb.control<string | null>(null, Validators.required),
        Type: this.fb.control<string | null>(null, Validators.required),
        discussion: this.fb.control<string | null>(null, Validators.required),
        purpose: this.fb.control<string | null>(null, Validators.required),
        PaymentIssue: this.fb.control<string | null>(null, Validators.required),
        CommercialIssue: this.fb.control<string | null>(
          null,
          Validators.required
        ),
        SampleSubmit: this.fb.control<string | null>(null, Validators.required),
      },
      { validators: [this.outTimeAfterInValidator()] }
    );

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
      Mail_TO: fv.ToMail,
      Mail_CC: fv.CcMail,
      User_ID: this.userId,
      Superior_ID: fv.superiorId,
      Date: fv.Date,
      Task_Report_Code: fv.TaskNo,
      MailBody: '',
      Subject: '',
    };

    var messegeBody =
      'Dear Sir/Madam,<br/><br/>Hope you are doing well.<br/><br/>Please see the work report-<br/><br/>';
    var index = 0;
    const detailRows = fv.items.map((i: any) => {
      index++;
      // row can store the selected customer id in CustomerName control
      const custId = i.CustomerName ?? i.CustomerId ?? null;
      const cust = this.CustomerList?.find(
        (c: any) => String(c.Customer_ID) === String(custId)
      );
      console.log(cust);

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
      messegeBody += `Customer No: ${index}<br/>Location: ${Location}<br/>Merchandiser Name: ${customerContactPerson}<br/>Number: ${customerPhone}<br/>Customer Info: ${customerInfo}<br/>In Time: ${
        i.InTime
      }<br/>Out Time: ${i.OutTime}<br/>Discussion: ${
        i.discussion ?? i.description ?? ''
      }<br/><br/>`;
      return {
        InTime: this.formatDateTime(i.InTime),
        OutTime: this.formatDateTime(i.OutTime),
        Customer_ID: custId,
        Discussion: i.discussion ?? i.description ?? '',
        Customer_name: customerDisplay,
        Task_Report_ID: '',
        BuyerId: Buyer_Name,
        Type: Type,
        PaymentIssue: PaymentIssue,
        CommercialIssue: CommercialIssue,
        SampleSubmit: SampleSubmit,
        Purpose: i.purpose
      };
    });

    messegeBody += 'Best Regards,<br/>';
    messegeBody += localStorage.getItem('userName') || '';
    console.log(detailRows);

    masterRow['MailBody'] = messegeBody;
    // build Subject dynamically: Employee Daily Report - <YYYYMMDD>-<USERNAME>
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}${String(now.getDate()).padStart(2, '0')}`;
    const username = (localStorage.getItem('userName') || '').toString();
    masterRow['Subject'] = `Employee Daily Report - ${ymd}-${username}`;

    this.doubleMasterEntryService
      .MailThenInsert(
        detailRows, // fd (child rows)
        'tbl_task_report_details', // tableName (child)
        masterRow, // fdMaster (master row)
        'tbl_task_report', // tableNameMaster (master)
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
      Mail_TO: fv.ToMail,
      Mail_CC: fv.CcMail,
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
        InTime: this.formatDateTime(i.InTime),
        OutTime: this.formatDateTime(i.OutTime),
        Customer_ID: custId,
        Discussion: i.discussion ?? i.description ?? '',
        Customer_name: customerDisplay,
        Task_Report_ID: '',
        BuyerId: Buyer_Name,
        Type: Type,
        PaymentIssue: PaymentIssue,
        CommercialIssue: CommercialIssue,
        SampleSubmit: SampleSubmit,
        Purpose: i.purpose
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
        'tbl_task_report_details', // tableName (child)
        masterRow, // fdMaster (master row)
        'tbl_task_report', // tableNameMaster (master)
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
      procedureName: '[usp_Task_GetDataById]',
      parameters: {
        Id: this.TaskId,
      },
    };

    this.getDataService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          var data = JSON.parse(results.data).Tables1;

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

          this.taskForm.controls['ToMail'].setValue(data[0].Mail_TO);
          this.taskForm.controls['CcMail'].setValue(data[0].Mail_CC);
          this.taskForm.controls['TaskNo'].setValue(data[0].Task_Report_Code);
          this.taskForm.controls['Date'].setValue(
            localDate
          );

          JSON.parse(results.data).Tables1.forEach((item: any) => {
            formArray.push(
              this.fb.group({
                CustomerName: [item.Customer_ID],
                // parse incoming ISO timestamps into Date objects so p-calendar shows them
                InTime: [this.parseISOToLocalDate(item.InTime)],
                OutTime: [this.parseISOToLocalDate(item.OutTime)],
                discussion: [item.Discussion],
                Buyer_Name: [item.BuyerId],
                Type: [item.Type],
                PaymentIssue: [item.PaymentIssue],
                CommercialIssue: [item.CommercialIssue],
                SampleSubmit: [item.SampleSubmit],
                purpose: [item.Purpose],
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
