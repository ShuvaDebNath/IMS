import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LC } from 'src/app/models/LCModel';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { Roles } from 'src/app/models/roles.model';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';


@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css'],
})
export class UserCreateComponent {
  Formgroup!: FormGroup;
    isEdit = false;
    Id!: string;
    companyId!: string;
    menu: any;
    MarketingConcern: any;
    BenificiaryAccounts: any;
    PaymentTerms: any;
    PINo: any;
    SuperiorList:any;
    RoleList:any;
    SupplierList:any;
  
    insertPermissions: boolean = false;
    updatePermissions: boolean = false;
    deletePermissions: boolean = false;
    printPermissions: boolean = false;

    IsSupplierList:any = [
      { label: 'True', value: true },
      { label: 'False', value: false },
    ];
  
    constructor(
      private fb: FormBuilder,
      private masterEntyService: MasterEntryService,
      private gs: GlobalServiceService,
      private activeLink: ActivatedRoute,
      private title: Title
    ) {
      // this.gs.CheckToken().subscribe();
      let has = this.activeLink.snapshot.queryParamMap.has('Id');
      if (has) {
        this.Id = this.activeLink.snapshot.queryParams['Id'];
        this.isEdit = true;
      } else {
        this.isEdit = false;
      }
    }
  
    ngOnInit() {
      var permissions = this.gs.CheckUserPermission("Generate LC");
      this.insertPermissions = permissions.insertPermissions;
      this.updatePermissions = permissions.updatePermissions;
      this.deletePermissions = permissions.deletePermissions;
      this.printPermissions = permissions.printPermissions;
  
      if (!this.insertPermissions) {
        window.location.href = 'User';
      }
      if (!this.updatePermissions && this.isEdit) {
        window.location.href = 'User';
      }
  
      this.title.setTitle('User Create');
      this.GenerateFrom();
      this.getInitialData();
  
      if (this.isEdit) {
        this.GetUser();
      }
    }
  
    GenerateFrom() {
      this.Formgroup = this.fb.group({
        UserName: ['', [Validators.required]],
        Password: [[], [Validators.required]],
        Role: ['', [Validators.required]],
        Superior: ['', [Validators.required]],
        Supplier: ['', [Validators.required]],
        IsSupplier: ['', [Validators.required]],
        IsAuthorized: ['', [Validators.required]],
        Email: ['', [Validators.required]],
      });
    }
  
