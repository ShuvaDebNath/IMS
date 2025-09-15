import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-beneficiary-create',
  templateUrl: './beneficiary-create.component.html',
  styleUrls: ['./beneficiary-create.component.css']
})
export class BeneficiaryCreateComponent implements OnInit {
  Formgroup!: FormGroup;
  isEdit = false;
  BeneficiaryId!: string;
  menu: any;

  insertPermissions: boolean = false;
  updatePermissions: boolean = false;
  paymentTypes: any[] = [];
  countryData: any[]=[]
  constructor(
    private fb: FormBuilder,
    private masterEntyService: MasterEntryService,
    private gs: GlobalServiceService,
    private activeLink: ActivatedRoute,
    private title: Title,
  ) {
    let has = this.activeLink.snapshot.queryParamMap.has('Beneficiary_Account_ID');
    if (has) {
      this.BeneficiaryId = this.activeLink.snapshot.queryParams['Beneficiary_Account_ID'];
      this.isEdit = true;
    } else {
      this.isEdit = false;
    }
  }

  ngOnInit() {
    this.title.setTitle('Beneficiary');
    this.GenerateForm();

    if (this.isEdit) {
      this.GetBeneficiaryById(this.BeneficiaryId);
    }
    this.GetPaymentType()
    this.GetCountry()
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
          const firstParse = JSON.parse(results.data)

          const parsed = JSON.parse(firstParse);
          this.paymentTypes = parsed.data.map((row: any) => ({
            id: row[0],
            name: row[1]
          }));

        }
      }
    })
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
          const firstParse = JSON.parse(results.data)

          const parsed = JSON.parse(firstParse);
          this.countryData = parsed.data.map((row: any) => ({
            id: row[0],
            name: row[1]
          }));
          console.log( this.countryData)
        }
      }
    })
  }
  GenerateForm() {
    this.Formgroup = this.fb.group({
      CompanyName: ['', [Validators.required]],
      BinNo: [''],
      Address: [''],
      City: [''],
      Country_ID: ['', [Validators.required]],
      ETIN: [''],
      VATRegNo: [''],
      IsAvailable: [false], // checkbox -> default false
      PaymentTypeId: ['', [Validators.required]]
    });
  }
  nowSql(): string {
    const date = new Date();
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }
  GetBeneficiaryById(id: any) {
    var masterEntryModel = new MasterEntryModel();
    masterEntryModel.tableName = 'tbl_beneficiary_account';
    masterEntryModel.columnNames = 'Beneficiary_Account_ID,CompanyName,BinNo,Address,City,Country_ID,ETIN,VATRegNo,IsAvailable,PaymentTypeId';
    masterEntryModel.whereParams = '{"Beneficiary_Account_ID":' + this.BeneficiaryId + '}';

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

  saveData() {
    if (this.Formgroup.invalid) {
      swal.fire('Invalid Inputs!', 'Please fill required fields.', 'info');
      return;
    }

    let payload = {
      ...this.Formgroup.value,
      Sent_By: (localStorage.getItem('userId') ?? '').toString(),
      Received_By: '58',  //to do need to make dynamic
      Received_Date: this.nowSql(),
    };
    payload.IsAvailable = payload.IsAvailable ? 1 : 0;

    this.masterEntyService.SaveSingleData(payload, 'tbl_beneficiary_account').subscribe((res: any) => {
      if (res.status) {
        swal.fire({
          title: `${res.message}!`,
          text: `Save Successfully!`,
          icon: 'success',
          timer: 5000,
        }).then(() => {
          this.ngOnInit();
        });
      } else {
        if (res.message == 'Data already exist') {
          swal.fire('Data already exist', '', 'warning');
        } else if (res.message == 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
          swal.fire('Failed!', 'Save Failed!', 'error');
        }
      }
    });
  }



  updateData() {
    if (this.Formgroup.invalid) {
      swal.fire('Invalid Inputs!', 'Please check inputs', 'error');
      return;
    }

    let payload = { ...this.Formgroup.value };
    payload.IsAvailable = payload.IsAvailable ? 1 : 0;

    let condition = { Beneficiary_Account_ID: this.BeneficiaryId };
    let tableName = 'tbl_beneficiary_account';

    this.masterEntyService.UpdateData(payload, condition, tableName).subscribe((res: any) => {
      if (res.status) {
        swal.fire({
          title: `${res.message}!`,
          text: `Update Successfully!`,
          icon: 'success',
          timer: 5000,
        }).then(() => {
          this.ngOnInit();
        });
      } else {
        if (res.message == 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
          swal.fire('Failed!', 'Update Failed!', 'error');
        }
      }
    });
  }
}
