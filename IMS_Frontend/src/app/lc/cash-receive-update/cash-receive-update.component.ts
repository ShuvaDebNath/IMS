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
  selector: 'app-cash-receive-update',
  templateUrl: './cash-receive-update.component.html',
  styleUrls: ['./cash-receive-update.component.css'],
})
export class CashReceiveUpdateComponent {
  Formgroup!: FormGroup;
  isEdit = false;
  menu: any;
  CRId: any;
  ReceiveAmount: any = 0;
  LC_Value: any = 0;
  Balance: any = 0;
  PIData: any;
  PINo: any;

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
      this.CRId = this.activeLink.snapshot.queryParams['CR_Id'];
      this.isEdit = true;
    } else {
      this.isEdit = false;
    }
  }

  ngOnInit() {
    var permissions = this.gs.CheckUserPermission("All Cash Receive");
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.updatePermissions) {
      window.location.href = 'all-cash-receive';
    }

    this.title.setTitle('Cash Receive Update');
    this.GenerateFrom();
    this.getPIData();
    if (this.isEdit) {
      ///this.GetCDById(this.CIId);
    }
  }

  GenerateFrom() {
    this.Formgroup = this.fb.group({
      ReceiveAmount: ['', [Validators.required]],
      ReceiveDate: ['', [Validators.required]],
    });
  }

  checkReceiveAmount() {
    if (this.Formgroup.value.ReceiveAmount > this.Balance) {
      swal.fire(
        'Warning!',
        'Receive Amount should not be greater than Balance',
      );
      this.Formgroup.controls.ReceiveAmount.setValue(0);
      return;
    }
  }

  getPIData() {
    var ProcedureData = {
      procedureName: '[usp_ProformaInvoice_GetDetails]',
      parameters: { CRId: this.CRId },
    };

    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.PIData = JSON.parse(results.data).Tables1;
          console.log(results);

          //this.ReceiveAmount = this.PIData[0].Total_Receive_Amount;
          this.Balance = this.PIData[0].balance;
          this.LC_Value = this.PIData[0].LC_Value;
          this.PINo = this.PIData[0].PINo;

          this.Formgroup.controls.ReceiveAmount.setValue(this.ReceiveAmount);
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => { },
    });
  }

  saveData() {
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

    var model = {
      'ReceiveAmount':this.Formgroup.value.ReceiveAmount,      
      'ReceiveDate':this.Formgroup.value.ReceiveDate,
      'UserId':userId,
      'CreatedDate':formatted,
      'CR_ID':this.CRId
    }

    
    var updateModel = {
      'ReceiveAmount':this.Formgroup.value.ReceiveAmount,      
      'ReceiveDate':this.Formgroup.value.ReceiveDate,
      'UserId':userId,
      'CreatedDate':formatted
    }


    

    var TableNameChild = 'tbl_cash_receive_detail';
    var updateTableName = 'tbl_PI_Master';
    var whereParam = {
      'PI_Master_ID': this.Formgroup.value.PI
    }

    this.masterEntyService.SaveSingleData(model, TableNameChild).subscribe((res: any) => {
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

        if (res.message == 'Data already exist') {
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
}
