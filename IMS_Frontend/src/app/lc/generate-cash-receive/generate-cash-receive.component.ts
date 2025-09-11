import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CG } from 'src/app/models/cg';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { Roles } from 'src/app/models/roles.model';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-generate-cash-receive',
  templateUrl: './generate-cash-receive.component.html',
  styleUrls: ['./generate-cash-receive.component.css'],
})
export class GenerateCashReceiveComponent {
  Formgroup!: FormGroup;
  isEdit = false;
  PIList: any;
  CID!: string;
  companyId!: string;
  menu: any;
  MarketingConcern: any;
  BenificiaryAccounts: any;
  PaymentTerms: any;
  PINo: any;
  ReceiveAmount: any = 0;

  insertPermissions: boolean = false;
  updatePermissions: boolean = false;
  deletePermissions: boolean = false;
  printPermissions: boolean = false;

  constructor(
    private fb: FormBuilder,
    private masterEntyService: MasterEntryService,
    private gs: GlobalServiceService,
    private activeLink: ActivatedRoute,
    private title: Title
  ) {
    // this.gs.CheckToken().subscribe();
    let has = this.activeLink.snapshot.queryParamMap.has('CR_Id');
    if (has) {
      this.CID = this.activeLink.snapshot.queryParams['CR_Id'];
      this.isEdit = true;
    } else {
      this.isEdit = false;
    }
  }

  ngOnInit() {
    var permissions = this.gs.CheckUserPermission(
      'Generate Commercial Invoice'
    );
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
      window.location.href = 'all-cash-receive';
    }

    this.title.setTitle('Generate Cash Receive');
    this.GenerateFrom();
    this.getInitialData();

