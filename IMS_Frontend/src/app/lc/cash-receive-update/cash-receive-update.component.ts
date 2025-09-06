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
    private title: Title
  ) {
    // this.gs.CheckToken().subscribe();
    let has = this.activeLink.snapshot.queryParamMap.has('CRId');
    if (has) {
      this.CRId = this.activeLink.snapshot.queryParams['CRId'];
      this.isEdit = true;
    } else {
      this.isEdit = false;
    }
  }

  ngOnInit() {
    this.menu = window.localStorage.getItem('UserMenuWithPermission');
    this.menu = JSON.parse(this.menu);
    var buttonPermissions: any = [];
    var countFound = 0;
    this.menu.forEach((e: any) => {
      e.Children = JSON.parse(e.Children);
      e.Children.forEach((childMenu: any) => {
        if (childMenu.SubMenuName == 'Cash-Receive') {
          countFound++;
          buttonPermissions = childMenu.ButtonName;
        }
      });
    });
    if (countFound == 0) {
      //window.location.href='dashboard';
    } else {
      buttonPermissions.forEach((buttonCheck: any) => {
        if (buttonCheck.ButtonName == 'Insert') {
          this.insertPermissions = true;
        }
      });
    }

    if (!this.insertPermissions) {
      //window.location.href='all-lc';
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

          this.ReceiveAmount = this.PIData[0].Total_Receive_Amount;
          this.Balance = this.PIData[0].Balance;
          this.LC_Value = this.PIData[0].LC_Value;
          this.PINo = this.PIData[0].PINo;

          this.Formgroup.controls.ReceiveAmount.setValue(this.ReceiveAmount);
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
    
  }
}
