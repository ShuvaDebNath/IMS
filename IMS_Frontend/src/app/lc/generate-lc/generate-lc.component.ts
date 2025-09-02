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
  selector: 'app-generate-lc',
  templateUrl: './generate-lc.component.html',
  styleUrls: ['./generate-lc.component.css']
})
export class GenerateLcComponent {
  Formgroup!: FormGroup;
  isEdit = false;
  LCId!: string;
  companyId!:string;
  menu: any;
  MarketingConcern:any;
  BenificiaryAccounts:any;
  PaymentTerms:any;
  PINo:any;

  insertPermissions: boolean = false;
  updatePermissions: boolean = false;
  deletePermissions: boolean = false;
  printPermissions: boolean = false;

  constructor(
    private fb: FormBuilder,
    private masterEntyService: MasterEntryService,
    private gs: GlobalServiceService,
    private activeLink: ActivatedRoute,
    private title: Title,
  ) {
    // this.gs.CheckToken().subscribe();
    let has = this.activeLink.snapshot.queryParamMap.has('LC_No');
    if (has) {
      this.LCId = this.activeLink.snapshot.queryParams['LC_No'];
      this.getPINoByLCID();
      this.isEdit = true;
    } else {
      this.isEdit = false;
    }
  }

  ngOnInit() {
    this.menu = window.localStorage.getItem('UserMenuWithPermission');
    this.menu = JSON.parse(this.menu);
    var buttonPermissions:any = [];
    var countFound = 0;
          this.menu.forEach((e:any)=>{
            e.Children = JSON.parse(e.Children);
            e.Children.forEach((childMenu:any)=>{
              if(childMenu.SubMenuName=="LC"){
                countFound++;
                buttonPermissions = childMenu.ButtonName;
              }
            });
          })
    if(countFound==0){
      //window.location.href='dashboard';
    }
    else{
      buttonPermissions.forEach((buttonCheck:any)=>{
        if(buttonCheck.ButtonName=="Insert"){
          this.insertPermissions = true;
        }
      });
    }

    if(!this.insertPermissions){
      //window.location.href='all-lc';
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
      Marketing_Concern:['',[Validators.required]],      
      PINo:[[],[Validators.required]],      
      BenificiaryAccounts:['',[Validators.required]],      
      Consignee_Name:[''],      
      LCReceivingDateByDraft:[''],      
      LCReceivingDateOrgBank:[''],      
      LCNo:[''],      
      LCValue:['',[Validators.required]],      
      IssueDate:[''],
      ExpiryDate:[''],
      CustomerBankName:[''],
      InvoiceNoWitDate:[''],
      IPDocSendingDate:[''],
      IPDocReceivingDate:[''],
      PaymentTermsLC:['',[Validators.required]],
      MaturityDate:[''],
      DocPresBankDate:[''],
      FDDRecDate:[''],
      ExportLCSC:[''],
      ActualPaymentRecDate:[''],
      ExportLCSCDate:[''],
      LCAFormNo:[''],
      ApplicantTIN:[''],
      ApplicantBINVAT:[''],
      HSCode:[''],
      BankBINNo:[''],
      Remarks:[''],
      IRCNo:['']
    });
  }

  getInitialData(){
      var ProcedureData = {
        procedureName: '[usp_LC_GetInitialData]',
        parameters: {
        }
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
          } else {}
        },
        error: (err) => {},
      });
  
    }

    getPINoByMarketingConcern(){
      console.log(this.Formgroup.value.Marketing_Concern);
      
      var ProcedureData = {
        procedureName: '[usp_LC_PINo_ByMarketingConcern]',
        parameters: {
          'UserID':this.Formgroup.value.Marketing_Concern
        }
      }; 
  
      this.masterEntyService.GetInitialData(ProcedureData).subscribe({
        next: (results) => {
  
          if (results.status) {
            this.PINo = JSON.parse(results.data).Tables1;
  
          } else if (results.msg == 'Invalid Token') {
            swal.fire('Session Expierd!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {}
        },
        error: (err) => {},
      });
    }

    getPINoByLCID(){
      
      var ProcedureData = {
        procedureName: '[usp_LC_PINo_ByLC]',
        parameters: {
          'LC_ID':this.LCId
        }
      }; 
  
      this.masterEntyService.GetInitialData(ProcedureData).subscribe({
        next: (results) => {
          console.log(results);
          
          if (results.status) {
            this.PINo = JSON.parse(results.data).Tables1;
  
          } else if (results.msg == 'Invalid Token') {
            swal.fire('Session Expierd!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {}
        },
        error: (err) => {},
      });
    }

    saveData(){
      
      if (this.Formgroup.invalid) {
        swal.fire('Invlid Inputs!', 'Form is Invalid! Please select Role.', 'info');
        return;
      }
        var lc = new LC();
        lc.User_ID = this.Formgroup.value.Marketing_Concern;
        //lc. = this.Formgroup.value.PINo;
        lc.Beneficiary_Bank_ID = this.Formgroup.value.BenificiaryAccounts;
        lc.Consignee_Name = this.Formgroup.value.Consignee_Name;
        lc.LC_Receiving_Date_By_Mail = this.Formgroup.value.LCReceivingDateByDraft;
        lc.LC_Receiving_Date_By_Bank = this.Formgroup.value.LCReceivingDateOrgBank;
        lc.LC_No = this.Formgroup.value.LCNo;
        lc.LC_Value = this.Formgroup.value.LCValue;
        lc.Issue_Date = this.Formgroup.value.IssueDate==undefined?null:this.Formgroup.value.IssueDate;
        lc.Expiry_Date = this.Formgroup.value.ExpiryDate;
        lc.Customer_Bank = this.Formgroup.value.CustomerBankName;
        lc.Invoice_No = this.Formgroup.value.InvoiceNoWitDate;
        lc.IP_Document_Sending_Date = this.Formgroup.value.IPDocSendingDate==undefined?null:this.Formgroup.value.IPDocSendingDate;
        lc.IP_Document_Receiving_Date = this.Formgroup.value.IPDocReceivingDate==undefined?null:this.Formgroup.value.IPDocReceivingDate;
        lc.Payment_Term_ID = this.Formgroup.value.PaymentTermsLC;
        lc.Maturity_Date = this.Formgroup.value.MaturityDate;
        lc.Presentation_To_Bank_Date = this.Formgroup.value.DocPresBankDate==undefined?null:this.Formgroup.value.DocPresBankDate;
        lc.FddTtReceiveDate = this.Formgroup.value.FDDRecDate;
        lc.Export_LC_SC = this.Formgroup.value.ExportLCSC;
        lc.Actual_Payment_Receiving_Date = this.Formgroup.value.ActualPaymentRecDate==undefined?null:this.Formgroup.value.ActualPaymentRecDate;
        lc.Export_LC_SC_Date = this.Formgroup.value.ExportLCSCDate==undefined?null:this.Formgroup.value.ExportLCSCDate;
        lc.LCA_Form_No = this.Formgroup.value.LCAFormNo;
        lc.Applicant_TIN = this.Formgroup.value.ApplicantTIN;
        lc.Applicant_BIN_VAT = this.Formgroup.value.ApplicantBINVAT;
        lc.HS_Code = this.Formgroup.value.HSCode;
        lc.Bank_BIN_No = this.Formgroup.value.BankBINNo;
        lc.Remarks = this.Formgroup.value.Remarks;
        lc.IRC_No = this.Formgroup.value.IRCNo;
      
        var pi_no = JSON.parse(JSON.stringify(this.Formgroup.value.PINo));
        var whereParams = '';
        pi_no.forEach((element:any) => {
          if(whereParams!=''){
            whereParams+='@';  
          }
          whereParams+=JSON.stringify({'PI_Master_ID':element})
                  
        });
        var updateColumnName = 'LC_ID';
        var updateTableName = 'tbl_pi_master';

        this.masterEntyService.SaveSingleDataAndUpdateSerial(lc,'tbl_lc',updateTableName,updateColumnName,whereParams).subscribe((res:any) => {
              
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
        
                if(res.message == 'Data already exist'){
                  swal.fire('Data already exist', '', 'warning');
                }
                else if (res.message == 'Invalid Token') {
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

    GetLCById(LCID:any){
      var ProcedureData = {
        procedureName: '[usp_LCById]',
        parameters: {
          'LC_ID':this.LCId
        }
      }; 
      this.masterEntyService.GetInitialData(ProcedureData).subscribe({
        next: (results) => {
  
          if (results.status) {
            var tableData = JSON.parse(results.data).Tables1;
            console.log(tableData);
            
            tableData.forEach((e:any)=>{   
              var piArr = e.PI_No.split(','); 
              const piArrInt = piArr.map(Number);
              console.log(piArr);
              this.Formgroup.controls.Marketing_Concern.setValue(e.User_ID);   
              this.Formgroup.controls.BenificiaryAccounts.setValue(e.Beneficiary_Bank_ID);
              this.Formgroup.controls.Consignee_Name.setValue(e.Consignee_Name);
              this.Formgroup.controls.LCReceivingDateByDraft.setValue(new Date(e.LC_Receiving_Date_By_Mail));
              this.Formgroup.controls.LCReceivingDateOrgBank.setValue(new Date(e.LC_Receiving_Date_By_Bank));
              this.Formgroup.controls.LCNo.setValue(e.LC_No);
              this.Formgroup.controls.LCValue.setValue(e.LC_Value);
              this.Formgroup.controls.IssueDate.setValue(new Date(e.Issue_Date));
              this.Formgroup.controls.ExpiryDate.setValue(new Date(e.Expiry_Date));
              this.Formgroup.controls.CustomerBankName.setValue(e.Customer_Bank);
              this.Formgroup.controls.InvoiceNoWitDate.setValue(e.Invoice_No);
              this.Formgroup.controls.IPDocSendingDate.setValue(new Date(e.IP_Document_Sending_Date));
              this.Formgroup.controls.IPDocReceivingDate.setValue(new Date(e.IP_Document_Receiving_Date));
              this.Formgroup.controls.PaymentTermsLC.setValue(e.Mode);
              this.Formgroup.controls.MaturityDate.setValue(new Date(e.Maturity_Date));
              this.Formgroup.controls.DocPresBankDate.setValue(new Date(e.IP_Document_Sending_Date));
              this.Formgroup.controls.FDDRecDate.setValue(new Date(e.FddTtReceiveDate));
              this.Formgroup.controls.ExportLCSC.setValue(e.Export_LC_SC);
              this.Formgroup.controls.ActualPaymentRecDate.setValue(new Date(e.Actual_Payment_Receiving_Date));
              this.Formgroup.controls.ExportLCSCDate.setValue(new Date(e.Export_LC_SC_Date));
              this.Formgroup.controls.LCAFormNo.setValue(e.LCA_Form_No);
              this.Formgroup.controls.ApplicantTIN.setValue(e.Applicant_TIN);
              this.Formgroup.controls.ApplicantBINVAT.setValue(e.Applicant_BIN_VAT);
              this.Formgroup.controls.HSCode.setValue(e.HS_Code);
              this.Formgroup.controls.BankBINNo.setValue(e.Bank_BIN_No);
              this.Formgroup.controls.Remarks.setValue(e.Remarks);
              this.Formgroup.controls.IRCNo.setValue(e.IRC_No);
              this.Formgroup.controls.PINo.setValue(piArrInt);
            });
  
          } else if (results.message == 'Invalid Token') {
            swal.fire('Session Expierd!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {}
        },
        error: (err) => {},
      });
    }

    updateData(){

        if (this.Formgroup.invalid) {
          swal.fire('Invlid Inputs!', 'Form is Invalid! Please select Role.', 'info');
          return;
        }

        var pi_no = JSON.parse(JSON.stringify(this.Formgroup.value.PINo));
        var piNoStringSep = '';
        pi_no.forEach((element:any) => {
          if(piNoStringSep!=''){
            piNoStringSep+=',';  
          }
          piNoStringSep+=element
                  
        });

        var lc = new LC();

        

        lc.LC_ID = this.LCId;
        lc.User_ID = this.Formgroup.value.Marketing_Concern;
        //lc. = this.Formgroup.value.PINo;
        lc.Beneficiary_Bank_ID = this.Formgroup.value.BenificiaryAccounts;
        lc.Consignee_Name = this.Formgroup.value.Consignee_Name;
        lc.LC_Receiving_Date_By_Mail = this.convertDates(this.Formgroup.value.LCReceivingDateByDraft);
        lc.LC_Receiving_Date_By_Bank = this.convertDates(this.Formgroup.value.LCReceivingDateOrgBank);
        lc.LC_No = this.Formgroup.value.LCNo;
        lc.LC_Value = this.Formgroup.value.LCValue;
        lc.Issue_Date = this.convertDates(this.Formgroup.value.IssueDate);
        lc.Expiry_Date = this.convertDates(this.Formgroup.value.ExpiryDate);
        lc.Customer_Bank = this.Formgroup.value.CustomerBankName;
        lc.Invoice_No = this.Formgroup.value.InvoiceNoWitDate;
        lc.IP_Document_Sending_Date = this.convertDates(this.Formgroup.value.IPDocSendingDate);
        lc.IP_Document_Receiving_Date = this.convertDates(this.Formgroup.value.IPDocReceivingDate);
        lc.Payment_Term_ID = this.Formgroup.value.PaymentTermsLC;
        lc.Maturity_Date = this.convertDates(this.Formgroup.value.MaturityDate);
        lc.Presentation_To_Bank_Date = this.convertDates(this.Formgroup.value.DocPresBankDate);
        lc.FddTtReceiveDate = this.convertDates(this.Formgroup.value.FDDRecDate);
        lc.Export_LC_SC = this.Formgroup.value.ExportLCSC;
        lc.Actual_Payment_Receiving_Date = this.convertDates(this.Formgroup.value.ActualPaymentRecDate);
        lc.Export_LC_SC_Date = this.convertDates(this.Formgroup.value.ExportLCSCDate);
        lc.LCA_Form_No = this.Formgroup.value.LCAFormNo;
        lc.Applicant_TIN = this.Formgroup.value.ApplicantTIN;
        lc.Applicant_BIN_VAT = this.Formgroup.value.ApplicantBINVAT;
        lc.HS_Code = this.Formgroup.value.HSCode;
        lc.Bank_BIN_No = this.Formgroup.value.BankBINNo;
        lc.Remarks = this.Formgroup.value.Remarks;
        lc.IRC_No = this.Formgroup.value.IRCNo;
        lc.PI_No = piNoStringSep;
        console.log(lc);
        var ProcedureData = {
          procedureName: '[usp_LC_Update]',
          parameters: lc
        };

        this.masterEntyService.GetAllData(ProcedureData).subscribe({
        next: (results) => {
          console.log(results);
          
          if (results.status) {
            this.PINo = JSON.parse(results.data);
  
          } else if (results.msg == 'Invalid Token') {
            swal.fire('Session Expierd!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {}
        },
        error: (err) => {},
      });
    }

    convertDates(dateString: any) {
      console.log(dateString);
      
      if(dateString=="" || dateString==undefined)
        return '';
      var fDate = new Date(dateString);
      const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const dd = String(fDate.getDate()).padStart(2, '0');
      const yyyy = fDate.getFullYear();

      const formatted = `${yyyy}/${mm}/${dd}`; 
      
      return formatted;
}

}
