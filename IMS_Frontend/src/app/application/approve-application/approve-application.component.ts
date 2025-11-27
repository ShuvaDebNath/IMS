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
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';

@Component({
  selector: 'app-approve-application',
  templateUrl: './approve-application.component.html',
  styleUrls: ['./approve-application.component.css'],
})
export class ApproveApplicationComponent {
  Id: any = '';
  tableData: any = [];
  status: any = '';
  FormType: any = '';
  PoNo: any = '';
  AppDate: any = '';
  FormTitle : any = '';

  insertPermissions: boolean = false;
  updatePermissions: boolean = false;
  deletePermissions: boolean = false;
  printPermissions: boolean = false;

  ApplicationType:any = '';
  reviseData: any = [];

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
    this.Id = this.activeLink.snapshot.queryParams['Id'];
    var permissions = this.gs.CheckUserPermission('All Application');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    this.title.setTitle('Application Approve');
    this.loadPageData();
  }

  loadPageData() {
    var userId = window.localStorage.getItem('userId');

    var procedureName = 'usp_Application_GetDetails';
    var ProcedureData = {
      procedureName: procedureName,
      parameters: {
        Id: this.Id,
      },
    };

    this.masterEntryService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        console.log(JSON.parse(results.data).Tables1);
        if (results.status) {
          this.tableData = JSON.parse(results.data).Tables1;
          console.log(this.tableData[0].AppType);
          
          if(this.tableData[0].AppType=="PI Amendment Application"){
            this.status = this.tableData[0].Status;
            this.PoNo = this.tableData[0].POno;
            this.AppDate = this.tableData[0].Date;
            this.FormType = this.tableData[0].AppType;
            this.FormTitle = "PI Amendment Application";
            console.log(this.tableData);
            
            this.reviseData = JSON.parse(results.data).Tables2;
          }
          else if(this.tableData[0].AppType=="Special Delivery"){
            this.status = this.tableData[0].Status;
            this.PoNo = this.tableData[0].POno;
            this.AppDate = this.tableData[0].Date;
            this.FormType = this.tableData[0].FormTypeName;
            this.FormTitle = "Special Delivery Application";
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

  ApproveData(status: any) {
    var approveStatus = '';
    if (status == 'Approve') {
      if (this.status == 'Pending') {
        approveStatus = 'Team Lead Approved';
      } else if (this.status == 'Team Lead Approved') {
        approveStatus = 'Approved';
      }
    } else {
      approveStatus = 'Rejected';
    }

    let param = new MasterEntryModel();
    param.tableName = 'tbl_po_form_master';
    param.whereParams = { Id: this.Id };
    var message = '';
    param.queryParams = {
      Status: approveStatus,
    };
    message = 'Application Approved Successfully!';

    this.masterEntryService
      .UpdateData(param.queryParams, param.whereParams, param.tableName)
      .subscribe({
        next: (results: any) => {
          if (results.status) {
            if(approveStatus=='Rejected'){
              message = 'Application Rejected Successfully!';
               swal
              .fire({
                title: `${results.message}!`,
                text: message,
                icon: 'error',
                timer: 5000,
              })
              .then((result) => {
                this.loadPageData();
              });
            }
            else{
              message = 'Application Approved Successfully!';
               swal
              .fire({
                title: `${results.message}!`,
                text: message,
                icon: 'success',
                timer: 5000,
              })
              .then((result) => {
                this.loadPageData();
              });
            }
           
            this.loadPageData();
          } else if (results.message == 'Invalid Token') {
            swal.fire('Session Expierd!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {
          }
        },
        error: (err: any) => {},
      });
  }
}
