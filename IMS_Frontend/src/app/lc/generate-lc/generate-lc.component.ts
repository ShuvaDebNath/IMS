import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LC } from 'src/app/models/LCModel';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';
import { DateFormat } from 'src/app/shared/date-format';

@Component({
  selector: 'app-generate-lc',
  templateUrl: './generate-lc.component.html',
  styleUrls: ['./generate-lc.component.css'],
})
export class GenerateLcComponent {
  Formgroup!: FormGroup;
  isEdit = false;
  LCId!: string;
  companyId!: string;
  menu: any;
  MarketingConcern: any;
  BenificiaryAccounts: any;
  PaymentTerms: any;
  PINo: any;

  insertPermissions: boolean = false;
  updatePermissions: boolean = false;
  deletePermissions: boolean = false;
  printPermissions: boolean = false;

  piArrInt:any = [];

  constructor(
    private fb: FormBuilder,
    private masterEntyService: MasterEntryService,
    private gs: GlobalServiceService,
    private activeLink: ActivatedRoute,
    private title: Title
  ) {
    // this.gs.CheckToken().subscribe();
    let has = this.activeLink.snapshot.queryParamMap.has('LC_No');
    if (has) {
      this.LCId = this.activeLink.snapshot.queryParams['LC_No'];
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
      window.location.href = 'all-lc';
    }
    if (!this.updatePermissions && this.isEdit) {
      window.location.href = 'all-lc';
    }

    this.title.setTitle('Generate LC');
    this.GenerateFrom();
    this.getInitialData();

    if (this.isEdit) {
      this.GetLCById(this.LCId);
    }
  }

  GenerateFrom() {
    this.Formgroup = this.fb.group({
      Marketing_Concern: ['', [Validators.required]],
      PINo: [[], [Validators.required]],
      BenificiaryAccounts: ['', [Validators.required]],
      Consignee_Name: [''],
      LCReceivingDateByDraft: [''],
      LCReceivingDateOrgBank: [''],
      LCNo: ['', [Validators.required]],
      LCValue: ['', [Validators.required]],
      IssueDate: ['', [Validators.required]],
      ExpiryDate: [''],
      CustomerBankName: [''],
      InvoiceNoWitDate: [''],
      IPDocSendingDate: [''],
      IPDocReceivingDate: [''],
      PaymentTermsLC: ['', [Validators.required]],
      MaturityDate: [''],
      DocPresBankDate: [''],
      FDDRecDate: [''],
      ExportLCSC: [''],
      ActualPaymentRecDate: [''],
      ExportLCSCDate: [''],
      LCAFormNo: [''],
      ApplicantTIN: [''],
      ApplicantBINVAT: [''],
      HSCode: [''],
      BankBINNo: [''],
      Remarks: [''],
      IRCNo: [''],
      Sailing_On_Or_About: [''],
      System_Created_Date: [''],
    });
  }

