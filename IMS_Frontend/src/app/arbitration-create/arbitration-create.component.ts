import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-arbitration',
  templateUrl: './arbitration-create.component.html',
  styleUrls: ['./arbitration-create.component.css']
})
export class ArbitrationComponent implements OnInit {
  Formgroup!: FormGroup;
  isEdit = false;
  ArbitrationId!: string;
  companyId!: string;
  menu: any;

  insertPermissions = false;

  constructor(
    private fb: FormBuilder,
    private masterEntyService: MasterEntryService,
    private gs: GlobalServiceService,
    private activeLink: ActivatedRoute,
    private title: Title
  ) {
    let has = this.activeLink.snapshot.queryParamMap.has('Arbitration_Id');
    if (has) {
      this.ArbitrationId = this.activeLink.snapshot.queryParams['Arbitration_Id'];
      this.isEdit = true;
    }
  }

  ngOnInit() {
    this.title.setTitle('Arbitration');
    this.GenerateForm();

    if (this.isEdit) {
      this.GetById(this.ArbitrationId);
    }
  }

  GenerateForm() {
    this.Formgroup = this.fb.group({
      Details: ['', [Validators.required]],
      IsAvailable: [false]
    });
  }

  GetById(arbitrationId: any) {
    let masterEntryModel = new MasterEntryModel();
    masterEntryModel.tableName = 'tbl_arbitration';
    masterEntryModel.columnNames = 'Arbitration_Id,Details,IsAvailable';
    masterEntryModel.whereParams = '{"Arbitration_Id":' + arbitrationId + '}';

    this.masterEntyService.GetEditData(masterEntryModel).subscribe((res: any) => {
      if (res.status) {
        let arbitration = JSON.parse(res.data)[0];
        this.Formgroup.controls.Details.setValue(arbitration.Details);
        this.Formgroup.controls.IsAvailable.setValue(arbitration.IsAvailable);
      } else {
        if (res.msg == 'Invalid Token') {
          this.gs.Logout();
        }
      }
    });
  }

  saveData() {
    if (this.Formgroup.invalid) {
      swal.fire('Invalid Inputs!', 'Please provide arbitration details.', 'info');
      return;
    }

    let arbitration = {
      Details: this.Formgroup.value.Details,
      IsAvailable: this.Formgroup.value.IsAvailable
    };

    this.masterEntyService.SaveSingleData(arbitration, 'tbl_arbitration').subscribe((res: any) => {
      if (res.status) {
        swal
          .fire({
            title: `${res.message}!`,
            text: `Saved Successfully!`,
            icon: 'success',
            timer: 5000
          })
          .then(() => {
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
      swal.fire('Invalid Input', 'Please check inputs', 'error');
      return;
    }

    let arbitration = {
      Details: this.Formgroup.value.Details,
      IsAvailable: this.Formgroup.value.IsAvailable
    };

    let condition = { Arbitration_Id: this.ArbitrationId };
    let tableName = 'tbl_arbitration';

    this.masterEntyService.UpdateData(arbitration, condition, tableName).subscribe((res: any) => {
      if (res.status) {
        swal
          .fire({
            title: `${res.message}!`,
            text: `Updated Successfully!`,
            icon: 'success',
            timer: 5000
          })
          .then(() => {
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
