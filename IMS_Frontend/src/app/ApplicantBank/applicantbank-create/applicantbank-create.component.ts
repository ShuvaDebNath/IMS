import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-applicantbank-create',
  templateUrl: './applicantbank-create.component.html',
  styleUrls: ['./applicantbank-create.component.css']
})
export class ApplicantbankCreateComponent implements OnInit {
  Formgroup!: FormGroup;
  isEdit = false;
  ApplicantBankId!: string;

  constructor(
    private fb: FormBuilder,
    private masterEntyService: MasterEntryService,
    private gs: GlobalServiceService,
    private activeLink: ActivatedRoute,
    private title: Title
  ) {
    if (this.activeLink.snapshot.queryParamMap.has('Applicant_Bank_ID')) {
      this.ApplicantBankId = this.activeLink.snapshot.queryParams['Applicant_Bank_ID'];
      this.isEdit = true;
    }
  }

  ngOnInit() {
    this.title.setTitle('Applicant Bank');
    this.GenerateForm();

    if (this.isEdit) {
      this.GetById(this.ApplicantBankId);
    }
  }

  GenerateForm() {
    this.Formgroup = this.fb.group({
      BankCode: ['', [Validators.required]],
      BankName: ['', [Validators.required]],
      Details: ['']
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

    let payload = {
      ...this.Formgroup.value,
      Sent_By: (localStorage.getItem('userId') ?? '').toString(),
      Received_By: '58',
      Received_Date: this.nowSql()
    };

    this.masterEntyService.SaveSingleData(payload, 'tbl_applicant_bank').subscribe((res: any) => {
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

    let condition = { Applicant_Bank_ID: this.ApplicantBankId };
    let tableName = 'tbl_applicant_bank';

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

  GetById(id: any) {
    let masterEntryModel = new MasterEntryModel();
    masterEntryModel.tableName = 'tbl_applicant_bank';
    masterEntryModel.columnNames = 'Applicant_Bank_ID,BankCode,BankName,Details';
    masterEntryModel.whereParams = '{"Applicant_Bank_ID":' + id + '}';

    this.masterEntyService.GetEditData(masterEntryModel).subscribe((res: any) => {
      if (res.status) {
        let data = JSON.parse(res.data)[0];
        this.Formgroup.patchValue(data);
      } else {
        if (res.msg == 'Invalid Token') {
          this.gs.Logout();
        }
      }
    });
  }
}
