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
  styleUrls: ['./generate-cash-receive.component.css']
})
export class GenerateCashReceiveComponent {
  Formgroup!: FormGroup;
  isEdit = false;
  PIList:any;
  CID!: string;
  companyId!:string;
  menu: any;
  MarketingConcern:any;
  BenificiaryAccounts:any;
  PaymentTerms:any;
  PINo:any;
  ReceiveAmount:any=0;

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
    let has = this.activeLink.snapshot.queryParamMap.has('Generate_Cash_Receive_ID');
    if (has) {
      this.CID = this.activeLink.snapshot.queryParams['Generate_Cash_Receive_ID'];
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

    this.title.setTitle('Generate Commercial Invoice');
    this.GenerateFrom();
    this.getInitialData();

    if (this.isEdit) {
       ///this.GetCDById(this.CIId);
    }

  }

  GenerateFrom() {
    this.Formgroup = this.fb.group({
      Marketing_Concern:['',[Validators.required]],  
      BenificiaryAccounts:['',[Validators.required]],      
      Consignee_Name:['',[Validators.required]],      
      Customer_Bank:['',[Validators.required]],      
      PI:['',[Validators.required]],      
      PIValue:['',[Validators.required]],
      ReceiveAmount:['',[Validators.required]],
      ReceiveDate:['',[Validators.required]],
      IssueDate:['',[Validators.required]],
      PaymentTerms:['',[Validators.required]],
      Remarks:['']
    });
  }

      getInitialData(){
        var ProcedureData = {
          procedureName: '[usp_CashReceive_GetInitialData]',
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
      
      var ProcedureData = {
        procedureName: '[usp_CashReceive_PINo_ByMarketingConcern]',
        parameters: {
          'UserID':this.Formgroup.value.Marketing_Concern
        }
      }; 
  
      this.masterEntyService.GetInitialData(ProcedureData).subscribe({
        next: (results) => {
          console.log(results);
          
          if (results.status) {
            this.PIList = JSON.parse(results.data).Tables1;
  
          } else if (results.msg == 'Invalid Token') {
            swal.fire('Session Expierd!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {}
        },
        error: (err) => {},
      });
    }


    getCashReceiveInfoByPI(){
      
      var ProcedureData = {
        procedureName: '[usp_CG_PINo_ByMarketingConcern]',
        parameters: {
          'PIId':this.Formgroup.value.PI
        }
      }; 
  
      this.masterEntyService.GetInitialData(ProcedureData).subscribe({
        next: (results) => {
          console.log(results);
          
          if (results.status) {
            var details = JSON.parse(results.data).Tables1;
            this.Formgroup.controls.Consignee_Name.setValue(details[0].Consignee);  
            this.Formgroup.controls.PIValue.setValue(details[0].totalAmount);  
  
          } else if (results.msg == 'Invalid Token') {
            swal.fire('Session Expierd!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {}
        },
        error: (err) => {},
      });
    }
      checkReceiveAmount(){
            if(this.Formgroup.value.ReceiveAmount > this.Formgroup.value.PIValue){
              swal.fire('Warning!', 'Receive Amount should not be greater than PI Value', 'warning');
              this.Formgroup.controls.ReceiveAmount.setValue(0);
              return;
            }
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
                var cd = new CG();
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
                cd.Last_Receive_Date = this.Formgroup.value.ReceiveDate==undefined?null:this.Formgroup.value.ReceiveDate;
                cd.Issue_Date = this.Formgroup.value.IssueDate==undefined?null:this.Formgroup.value.IssueDate;
                cd.Balance = this.Formgroup.value.PIValue - this.Formgroup.value.ReceiveAmount;     
                cd.PI_Master_ID = this.Formgroup.value.PI;         
              
                var TableNameMaster = 'tbl_cash_receive_master';
                var TableNameChild = 'tbl_cash_receive_detail';
                
                var ColumnNamePrimary = "CR_ID";
                var ColumnNameForign = "CR_ID";

                var detailsData:any = [];

                var details = {
                  'ReceiveAmount':this.Formgroup.value.ReceiveAmount,
                  'ReceiveDate':this.Formgroup.value.ReceiveDate==undefined?null:this.Formgroup.value.ReceiveDate,
                  'CreatedDate':formatted,
                  'UserId':userId
                }

                detailsData.push(details);

                var whereParam = {
                  'PI_Master_ID':this.Formgroup.value.PI
                }
        
                this.masterEntyService.SaveDataMasterDetails(detailsData,TableNameChild,cd,TableNameMaster,ColumnNamePrimary,ColumnNameForign,'','',false,whereParam).subscribe((res:any) => {
                        console.log(res);
                        
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

      updateData() {

      }
}
