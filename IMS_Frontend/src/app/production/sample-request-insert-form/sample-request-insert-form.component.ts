import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LC } from 'src/app/models/LCModel';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { Roles } from 'src/app/models/roles.model';
import { SampleRequest } from 'src/app/models/SampleRequestModel';
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-sample-request-insert-form',
  templateUrl: './sample-request-insert-form.component.html',
  styleUrls: ['./sample-request-insert-form.component.css'],
})
export class SampleRequestInsertFormComponent {
  Formgroup!: FormGroup;
  isEdit = false;
  LCId!: string;
  companyId!: string;
  menu: any;
  ArticleList: any;
  ColorList: any;
  WidthList: any;
  UnitList: any;
  CustomerList: any;
  DescList: any;
  SRId = '';
  RequestStatus: any = [
    {
      value: '',
      text: '--Select Carried By--',
    },
    {
      value: 'Messenger',
      text: 'Messenger',
    },
    {
      value: 'By Own',
      text: 'By Own',
    },
  ];

  insertPermissions: boolean = false;
  updatePermissions: boolean = false;
  deletePermissions: boolean = false;
  printPermissions: boolean = false;

  constructor(
    private fb: FormBuilder,
    private masterEntyService: MasterEntryService,
    private doubleMasterEntryService: DoubleMasterEntryService,
    private gs: GlobalServiceService,
    private activeLink: ActivatedRoute,
    private title: Title
  ) {
    // this.gs.CheckToken().subscribe();
    let has = this.activeLink.snapshot.queryParamMap.has('SRId');
    if (has) {
      this.SRId = this.activeLink.snapshot.queryParams['SRId'];
      this.isEdit = true;
    } else {
      this.isEdit = false;
    }
  }

  ngOnInit() {
    var permissions = this.gs.CheckUserPermission('Sample Request Form');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.insertPermissions) {
      window.location.href = 'sample-request-list';
    }
    if (!this.updatePermissions && this.isEdit) {
      window.location.href = 'sample-request-list';
    }

    this.title.setTitle('Sample Request Form');
    this.GenerateFrom();
    this.getInitialData();
    this.addItem();
  }
  // @ViewChildren('dateInput') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;
  GenerateFrom() {
    this.Formgroup = this.fb.group({
      items: this.fb.array([]),
    });
  }

  get items(): FormArray {
    return this.Formgroup.get('items') as FormArray;
  }

  addItem() {
    const row = this.fb.group({
      RequestDate: this.fb.control<string | null>(null, Validators.required),
      CustomerName: this.fb.control<string | null>(null, Validators.required),
      Customer_Contact_Info: this.fb.control<string>('', Validators.required),
      Product_Description: this.fb.control<string>('', Validators.required),
      ArticleNo: this.fb.control<string | null>(null, Validators.required),
      Sample_Article_No: this.fb.control<string | null>(
        null,
        Validators.required
      ),
      Color: this.fb.control<string | null>(null, Validators.required),
      Width: this.fb.control<string | null>(null, Validators.required),
      Unit: this.fb.control<string | null>(null, Validators.required),
      Requested_Quantity: this.fb.control<number | null>(
        null,
        Validators.required
      ),
      Shipping_Address: this.fb.control<string>('', Validators.required),
      RequestStatus: this.fb.control<string | null>(null, Validators.required),
      Remarks: this.fb.control<string>(''),
    });

    this.items.push(row);
  }

  removeItem(i: number) {
    this.items.removeAt(i);
  }

  getInitialData() {
    var userId = window.localStorage.getItem('userId');
    var ProcedureData = {
      procedureName: '[usp_SampleRequest_GetInitialData]',
      parameters: {
        UserId: userId,
      },
    };

    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.CustomerList = JSON.parse(results.data).Tables1;
          this.ArticleList = JSON.parse(results.data).Tables2;
          this.ColorList = JSON.parse(results.data).Tables3;
          this.WidthList = JSON.parse(results.data).Tables4;
          this.UnitList = JSON.parse(results.data).Tables5;
          this.DescList = JSON.parse(results.data).Tables6;
          console.log(results);
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
    console.log(this.Formgroup);
    
    if (this.Formgroup.invalid) {
      swal.fire(
        'Invlid Inputs!',
        'Form is Invalid! Please select Role.',
        'info'
      );
      return;
    }

    var userId = window.localStorage.getItem('userId');

    const fv = this.Formgroup.value;
    console.log(fv.items);

    const multipleRows: any = [];

    for (const index in fv.items) {
      console.log(index, fv.items[index]);
      const selectedText = this.ArticleList.find(
        (x: any) => x.Item_ID === fv.items[index].ArticleNo
      )?.Color_ID;
      var sr = new SampleRequest();
      sr.RequestDate = fv.items[index].RequestDate;
      //sr. = this.Formgroup.value.PINo;
      sr.CustomerId = fv.items[index].CustomerName;
      sr.CustomerContactInfo = fv.items[index].Customer_Contact_Info;
      sr.ProductDescription = fv.items[index].Product_Description;
      sr.ItemId = fv.items[index].ArticleNo;
      sr.ColorId = fv.items[index].Color;
      sr.WidthId = fv.items[index].Width;
      sr.UnitId = fv.items[index].Unit;
      sr.RequestedQuantity = fv.items[index].Requested_Quantity;
      sr.ShippingAddress = fv.items[index].Shipping_Address;
      sr.RequestStatus = fv.items[index].RequestStatus;
      sr.Remarks = fv.items[index].Remarks;
      sr.SampleArticleNo = fv.items[index].Sample_Article_No;
      sr.RequesterId = userId == null ? '0' : userId;

      multipleRows.push(sr);
    }

    this.doubleMasterEntryService
      .SaveData(multipleRows, 'tbl_SampleRequestForm')
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

  CustomerDetails(item: any) {
    var ProcedureData = {
      procedureName: '[usp_SampleRequest_CustomerList]',
      parameters: {
        CustomerId: item.controls.CustomerName.value,
      },
    };

    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          var CustomerDetails = JSON.parse(results.data).Tables1;
          item.controls.Customer_Contact_Info.setValue(CustomerDetails[0].Contact_Name);
          item.controls.Shipping_Address.setValue(CustomerDetails[0].Customer_Address);
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }
}