  getInitialData() {
    var ProcedureData = {
      procedureName: '[usp_LC_GetInitialData]',
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
    var procedureName = 'usp_LC_PINo_ByMarketingConcern'
    if(this.isEdit){
      procedureName = 'usp_LC_PINo_ByMarketingConcern_update'
    }
    var ProcedureData = {
      procedureName: procedureName,
      parameters: {
        UserID: this.Formgroup.value.Marketing_Concern,
      },
    };

    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.PINo = JSON.parse(results.data).Tables1;
          if(this.piArrInt.length>0){        
            this.Formgroup.controls.PINo.patchValue(this.piArrInt);
          }
          
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }

  getPINoByLCID() {
    var ProcedureData = {
      procedureName: '[usp_LC_PINo_ByLC]',
      parameters: {
        LC_ID: this.LCId,
      },
    };

    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.PINo = JSON.parse(results.data).Tables1;
          
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
    
    var lc = new LC();
    lc.User_ID = this.Formgroup.value.Marketing_Concern;
    //lc. = this.Formgroup.value.PINo;
    lc.Beneficiary_Bank_ID = this.Formgroup.value.BenificiaryAccounts;
    lc.Consignee_Name = this.Formgroup.value.Consignee_Name;
    lc.LC_No = this.Formgroup.value.LCNo;
    lc.LC_Value = this.Formgroup.value.LCValue;
    if (
      this.Formgroup.value.LCReceivingDateByDraft != undefined &&
      this.Formgroup.value.LCReceivingDateByDraft != ''
    ) {
      lc.LC_Receiving_Date_By_Bank =
        this.convertToLocalDates(this.Formgroup.value.LCReceivingDateByDraft);
    }
    if (
      this.Formgroup.value.LCReceivingDateByDraft != undefined &&
      this.Formgroup.value.LCReceivingDateByDraft != ''
    ) {
      lc.LC_Receiving_Date_By_Mail =
        this.convertToLocalDates(this.Formgroup.value.LCReceivingDateByDraft);
    }
    if (
      this.Formgroup.value.IssueDate != undefined &&
      this.Formgroup.value.IssueDate != ''
    ) {
      lc.Issue_Date = this.convertToLocalDates(this.Formgroup.value.IssueDate);
    }
    if (
      this.Formgroup.value.ExpiryDate != undefined &&
      this.Formgroup.value.ExpiryDate != ''
    ) {
      lc.Expiry_Date = this.convertToLocalDates(this.Formgroup.value.ExpiryDate);
    }
    if (
      this.Formgroup.value.MaturityDate != undefined &&
      this.Formgroup.value.MaturityDate != ''
    ) {
      lc.Maturity_Date = this.convertToLocalDates(this.Formgroup.value.MaturityDate);
    }
    if (
      this.Formgroup.value.DocPresBankDate != undefined &&
      this.Formgroup.value.DocPresBankDate != ''
    ) {
      lc.Presentation_To_Bank_Date = this.convertToLocalDates(this.Formgroup.value.DocPresBankDate);
    }
    if (
      this.Formgroup.value.IPDocSendingDate != undefined &&
      this.Formgroup.value.IPDocSendingDate != ''
    ) {
     lc.IP_Document_Sending_Date =  this.convertToLocalDates(this.Formgroup.value.IPDocSendingDate);
    }
    if (
      this.Formgroup.value.IPDocReceivingDate != undefined &&
      this.Formgroup.value.IPDocReceivingDate != ''
    ) {
      lc.IP_Document_Receiving_Date = this.convertToLocalDates(this.Formgroup.value.IPDocReceivingDate);
    }
    if (
      this.Formgroup.value.FDDRecDate != undefined &&
      this.Formgroup.value.FDDRecDate != ''
    ) {
      lc.FddTtReceiveDate = this.convertToLocalDates(this.Formgroup.value.FDDRecDate);
    }
    if (
      this.Formgroup.value.ActualPaymentRecDate != undefined &&
      this.Formgroup.value.ActualPaymentRecDate != ''
    ) {
      lc.Actual_Payment_Receiving_Date =
        this.convertToLocalDates(this.Formgroup.value.ActualPaymentRecDate);
    }
    if (
      this.Formgroup.value.ExportLCSCDate != undefined &&
      this.Formgroup.value.ExportLCSCDate != ''
    ) {
      lc.Export_LC_SC_Date = this.convertToLocalDates(this.Formgroup.value.ExportLCSCDate);
    }
    if (
      this.Formgroup.value.Sailing_On_Or_About != undefined &&
      this.Formgroup.value.Sailing_On_Or_About != ''
    ) {
      lc.Sailing_On_Or_About = this.convertToLocalDates(this.Formgroup.value.Sailing_On_Or_About);
    }

    lc.Customer_Bank = this.Formgroup.value.CustomerBankName;
    lc.Invoice_No = this.Formgroup.value.InvoiceNoWitDate;
    lc.Payment_Term_ID = this.Formgroup.value.PaymentTermsLC;
    lc.Export_LC_SC = this.Formgroup.value.ExportLCSC;
    lc.LCA_Form_No = this.Formgroup.value.LCAFormNo;
    lc.Applicant_TIN = this.Formgroup.value.ApplicantTIN;
    lc.Applicant_BIN_VAT = this.Formgroup.value.ApplicantBINVAT;
    lc.HS_Code = this.Formgroup.value.HSCode;
    lc.Bank_BIN_No = this.Formgroup.value.BankBINNo;
    lc.Remarks = this.Formgroup.value.Remarks;
    lc.IRC_No = this.Formgroup.value.IRCNo;
    lc.System_Created_Date = formatted;
    lc.PI_No = this.Formgroup.value.PINo.join(',');

    var pi_no = JSON.parse(JSON.stringify(this.Formgroup.value.PINo));
    var whereParams = '';
    pi_no.forEach((element: any) => {
      if (whereParams != '') {
        whereParams += '@';
      }
      whereParams += JSON.stringify({ PI_Master_ID: element });
    });
    var updateColumnName = 'LC_ID';
    var updateTableName = 'tbl_pi_master';

    this.masterEntyService
      .SaveSingleDataAndUpdateSerial(
        lc,
        'tbl_lc',
        updateTableName,
        updateColumnName,
        whereParams
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

  GetLCById(LCID: any) {
    var ProcedureData = {
      procedureName: '[usp_LC_ById]',
      parameters: {
        LC_ID: this.LCId,
      },
    };
    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          var tableData = JSON.parse(results.data).Tables1;

          tableData.forEach((e: any) => {
            
            var piArr = e.PI_No.split(',');
            this.piArrInt = piArr.map(Number);
            
            this.Formgroup.controls.Marketing_Concern.setValue(e.User_ID);
            this.getPINoByMarketingConcern();
            setTimeout(() => {
                  }, 1000);
            this.Formgroup.controls.BenificiaryAccounts.setValue(
              e.Beneficiary_Bank_ID
            );
            this.Formgroup.controls.Consignee_Name.setValue(e.Consignee_Name);
            this.Formgroup.controls.LCReceivingDateByDraft.setValue(
              this.convertDatesddmmyyy(e.LC_Receiving_Date_By_Mail)
            );
            this.Formgroup.controls.LCReceivingDateOrgBank.setValue(
              this.convertDatesddmmyyy(e.LC_Receiving_Date_By_Bank)
            );
            this.Formgroup.controls.LCNo.setValue(e.LC_No);
            this.Formgroup.controls.LCValue.setValue(e.LC_Value);
            this.Formgroup.controls.IssueDate.setValue(this.convertDatesddmmyyy(e.Issue_Date));
            this.Formgroup.controls.ExpiryDate.setValue(this.convertDatesddmmyyy(e.Expiry_Date));
            this.Formgroup.controls.CustomerBankName.setValue(e.Customer_Bank);
            this.Formgroup.controls.InvoiceNoWitDate.setValue(e.Invoice_No);
            this.Formgroup.controls.IPDocSendingDate.setValue(
              this.convertDatesddmmyyy(e.IP_Document_Sending_Date
            ));
            this.Formgroup.controls.IPDocReceivingDate.setValue(
              this.convertDatesddmmyyy(e.IP_Document_Receiving_Date
            ));
            this.Formgroup.controls.PaymentTermsLC.setValue(e.Mode);
            this.Formgroup.controls.MaturityDate.setValue(this.convertDatesddmmyyy(e.Maturity_Date));
            this.Formgroup.controls.DocPresBankDate.setValue(
              this.convertDatesddmmyyy(e.IP_Document_Sending_Date
            ));
            this.Formgroup.controls.FDDRecDate.setValue(this.convertDatesddmmyyy(e.FddTtReceiveDate));
            this.Formgroup.controls.ExportLCSC.setValue(e.Export_LC_SC);
            this.Formgroup.controls.ActualPaymentRecDate.setValue(
              this.convertDatesddmmyyy(e.Actual_Payment_Receiving_Date)
            );
            this.Formgroup.controls.ExportLCSCDate.setValue(
              this.convertDatesddmmyyy(e.Export_LC_SC_Date)
            );
             this.Formgroup.controls.Sailing_On_Or_About.setValue(
              this.convertDatesddmmyyy(e.Sailing_On_Or_About)
            );

            this.Formgroup.patchValue({
              LCAFormNo: e.LCA_Form_No,
              ApplicantTIN: e.Applicant_TIN,
              ApplicantBINVAT: e.Applicant_BIN_VAT,
              HSCode: e.HS_Code,
              BankBINNo: e.Bank_BIN_No,
              Remarks: e.Remarks,
              IRCNo: e.IRC_No,
              System_Created_Date: this.convertDatesddmmyyy(e.System_Created_Date)
            });

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
      swal.fire(
        'Invlid Inputs!',
        'Form is Invalid! Please select Role.',
        'info'
      );
      return;
    }

    var lc = new LC();
    lc.User_ID = this.Formgroup.value.Marketing_Concern;
    lc.Beneficiary_Bank_ID = this.Formgroup.value.BenificiaryAccounts;
    lc.Consignee_Name = this.Formgroup.value.Consignee_Name;
    lc.LC_No = this.Formgroup.value.LCNo;
    lc.LC_Value = this.Formgroup.value.LCValue;
    if (
      this.Formgroup.value.LCReceivingDateByDraft != undefined &&
      this.Formgroup.value.LCReceivingDateByDraft != ''
    ) {
      lc.LC_Receiving_Date_By_Bank =
        DateFormat.toApiDate(this.Formgroup.value.LCReceivingDateByDraft);
    }
    if (
      this.Formgroup.value.LCReceivingDateByDraft != undefined &&
      this.Formgroup.value.LCReceivingDateByDraft != ''
    ) {
      lc.LC_Receiving_Date_By_Mail =
        DateFormat.toApiDate(this.Formgroup.value.LCReceivingDateByDraft);
    }
    if (
      this.Formgroup.value.IssueDate != undefined &&
      this.Formgroup.value.IssueDate != ''
    ) {
      lc.Issue_Date = DateFormat.toApiDate(this.Formgroup.value.IssueDate);
    }
    if (
      this.Formgroup.value.ExpiryDate != undefined &&
      this.Formgroup.value.ExpiryDate != ''
    ) {
      lc.Expiry_Date = DateFormat.toApiDate(this.Formgroup.value.ExpiryDate);
    }
    if (
      this.Formgroup.value.MaturityDate != undefined &&
      this.Formgroup.value.MaturityDate != ''
    ) {
      lc.Maturity_Date = DateFormat.toApiDate(this.Formgroup.value.MaturityDate);
    }
    if (
      this.Formgroup.value.DocPresBankDate != undefined &&
      this.Formgroup.value.DocPresBankDate != ''
    ) {
      lc.Presentation_To_Bank_Date = DateFormat.toApiDate(this.Formgroup.value.DocPresBankDate);
    }
    if (
      this.Formgroup.value.IPDocSendingDate != undefined &&
      this.Formgroup.value.IPDocSendingDate != ''
    ) {
      lc.IP_Document_Sending_Date = DateFormat.toApiDate(this.Formgroup.value.IPDocSendingDate);
    }
    if (
      this.Formgroup.value.IPDocReceivingDate != undefined &&
      this.Formgroup.value.IPDocReceivingDate != ''
    ) {
      lc.IP_Document_Receiving_Date = DateFormat.toApiDate(this.Formgroup.value.IPDocReceivingDate);
    }
    if (
      this.Formgroup.value.FDDRecDate != undefined &&
      this.Formgroup.value.FDDRecDate != ''
    ) {
      lc.FddTtReceiveDate = DateFormat.toApiDate(this.Formgroup.value.FDDRecDate);
    }
    if (
      this.Formgroup.value.ActualPaymentRecDate != undefined &&
      this.Formgroup.value.ActualPaymentRecDate != ''
    ) {
      lc.Actual_Payment_Receiving_Date =
        DateFormat.toApiDate(this.Formgroup.value.ActualPaymentRecDate);
    }
    if (
      this.Formgroup.value.ExportLCSCDate != undefined &&
      this.Formgroup.value.ExportLCSCDate != ''
    ) {
      lc.Export_LC_SC_Date = DateFormat.toApiDate(this.Formgroup.value.ExportLCSCDate);
    }
    if (
      this.Formgroup.value.Sailing_On_Or_About != undefined &&
      this.Formgroup.value.Sailing_On_Or_About != ''
    ) {
      lc.Sailing_On_Or_About = DateFormat.toApiDate(this.Formgroup.value.Sailing_On_Or_About);
    }


    lc.Customer_Bank = this.Formgroup.value.CustomerBankName;
    lc.Invoice_No = this.Formgroup.value.InvoiceNoWitDate;
    lc.Payment_Term_ID = this.Formgroup.value.PaymentTermsLC;
    lc.Export_LC_SC = this.Formgroup.value.ExportLCSC;
    lc.LCA_Form_No = this.Formgroup.value.LCAFormNo;
    lc.Applicant_TIN = this.Formgroup.value.ApplicantTIN;
    lc.Applicant_BIN_VAT = this.Formgroup.value.ApplicantBINVAT;
    lc.HS_Code = this.Formgroup.value.HSCode;
    lc.Bank_BIN_No = this.Formgroup.value.BankBINNo;
    lc.Remarks = this.Formgroup.value.Remarks;
    lc.IRC_No = this.Formgroup.value.IRCNo;
    lc.System_Created_Date = DateFormat.toApiDate(this.Formgroup.value.System_Created_Date);
    lc.PI_No = this.Formgroup.value.PINo.join(','); 

    var condition = {
      'LC_ID':this.LCId
    }

    this.masterEntyService.UpdateData(lc,condition,'tbl_lc').subscribe({
      next: (results) => {
        if (results.status) {
          swal
            .fire({
              title: `${results.message}!`,
              text: `Update Successfully!`,
              icon: 'success',
              timer: 5000,
            })
            .then((result) => {
              this.ngOnInit();
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

  convertDates(dateString: any) {
    if (dateString == '' || dateString == undefined) return '';
    var fDate = new Date(dateString);
    const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();

    const formatted = `${yyyy}/${mm}/${dd}`;

    return formatted;
  }

  
  convertDatesddmmyyy(dateString: any) {
    if (dateString == '' || dateString == undefined) return '';
    var fDate = new Date(dateString);
    const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();

    const formatted = `${dd}/${mm}/${yyyy}`;

    return formatted;
  }

  convertToLocalDates(dateString: any){
    const nowTime = new Date(dateString);
    const localISO = new Date(
      nowTime.getTime() - nowTime.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

      return localISO;
  }
}