    getInitialData() {
      var ProcedureData = {
        procedureName: '[usp_User_GetInitialData]',
        parameters: {},
      };
  
      this.masterEntyService.GetInitialData(ProcedureData).subscribe({
        next: (results) => {
          if (results.status) {
            this.SuperiorList = JSON.parse(results.data).Tables1;
            this.RoleList = JSON.parse(results.data).Tables2;
          } else if (results.msg == 'Invalid Token') {
            swal.fire('Session Expierd!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {
          }
        },
        error: (err) => {},
      });
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

      var user = {
        UserName: this.Formgroup.value.UserName,
        Password: this.Formgroup.value.Password,
        Role_id: this.Formgroup.value.Role,
        Superior_ID: this.Formgroup.value.Superior,
        Supplier: this.Formgroup.value.Supplier,
        IsSupplier: this.Formgroup.value.IsSupplier=='True' ? 1 : 0,
        IsAuthorized: this.Formgroup.value.IsAuthorized=='True' ? 1 : 0,
        Email: this.Formgroup.value.Email
      }
      
  
      this.masterEntyService
        .SaveSingleData(
          user,
          'tbl_users'
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
                icon: 'info',
                timer: 5000,
              });
            }
          }
        });
    }
  
    GetUser() {
      var ProcedureData = {
        procedureName: '[usp_User_GetDataById]',
        parameters: {
          Id: this.Id,
        },
      };
      this.masterEntyService.GetInitialData(ProcedureData).subscribe({
        next: (results) => {
          if (results.status) {
            var tableData = JSON.parse(results.data).Tables1;
  
            tableData.forEach((e: any) => {

              this.Formgroup.controls.UserName.setValue(e.UserName);
              this.Formgroup.controls.Password.setValue(
                e.Password
              );
              this.Formgroup.controls.Role.setValue(e.Role_id);
              this.Formgroup.controls.Superior.setValue(
                e.Superior_ID
              );
              this.Formgroup.controls.Supplier.setValue(
                e.Supplier_ID
              );
              this.Formgroup.controls.IsSupplier.setValue(e.IsSupplier);
              this.Formgroup.controls.IsAuthorized.setValue(e.IsAuthorized);
              this.Formgroup.controls.Email.setValue(e.Email);
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
      // if (this.Formgroup.invalid) {
      //   swal.fire(
      //     'Invlid Inputs!',
      //     'Form is Invalid! Please select Role.',
      //     'info'
      //   );
      //   return;
      // }
  
      // var fDate = new Date();
      // const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      // const dd = String(fDate.getDate()).padStart(2, '0');
      // const yyyy = fDate.getFullYear();
  
      // const formatted = `${mm}/${dd}/${yyyy}`;
  
      // var lc = new LC();
      // lc.User_ID = this.Formgroup.value.Marketing_Concern;
      // //lc. = this.Formgroup.value.PINo;
      // lc.Beneficiary_Bank_ID = this.Formgroup.value.BenificiaryAccounts;
      // lc.Consignee_Name = this.Formgroup.value.Consignee_Name;
      // lc.LC_No = this.Formgroup.value.LCNo;
      // lc.LC_Value = this.Formgroup.value.LCValue;
      // if (
      //   this.Formgroup.value.LCReceivingDateByDraft != undefined &&
      //   this.Formgroup.value.LCReceivingDateByDraft != ''
      // ) {
      //   lc.LC_Receiving_Date_By_Bank =
      //     this.Formgroup.value.LCReceivingDateByDraft;
      // }
      // if (
      //   this.Formgroup.value.LCReceivingDateByDraft != undefined &&
      //   this.Formgroup.value.LCReceivingDateByDraft != ''
      // ) {
      //   lc.LC_Receiving_Date_By_Mail =
      //     this.Formgroup.value.LCReceivingDateByDraft;
      // }
      // if (
      //   this.Formgroup.value.IssueDate != undefined &&
      //   this.Formgroup.value.IssueDate != ''
      // ) {
      //   lc.Issue_Date = this.Formgroup.value.IssueDate;
      // }
      // if (
      //   this.Formgroup.value.ExpiryDate != undefined &&
      //   this.Formgroup.value.ExpiryDate != ''
      // ) {
      //   lc.Expiry_Date = this.Formgroup.value.ExpiryDate;
      // }
      // if (
      //   this.Formgroup.value.MaturityDate != undefined &&
      //   this.Formgroup.value.MaturityDate != ''
      // ) {
      //   lc.Maturity_Date = this.Formgroup.value.MaturityDate;
      // }
      // if (
      //   this.Formgroup.value.DocPresBankDate != undefined &&
      //   this.Formgroup.value.DocPresBankDate != ''
      // ) {
      //   lc.Presentation_To_Bank_Date = this.Formgroup.value.DocPresBankDate;
      // }
      // if (
      //   this.Formgroup.value.IPDocSendingDate != undefined &&
      //   this.Formgroup.value.IPDocSendingDate != ''
      // ) {
      //   lc.IP_Document_Sending_Date = this.Formgroup.value.IPDocSendingDate;
      // }
      // if (
      //   this.Formgroup.value.IPDocReceivingDate != undefined &&
      //   this.Formgroup.value.IPDocReceivingDate != ''
      // ) {
      //   lc.IP_Document_Receiving_Date = this.Formgroup.value.IPDocReceivingDate;
      // }
      // if (
      //   this.Formgroup.value.FDDRecDate != undefined &&
      //   this.Formgroup.value.FDDRecDate != ''
      // ) {
      //   lc.FddTtReceiveDate = this.Formgroup.value.FDDRecDate;
      // }
      // if (
      //   this.Formgroup.value.ActualPaymentRecDate != undefined &&
      //   this.Formgroup.value.ActualPaymentRecDate != ''
      // ) {
      //   lc.Actual_Payment_Receiving_Date =
      //     this.Formgroup.value.DocPrActualPaymentRecDateesBankDate;
      // }
      // if (
      //   this.Formgroup.value.ExportLCSCDate != undefined &&
      //   this.Formgroup.value.ExportLCSCDate != ''
      // ) {
      //   lc.Export_LC_SC_Date = this.Formgroup.value.ExportLCSCDate;
      // }
  
      // lc.Customer_Bank = this.Formgroup.value.CustomerBankName;
      // lc.Invoice_No = this.Formgroup.value.InvoiceNoWitDate;
      // lc.Payment_Term_ID = this.Formgroup.value.PaymentTermsLC;
      // lc.Export_LC_SC = this.Formgroup.value.ExportLCSC;
      // lc.LCA_Form_No = this.Formgroup.value.LCAFormNo;
      // lc.Applicant_TIN = this.Formgroup.value.ApplicantTIN;
      // lc.Applicant_BIN_VAT = this.Formgroup.value.ApplicantBINVAT;
      // lc.HS_Code = this.Formgroup.value.HSCode;
      // lc.Bank_BIN_No = this.Formgroup.value.BankBINNo;
      // lc.Remarks = this.Formgroup.value.Remarks;
      // lc.IRC_No = this.Formgroup.value.IRCNo;
      // lc.System_Created_Date = formatted;
      // lc.PI_No = this.Formgroup.value.PINo.join(',');
      
  
      // var condition = {
      //   'LC_ID':this.LCId
      // }
  
      // this.masterEntyService.UpdateData(lc,condition,'tbl_lc').subscribe({
      //   next: (results) => {
      //     if (results.status) {
      //       swal
      //         .fire({
      //           title: `${results.message}!`,
      //           text: `Update Successfully!`,
      //           icon: 'success',
      //           timer: 5000,
      //         })
      //         .then((result) => {
      //           this.ngOnInit();
      //         });
      //     } else if (results.message == 'Invalid Token') {
      //       swal.fire('Session Expierd!', 'Please Login Again.', 'info');
      //       this.gs.Logout();
      //     } else {
      //     }
      //   },
      //   error: (err) => {},
      // });
    }
}
