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
  countryData: any[] = [];

  // ── Logo upload (new — existing properties/methods are NOT modified) ──────
  selectedFile:   File   | null = null;
  logoPreviewUrl: string | null = null;

  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  private readonly MAX_SIZE_MB   = 2;
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
      this.LoadBeneficiaryData(+this.BeneficiaryId); // new — loads form fields + logo preview
    }
    this.GetPaymentType();
    this.GetCountry();
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
          swal.fire('Failed!', 'Save Failed!', 'info');
        }
      }
    });
  }



  updateData() {
    if (this.Formgroup.invalid) {
      swal.fire('Invalid Inputs!', 'Please check inputs', 'info');
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
          swal.fire('Failed!', 'Update Failed!', 'info');
        }
      }
    });
  }

  LoadBeneficiaryData(id: number): void {
    this.masterEntyService.GetBeneficiaryById(id).subscribe({
      next: (res) => {
        if (!res.status || !res.data) {
          swal.fire('Error', 'Beneficiary not found.', 'error');
          return;
        }

        const d = res.data;

        this.Formgroup.patchValue({
          CompanyName:   d.companyName,
          BinNo:         d.binNo,
          Address:       d.address,
          City:          d.city,
          Country_ID:    d.country_ID,
          ETIN:          d.etin,
          VATRegNo:      d.vatRegNo,
          IsAvailable:   d.isAvailable,
          PaymentTypeId: d.paymentTypeId,
        });

        if (d.logoImageBase64) {
          this.logoPreviewUrl = d.logoImageBase64;
        }
      },
      error: () => swal.fire('Error', 'Failed to load beneficiary data.', 'error'),
    });
  }

  onFileSelected(event: any): void {
    const file: File | undefined = event.target.files?.[0];
    if (!file) return;

    if (!this.isValidImageFile(file)) {
      event.target.value = '';   // reset input
      this.selectedFile   = null;
      this.logoPreviewUrl = null;
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e: any) => (this.logoPreviewUrl = e.target.result);
    reader.readAsDataURL(file);
  }

  clearFile(): void {
    this.selectedFile   = null;
    this.logoPreviewUrl = null;
  }

  submitCreate(): void {
    if (!this.selectedFile) {
      this.saveData(); 
      return;
    }

    if (this.Formgroup.invalid) {
      swal.fire('Invalid Inputs!', 'Please fill required fields.', 'info');
      return;
    }

    const formData = this.buildFormData();

    this.masterEntyService.SaveBeneficiary(formData).subscribe({
      next: (res: any) => {
        if (res.status) {
          swal.fire({
            title: 'Saved!',
            text: 'Save Successfully!',
            icon: 'success',
            timer: 5000,
          }).then(() => {
            this.clearFile();
            this.ngOnInit();
          });
        } else {
          this.handleApiError(res, 'Save Failed!');
        }
      },
      error: () => swal.fire('Error', 'An unexpected error occurred.', 'error'),
    });
  }

  submitUpdate(): void {
    if (!this.selectedFile) {
      this.updateData(); 
      return;
    }

    if (this.Formgroup.invalid) {
      swal.fire('Invalid Inputs!', 'Please check inputs', 'info');
      return;
    }

    const formData = this.buildFormData();
    formData.append('Beneficiary_Account_ID', this.BeneficiaryId);

    this.masterEntyService.UpdateBeneficiary(formData).subscribe({
      next: (res: any) => {
        if (res.status) {
          swal.fire({
            title: 'Updated!',
            text: 'Update Successfully!',
            icon: 'success',
            timer: 5000,
          }).then(() => {
            this.clearFile();
            this.ngOnInit();
          });
        } else {
          this.handleApiError(res, 'Update Failed!');
        }
      },
      error: () => swal.fire('Error', 'An unexpected error occurred.', 'error'),
    });
  }

  private isValidImageFile(file: File): boolean {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      swal.fire(
        'Invalid File Type',
        'Only JPG, PNG, and WebP images are allowed.',
        'warning'
      );
      return false;
    }

    if (file.size > this.MAX_SIZE_MB * 1024 * 1024) {
      swal.fire(
        'File Too Large',
        `Image must be smaller than ${this.MAX_SIZE_MB} MB.`,
        'warning'
      );
      return false;
    }

    return true;
  }

  private buildFormData(): FormData {
    const formData  = new FormData();
    const formValue = { ...this.Formgroup.value };

    formValue.IsAvailable   = formValue.IsAvailable ? 1 : 0;
    formValue.Sent_By       = (localStorage.getItem('userId') ?? '').toString();
    formValue.Received_By   = '58';
    formValue.Received_Date = this.nowSql();

    Object.entries(formValue).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    if (this.selectedFile) {
      formData.append('logoImage', this.selectedFile, this.selectedFile.name);
    }

    return formData;
  }

  private handleApiError(res: any, fallbackMsg: string): void {
    if (res.message === 'Invalid Token') {
      swal.fire('Session Expired!', 'Please Login Again.', 'info');
      this.gs.Logout();
    } else {
      swal.fire('Failed!', res.message || fallbackMsg, 'info');
    }
  }
}
