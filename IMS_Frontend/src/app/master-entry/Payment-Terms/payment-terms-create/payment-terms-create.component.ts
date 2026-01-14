import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-payment-terms-create',
  templateUrl: './payment-terms-create.component.html',
  styleUrls: ['./payment-terms-create.component.css'],
})
export class PaymentTermsCreateComponent {
  Formgroup!: FormGroup;
  isEdit = false;
  PaymentTermsId!: string;
  menu: any;
  paymentType: any = [];

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
    let has = this.activeLink.snapshot.queryParamMap.has('PaymentTermsId');
    if (has) {
      this.PaymentTermsId = this.activeLink.snapshot.queryParams['PaymentTermsId'];
      this.isEdit = true;
      this.GetPaymentTermsEditDataById();
    } else {
      this.isEdit = false;
    }
  }


  ngOnInit() {
    var permissions = this.gs.CheckUserPermission('Create Payment Terms');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;
    this.getInitialData();

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }
    this.title.setTitle('Create Payment Terms');
    this.GenerateForm();

    if (this.isEdit) {
      this.GetPaymentTermsEditDataById();
    }
  }

  getInitialData() {
    var userId = window.localStorage.getItem('userId');
    var ProcedureData = {
      procedureName: '[usp_PaymentTerms_GetInitialData]',
      parameters: {
      },
    };
    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.paymentType = JSON.parse(results.data).Tables1;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }
  GenerateForm() {
    this.Formgroup = this.fb.group({
      Mode: ['', [Validators.required]],
      PaymentType: ['', [Validators.required]],
      Details: ['', [Validators.required]],
      IsAvailable: [false],
    });
  }
  GetPaymentTermsEditDataById() {
    var ProcedureData = {
      procedureName: '[usp_PaymentTerms_ById]',
      parameters: {
        Payment_Term_ID: this.PaymentTermsId,
      },
    };
    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        console.log(results);

        if (results.status) {
          var tableData = JSON.parse(results.data).Tables1;
          tableData.forEach((e: any) => {
            this.Formgroup.controls.Mode.setValue(e.Mode);
            this.Formgroup.controls.Details.setValue(e.Details);
            this.Formgroup.controls.PaymentType.setValue(e.PaymentTypeId);
            this.Formgroup.controls.IsAvailable.setValue(e.IsAvailable);
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

  saveData() {
    console.log(this.Formgroup);

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

    var userId = window.localStorage.getItem('userId');
    var paymentTermsId = {
      Mode: this.Formgroup.value.Mode,
      Details: this.Formgroup.value.Details,
      PaymentTypeId: this.Formgroup.value.PaymentType,
      IsAvailable: this.Formgroup.value.IsAvailable ? 1 : 0,
    };

    var tableName = 'tbl_payment_terms';

    this.masterEntyService
      .SaveSingleData(paymentTermsId, tableName)
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

  updateData() {
    if (this.Formgroup.invalid) {
      swal.fire('Invalid Inputs!', 'Please check inputs', 'info');
      return;
    }

    var fDate = new Date();
    const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();

    const formatted = `${mm}/${dd}/${yyyy}`;

    var userId = window.localStorage.getItem('userId');    

    var paymentTermsId = {
      Mode: this.Formgroup.value.Mode,
      Details: this.Formgroup.value.Details,
      PaymentTypeId: this.Formgroup.value.PaymentType,
      IsAvailable: this.Formgroup.value.IsAvailable ? 1 : 0,
    };

    let condition = { Payment_Term_ID: this.PaymentTermsId };
    let tableName = 'tbl_payment_terms';

    this.masterEntyService
      .UpdateData(paymentTermsId, condition, tableName)
      .subscribe((res: any) => {
        if (res.status) {
          swal
            .fire({
              title: `${res.message}!`,
              text: `Update Successfully!`,
              icon: 'success',
              timer: 5000,
            })
            .then(() => {
              this.ngOnInit();
            });
        } else {
          if (res.message == 'Invalid Token') {
            swal.fire('Session Expired!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {
            swal.fire('Failed!', 'Update Failed!', 'info');
          }
        }
      });
  }
}
