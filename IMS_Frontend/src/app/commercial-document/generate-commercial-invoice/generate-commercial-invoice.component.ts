import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CD } from 'src/app/models/CDModel';
import { LC } from 'src/app/models/LCModel';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { Roles } from 'src/app/models/roles.model';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';


@Component({
  selector: 'app-generate-commercial-invoice',
  templateUrl: './generate-commercial-invoice.component.html',
  styleUrls: ['./generate-commercial-invoice.component.css']
})
export class GenerateCommercialInvoiceComponent {
  Formgroup!: FormGroup;
  isEdit = false;
  LCList:any;
  CIId!: string;
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
    let has = this.activeLink.snapshot.queryParamMap.has('Commercial_Invoice_ID');
    if (has) {
      this.CIId = this.activeLink.snapshot.queryParams['Commercial_Invoice_ID'];
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
              if(childMenu.SubMenuName=="Commercial Documents"){
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

    // if (this.isEdit) {
    //    this.GetLCById(this.LCId);
    // }

  }

  GenerateFrom() {
    this.Formgroup = this.fb.group({
      LC_No:['',[Validators.required]],           
      ApplicantBank:['',[Validators.required]],      
      ExpNo:[''],      
      ExpDate:[''],      
      BeNo:[''],      
      BeDate:[''],      
      EpNo:[''],
      EpDate:[''],
      FreightCharge:['',[Validators.required]],
      QtyRolls:['',[Validators.required]],
      TotalGrossWeight:['',[Validators.required]],
      TotalNetWeight:['',[Validators.required]],
      SailiongOnOrAbout:[''],
      Remarks:['']
    });
  }

      getInitialData(){
        var ProcedureData = {
          procedureName: '[usp_CommDoc_GetInitialData]',
          parameters: {
          }
        }; 
    
        this.masterEntyService.GetInitialData(ProcedureData).subscribe({
          next: (results) => {
    
            if (results.status) {
              this.BenificiaryAccounts = JSON.parse(results.data).Tables1;
              this.LCList = JSON.parse(results.data).Tables2;
    
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
              var fDate = new Date();
              const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
              const dd = String(fDate.getDate()).padStart(2, '0');
              const yyyy = fDate.getFullYear();

              const formatted = `${mm}/${dd}/${yyyy}`;  
              
              var userId = window.localStorage.getItem('userId');
                var cd = new CD();
                cd.LC_ID = this.Formgroup.value.LC_No;
                cd.ExpNo = this.Formgroup.value.ExpNo;
                cd.Export_Date = this.Formgroup.value.ExpDate;
                cd.Sailing_On_Or_About = this.Formgroup.value.SailiongOnOrAbout;
                cd.FreightCharge = this.Formgroup.value.FreightCharge;
                cd.Remarks = this.Formgroup.value.Remarks;
                cd.Date = this.Formgroup.value.IssueDate;
                cd.User_ID = this.Formgroup.value.ExpiryDate;
                cd.Applicant_Bank_ID = this.Formgroup.value.ApplicantBank;
                cd.Qty_Rolls = this.Formgroup.value.QtyRolls;
                cd.Total_Gross_Weight = this.Formgroup.value.TotalGrossWeight;
                cd.Total_Net_Weight = this.Formgroup.value.TotalNetWeight;
                cd.Be_No = this.Formgroup.value.BeNo;
                cd.Be_No_Date = this.Formgroup.value.BeDate;
                cd.EP_No = this.Formgroup.value.EpNo;
                cd.EP_No_Date = this.Formgroup.value.EpDate;
                cd.Commercial_Invoice_No = 'temp';
                cd.Date = formatted;
                cd.User_ID = userId==undefined?'':userId;
              
                var tableName = 'tbl_commercial_invoice';
        
                this.masterEntyService.SaveSingleData(cd,tableName).subscribe((res:any) => {
                      
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

      GetCDById(LCID:any){
            var ProcedureData = {
              procedureName: '[usp_CDById]',
              parameters: {
                'Commercial_Invoice_ID':this.CIId
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

      }
}