    if (this.isEdit) {
      this.GetGenerateCashReceiveData();
    }
  }

  GenerateFrom() {
    this.Formgroup = this.fb.group({
      Marketing_Concern: ['', [Validators.required]],
      BenificiaryAccounts: ['', [Validators.required]],
      Consignee_Name: ['', [Validators.required]],
      Customer_Bank: ['', [Validators.required]],
      PI: ['', !this.isEdit ? [Validators.required] : []],
      PINo: [''],
      PIValue: ['', [Validators.required]],
      ReceiveAmount: ['', [Validators.required]],
      ReceiveDate: ['', [Validators.required]],
      IssueDate: ['', [Validators.required]],
      PaymentTerms: ['', [Validators.required]],
      Remarks: [''],
    });
  }

  getInitialData() {
    var ProcedureData = {
      procedureName: '[usp_CashReceive_GetInitialData]',
      parameters: {},
    };

    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.BenificiaryAccounts = JSON.parse(results.data).Tables1;
          this.PaymentTerms = JSON.parse(results.data).Tables2;
          this.MarketingConcern = JSON.parse(results.data).Tables3;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }

  getPINoByMarketingConcern() {
    var ProcedureData = {
      procedureName: '[usp_CashReceive_PINo_ByMarketingConcern]',
      parameters: {
        UserID: this.Formgroup.value.Marketing_Concern,
        CR_ID: '',
      },
    };

    if (this.isEdit) {
      ProcedureData = {
        procedureName: '[usp_CashReceive_PINo_ByMarketingConcern_edit]',
        parameters: {
          UserID: this.Formgroup.value.Marketing_Concern,
          CR_ID: this.CID,
        },
      };
    }

    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
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

  getCashReceiveInfoByPI() {
    var ProcedureData = {
      procedureName: '[usp_CG_PINo_ByMarketingConcern]',
      parameters: {
        PIId: this.Formgroup.value.PI,
      },
    };

    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {

        if (results.status) {
          var details = JSON.parse(results.data).Tables1;
          this.Formgroup.controls.Consignee_Name.setValue(details[0].Consignee);
          this.Formgroup.controls.PIValue.setValue(details[0].totalAmount);
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }
  checkReceiveAmount() {
    if (this.Formgroup.value.ReceiveAmount > this.Formgroup.value.PIValue) {
      swal.fire(
        'Warning!',
        'Receive Amount should not be greater than PI Value',
        'warning'
      );
      this.Formgroup.controls.ReceiveAmount.setValue(0);
      return;
    }
  }
  saveData() {
    if (this.Formgroup.invalid) {
      swal.fire(
        'Invlid Inputs!',
        'Form is Invalid! Please select Role.',
        'info'
      );
      return;
    }
    var fDate = new Date();
    const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();

    const formatted = `${mm}/${dd}/${yyyy}`;

    var filterSuperior = this.MarketingConcern.filter(
      (e: any) => e.User_ID == this.Formgroup.value.Marketing_Concern
    );

    var userId = window.localStorage.getItem('userId');
    var cd = new CG();
    cd.Superior_ID = filterSuperior[0].Superior_ID;
    cd.Consignee_Name = this.Formgroup.value.Consignee_Name;
    cd.Beneficiary_Bank_ID = this.Formgroup.value.BenificiaryAccounts;
    cd.PI_Value = this.Formgroup.value.PIValue;
    cd.Customer_Bank = this.Formgroup.value.Customer_Bank;
    cd.Remarks = this.Formgroup.value.Remarks;
    cd.Payment_Term_ID = this.Formgroup.value.PaymentTerms;
    cd.System_Created_Date = this.Formgroup.value.QtyRolls;
    cd.User_ID = this.Formgroup.value.Marketing_Concern;
    cd.Last_Receive_Amount = this.Formgroup.value.ReceiveAmount;
    cd.Total_Receive_Amount = this.Formgroup.value.ReceiveAmount;
    cd.Last_Receive_Date =
      this.Formgroup.value.ReceiveDate == undefined
        ? null
        : this.Formgroup.value.ReceiveDate;
    cd.Issue_Date =
      this.Formgroup.value.IssueDate == undefined
        ? null
        : this.Formgroup.value.IssueDate;
    cd.Balance =
      this.Formgroup.value.PIValue - this.Formgroup.value.ReceiveAmount;
    cd.PI_Master_ID = this.Formgroup.value.PI;
    cd.System_Created_Date = formatted;

    var TableNameMaster = 'tbl_cash_receive_master';
    var TableNameChild = 'tbl_cash_receive_detail';

    var ColumnNamePrimary = 'CR_ID';
    var ColumnNameForign = 'CR_ID';

    var detailsData: any = [];

    var details = {
      ReceiveAmount: this.Formgroup.value.ReceiveAmount,
      ReceiveDate:
        this.Formgroup.value.ReceiveDate == undefined
          ? null
          : this.Formgroup.value.ReceiveDate,
      CreatedDate: formatted,
      UserId: userId,
      CR_ID: '',
    };

    detailsData.push(details);

    var whereParam = {
      PI_Master_ID: this.Formgroup.value.PI,
    };

    this.masterEntyService
      .SaveDataMasterDetails(
        detailsData,
        TableNameChild,
        cd,
        TableNameMaster,
        ColumnNamePrimary,
        ColumnNameForign,
        '',
        '',
        false,
        whereParam
      )
      .subscribe((res: any) => {

        if (res.status) {
          swal
            .fire({
              title: `${res.message}!`,
              text: `Save Successfully!`,
              icon: 'success',
              timer: 5000,
            })
            .then((result) => {
              this.ngOnInit();
            });
        } else {
          if (res.message == 'Data already exist') {
            swal.fire('Data already exist', '', 'warning');
          } else if (res.message == 'Invalid Token') {
            swal.fire('Session Expierd!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {
            swal.fire({
              title: `Faild!`,
              text: `Save Faild!`,
              icon: 'error',
              timer: 5000,
            });
          }
        }
      });
  }

  GetGenerateCashReceiveData() {
    // crm.User_ID,Beneficiary_Bank_ID,crm.Consignee_Name,Customer_Bank,PI_Master_ID,PI_Value,ReceiveAmount,ReceiveDate,Issue_Date,Payment_Term_ID,Remarks
    var ProcedureData = {
      procedureName: '[usp_CG_ById]',
      parameters: {
        CG_ID: this.CID,
      },
    };
    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          var tableData = JSON.parse(results.data).Tables1;

          tableData.forEach((e: any) => {
            this.Formgroup.controls.Marketing_Concern.setValue(e.User_ID);
            this.Formgroup.controls.BenificiaryAccounts.setValue(
              e.Beneficiary_Bank_ID
            );
            this.Formgroup.controls.Consignee_Name.setValue(e.Consignee_Name);
            this.Formgroup.controls.Customer_Bank.setValue(e.Customer_Bank);
            this.Formgroup.controls.PINo.setValue(e.PINo);
            this.Formgroup.controls.PIValue.setValue(e.PI_Value);
            this.Formgroup.controls.ReceiveAmount.setValue(e.ReceiveAmount);
            this.Formgroup.controls.ReceiveDate.setValue(e.ReceiveDate);
            this.Formgroup.controls.IssueDate.setValue(e.Issue_Date);
            this.Formgroup.controls.PaymentTerms.setValue(e.Payment_Term_ID);
            this.Formgroup.controls.Remarks.setValue(e.Remarks);
          });
        } else if (results.message == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }

  updateData() {
    if (this.Formgroup.invalid) {
      swal.fire('Invaild Input', 'Please check inputs', 'error');
      return;
    }
    var cd = new CG();
    cd.Consignee_Name = this.Formgroup.value.Consignee_Name;
    cd.Beneficiary_Bank_ID = this.Formgroup.value.BenificiaryAccounts;
    cd.Customer_Bank = this.Formgroup.value.Customer_Bank;
    cd.Remarks = this.Formgroup.value.Remarks;
    cd.Payment_Term_ID = this.Formgroup.value.PaymentTerms;
    cd.Issue_Date =
      this.Formgroup.value.IssueDate == undefined
        ? null
        : this.Formgroup.value.IssueDate;

    let queryParams = cd;
    let condition = {
      CR_ID: this.CID,
    };
    let tableName = 'tbl_cash_receive_master';

    this.masterEntyService
      .UpdateData(queryParams, condition, tableName)
      .subscribe((res: any) => {
        if (res.status) {
          swal
            .fire({
              title: `${res.message}!`,
              text: `Update Successfully!`,
              icon: 'success',
              timer: 5000,
            })
            .then((result) => {
              this.ngOnInit();
            });
        } else {
          if (res.message == 'Invalid Token') {
            swal.fire('Session Expierd!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {
            swal.fire({
              title: `Faild!`,
              text: `Save Faild!`,
              icon: 'error',
              timer: 5000,
            });
          }
        }
      });
  }
}
