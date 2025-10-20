import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-beneficiarybank-create',
  templateUrl: './beneficiarybank-create.component.html',
  styleUrls: ['./beneficiarybank-create.component.css']
})
export class BeneficiarybankCreateComponent implements OnInit {
  Formgroup!: FormGroup;
  isEdit = false;
  BeneficiaryBankId!: string;

  paymentTypes: any[] = [];
  countryData: any[] = [];

  constructor(
    private fb: FormBuilder,
    private masterEntyService: MasterEntryService,
    private gs: GlobalServiceService,
    private activeLink: ActivatedRoute,
    private title: Title
  ) {
    if (this.activeLink.snapshot.queryParamMap.has('Beneficiary_Bank_ID')) {
      this.BeneficiaryBankId = this.activeLink.snapshot.queryParams['Beneficiary_Bank_ID'];
      this.isEdit = true;
    }
  }

  ngOnInit() {
    this.title.setTitle('Beneficiary Bank');
    this.GenerateForm();

    if (this.isEdit) {
      this.GetById(this.BeneficiaryBankId);
    }

    // dropdown load
    this.GetPaymentType();
    this.GetCountry();
  }

  GenerateForm() {
    this.Formgroup = this.fb.group({
      BankName: ['', [Validators.required]],
      AccountNo: ['', [Validators.required]],
      Branch: [''],
      Address: [''],
      City: [''],
      Country_ID: ['', [Validators.required]],
      CourrencyDetails: [''],
      SwiftCode: [''],
      IsAvailable: [false],
      PaymentTypeId: ['', [Validators.required]]
    });
  }

  GetPaymentType() {
    this.masterEntyService.GetDataTable({
      tableName: "tbl_payment_type",
      columnNames: "Id,Name",
      whereParams: "",
      queryParams: ""
    }).subscribe({
      next: (results) => {
        if (results.status) {
          const firstParse = JSON.parse(results.data);
          const parsed = JSON.parse(firstParse);
          this.paymentTypes = parsed.data.map((row: any) => ({
            id: row[0],
            name: row[1]
          }));
        }
      }
    });
  }

  GetCountry() {
    this.masterEntyService.GetDataTable({
      tableName: "tbl_country",
      columnNames: "Country_ID,Country",
      whereParams: "",
      queryParams: ""
    }).subscribe({
      next: (results) => {
        if (results.status) {
          const firstParse = JSON.parse(results.data);
          const parsed = JSON.parse(firstParse);
          this.countryData = parsed.data.map((row: any) => ({
            id: row[0],
            name: row[1]
          }));
        }
      }
    });
  }

  GetById(id: any) {
    let masterEntryModel = new MasterEntryModel();
    masterEntryModel.tableName = 'tbl_beneficiary_bank';
    masterEntryModel.columnNames =
      'Beneficiary_Bank_ID,BankName,AccountNo,Branch,Address,City,Country_ID,CourrencyDetails,SwiftCode,IsAvailable,PaymentTypeId';
    masterEntryModel.whereParams = '{"Beneficiary_Bank_ID":' + id + '}';

    this.masterEntyService.GetEditData(masterEntryModel).subscribe((res: any) => {
      if (res.status) {
        let data = JSON.parse(res.data)[0];
        data.IsAvailable = data.IsAvailable === 1 ? true : false;
        this.Formgroup.patchValue(data);
      } else {
        if (res.msg == 'Invalid Token') {
          this.gs.Logout();
        }
      }
    });
  }
nowSql(): string {
    const date = new Date();
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }
  saveData() {
    if (this.Formgroup.invalid) {
      Swal.fire('Invalid Inputs!', 'Please provide required fields.', 'info');
      return;
    }
//to do
    let payload = { ...this.Formgroup.value,
      Sent_By: (localStorage.getItem('userId') ?? '').toString(),
      Received_By: '58',  //to do need to make dynamic
      Received_Date: this.nowSql(), 
      // MakeBy:(localStorage.getItem('userId') ?? '').toString()

    };
    payload.IsAvailable = payload.IsAvailable ? 1 : 0;

    this.masterEntyService.SaveSingleData(payload, 'tbl_beneficiary_bank').subscribe((res: any) => {
      if (res.status) {
        Swal.fire({
          title: `${res.message}!`,
          text: `Saved Successfully!`,
          icon: 'success',
          timer: 5000
        }).then(() => {
          this.ngOnInit();
        });
      } else {
        if (res.message == 'Data already exist') {
          Swal.fire('Data already exist', '', 'warning');
        } else if (res.message == 'Invalid Token') {
          Swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
          Swal.fire('Failed!', 'Save Failed!', 'info');
        }
      }
    });
  }

  updateData() {
    if (this.Formgroup.invalid) {
      Swal.fire('Invalid Input', 'Please check inputs', 'info');
      return;
    }

    let payload = { ...this.Formgroup.value };
    payload.IsAvailable = payload.IsAvailable ? 1 : 0;

    let condition = { Beneficiary_Bank_ID: this.BeneficiaryBankId };
    let tableName = 'tbl_beneficiary_bank';

    this.masterEntyService.UpdateData(payload, condition, tableName).subscribe((res: any) => {
      if (res.status) {
        Swal.fire({
          title: `${res.message}!`,
          text: `Updated Successfully!`,
          icon: 'success',
          timer: 5000
        }).then(() => {
          this.ngOnInit();
        });
      } else {
        if (res.message == 'Invalid Token') {
          Swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
          Swal.fire('Failed!', 'Update Failed!', 'info');
        }
      }
    });
  }
}
