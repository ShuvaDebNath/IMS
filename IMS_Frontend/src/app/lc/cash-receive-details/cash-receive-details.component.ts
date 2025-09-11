import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalServiceService } from '../../services/Global-service.service';
import { PagesComponent } from 'src/app/pages/pages.component';
import { Title } from '@angular/platform-browser';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import { GetDataModel } from 'src/app/models/GetDataModel';
import swal from 'sweetalert2';

@Component({
  selector: 'app-cash-receive-details',
  templateUrl: './cash-receive-details.component.html',
  styleUrls: ['./cash-receive-details.component.css'],
})
export class CashReceiveDetailsComponent {
  MarketingConcern: any = '';
  ConsigneeName: any = '';
  BenificiaryBank: any = '';
  IssueDate: any = '';
  TotalReceiveAmount: any = '';
  Balance: any = '';
  Remarks: any = '';
  PIValue: any = '';
  CustomerBankName: any = '';
  LastReceiveDate: any = '';
  PaymentTerms: any = '';
  PIs: any = '';
  tableData: any = '';
  CR_ID: any = '';
  menu:any;

  
  insertPermissions: boolean = false;
  updatePermissions: boolean = false;
  deletePermissions: boolean = false;
  printPermissions: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private gs: GlobalServiceService,
    private pagesComponent: PagesComponent,
    private masterEntryService: MasterEntryService,
    private activeLink: ActivatedRoute,
    private title: Title
  ) {
    let has = this.activeLink.snapshot.queryParamMap.has('CR_Id');
    if (has) {
      this.CR_ID = this.activeLink.snapshot.queryParams['CR_Id'];
    } 
  }

  ngOnInit(): void {
    var permissions = this.gs.CheckUserPermission("All Cash Receive");
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;
    
    if(!this.printPermissions){
      window.location.href='all-cash-receive';
    }   

    this.title.setTitle('Cash Receive Details');
    this.GetIdByCashReceiveDetails();
  }

  GetIdByCashReceiveDetails() {
    let param = new GetDataModel();
    param.procedureName = '[usp_CashReceive_Details]';
    param.parameters = {
      CR_ID: this.CR_ID,
    };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        
        if (results.status) {
          this.tableData = [];
          let tables = JSON.parse(results.data);
          var data = tables.Tables1[0];
          this.tableData = tables.Tables2;
            this.MarketingConcern = data.MarketingConcern;
            this.ConsigneeName = data.ConsigneeName;
            this.BenificiaryBank = data.BenificiaryBank;
            this.IssueDate = data.Issue_Date;
            this.TotalReceiveAmount = data.Total_Receive_Amount;
            this.Balance = data.Balance;
            this.Remarks = data.Remarks;
            this.PIValue = data.PI_Value;
            this.CustomerBankName = data.Customer_Bank;
            this.LastReceiveDate = data.LastReceiveDate;
            this.PaymentTerms = data.PaymentTerms;
            this.PIs = data.PINo;
        }
      },
    });
  }

  DeleteData(item: any) {
    swal
      .fire({
        title: 'Wait!',
        html: `<span>Once you delete, you won't be able to revert this!</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      })
      .then((result) => {
        if (result.isConfirmed == true) {
          let param = new GetDataModel();
          param.procedureName = 'usp_CashReceive_Details_Delete';
          param.parameters = {
            CR_Detail_ID: item.CR_Detail_ID,            
            CR_ID: this.CR_ID,
          };

          this.masterEntryService.GetInitialData(param).subscribe({
            next: (results: any) => {

              if (results.status) {
                var effectedRows = JSON.parse(results.data).Tables1;
                if (effectedRows[0].AffectedRows > 0) {
                  swal
                    .fire({
                      text: `Data Deleted Successfully !`,
                      title: `Delete Successfully!`,
                      icon: 'success',
                      timer: 5000,
                    })
                    .then((result) => {
                      this.ngOnInit();
                    });
                }

              } else if (results.message == 'Invalid Token') {
                swal.fire('Session Expierd!', 'Please Login Again.', 'info');
                this.gs.Logout();
              } else {
              }
            },
            error: (err) => {},
          });
        }
      });
  }
}
