import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LC } from 'src/app/models/LCModel';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { Roles } from 'src/app/models/roles.model';
import { SampleRequest } from 'src/app/models/SampleRequestModel';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-sample-request-form',
  templateUrl: './sample-request-form.component.html',
  styleUrls: ['./sample-request-form.component.css'],
})
export class SampleRequestFormComponent {
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
  DescList:any;
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
  }

  GenerateFrom() {
    this.Formgroup = this.fb.group({
      RequestDate: ['', [Validators.required]],
      CustomerName: ['', [Validators.required]],
      Customer_Contact_Info: ['', Validators.required],
      Product_Description: ['', [Validators.required]],
      ArticleNo: ['', [Validators.required]],
      SampleArticleNo: ['', [Validators.required]],
      Color: ['', [Validators.required]],
      Width: ['', [Validators.required]],
      Unit: ['', [Validators.required]],
      Requested_Quantity: ['', [Validators.required]],
      Shipping_Address: ['', Validators.required],
      RequestStatus: ['', [Validators.required]],
      Remarks: [''],
    });
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

          if (this.isEdit) {
            this.GetSRById();
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

  customerInfo() {
    const selectedText = this.CustomerList.find(
      (x: any) => x.Customer_ID === this.Formgroup.value.CustomerName
    )?.Contact_Name;

    this.Formgroup.controls.Customer_Contact_Info.setValue(selectedText);
  }

  saveData() {
    if (this.Formgroup.invalid) {
      swal.fire(
        'Invlid Inputs!',
        'Form is Invalid! Please select Role.',
        'info'
      );
      return;
    }

    const selectedText = this.CustomerList.find(
      (x: any) => x.Customer_ID === this.Formgroup.value.CustomerName
    )?.Color_ID;

    var userId = window.localStorage.getItem('userId');

    var sr = new SampleRequest();
    console.log(this.Formgroup.value.RequestDate);

    sr.RequestDate = this.Formgroup.value.RequestDate;
    //sr. = this.Formgroup.value.PINo;
    sr.CustomerId = this.Formgroup.value.CustomerName;
    sr.CustomerContactInfo = this.Formgroup.value.Customer_Contact_Info;
    sr.ProductDescription = this.Formgroup.value.Product_Description;
    sr.ItemId = this.Formgroup.value.ArticleNo;
    sr.RequestedQuantity = this.Formgroup.value.Requested_Quantity;
    sr.ShippingAddress = this.Formgroup.value.Shipping_Address;
    sr.RequestStatus = this.Formgroup.value.RequestStatus;
    sr.Remarks = this.Formgroup.value.Remarks;
    sr.RequesterId = userId == null ? '0' : userId;
    sr.ItemId = this.Formgroup.value.ArticleNo;
    sr.ColorId = this.Formgroup.value.Color;
    sr.WidthId = this.Formgroup.value.Width;
    sr.UnitId = this.Formgroup.value.Unit;

    this.masterEntyService
      .SaveSingleData(sr, 'tbl_SampleRequestForm')
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
      swal.fire(
        'Invlid Inputs!',
        'Form is Invalid! Please select Role.',
        'info'
      );
      return;
    }

    const selectedText = this.CustomerList.find(
      (x: any) => x.Customer_ID === this.Formgroup.value.CustomerName
    )?.name;

    var sr = new SampleRequest();

    const d = new Date(this.Formgroup.value.RequestDate);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const year = d.getFullYear();

    sr.RequestDate = `${month}/${day}/${year}`;
    sr.CustomerId = this.Formgroup.value.CustomerName;
    sr.CustomerContactInfo = this.Formgroup.value.Customer_Contact_Info;
    sr.ProductDescription = this.Formgroup.value.Product_Description;
    sr.ItemId = this.Formgroup.value.ArticleNo;
    sr.RequestedQuantity = this.Formgroup.value.Requested_Quantity;
    sr.ShippingAddress = this.Formgroup.value.Shipping_Address;
    sr.RequestStatus = this.Formgroup.value.RequestStatus;
    sr.Remarks = this.Formgroup.value.Remarks;
    sr.ColorId = this.Formgroup.value.Color;
    sr.WidthId = this.Formgroup.value.Width;
    sr.UnitId = this.Formgroup.value.Unit;
    sr.SampleArticleNo = this.Formgroup.value.SampleArticleNo;

    var whereParam = {
      Id: this.SRId,
    };

    this.masterEntyService
      .UpdateData(sr, whereParam, 'tbl_SampleRequestForm')
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

  GetSRById() {
    var ProcedureData = {
      procedureName: '[usp_SampleRequest_GetDataById]',
      parameters: {
        SRId: this.SRId,
      },
    };
    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          var tableData = JSON.parse(results.data).Tables1;
          console.log(tableData);          

          tableData.forEach((e: any) => {
            var RequestDate = new Date(e.RequestDate);

            this.Formgroup.controls.RequestDate.setValue(RequestDate);
            this.Formgroup.controls.CustomerName.setValue(e.CustomerId);
            this.Formgroup.controls.Customer_Contact_Info.setValue(
              e.CustomerContactInfo
            );
            this.Formgroup.controls.Product_Description.setValue(
              parseInt(e.ProductDescription)
            );
            this.Formgroup.controls.ArticleNo.setValue(e.ItemId);
            this.Formgroup.controls.Color.setValue(e.ColorId);
            this.Formgroup.controls.Width.setValue(e.WidthId);
            this.Formgroup.controls.Unit.setValue(e.UnitId);
            this.Formgroup.controls.Requested_Quantity.setValue(
              e.RequestedQuantity
            );
            this.Formgroup.controls.Shipping_Address.setValue(
              e.ShippingAddress
            );
            this.Formgroup.controls.RequestStatus.setValue(e.RequestStatus);
            this.Formgroup.controls.Remarks.setValue(e.Remarks);
            this.Formgroup.controls.SampleArticleNo.setValue(e.SampleArticleNo);
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

  CustomerDetails() {
      
      var ProcedureData = {
        procedureName: '[usp_SampleRequest_CustomerList]',
        parameters: {
          CustomerId: this.Formgroup.value.CustomerName,
        },
      };
  
      this.masterEntyService.GetInitialData(ProcedureData).subscribe({
        next: (results) => {
          if (results.status) {
            var CustomerDetails = JSON.parse(results.data).Tables1;
            this.Formgroup.controls.RequestDate.setValue(CustomerDetails[0].Contact_Name);
            this.Formgroup.controls.RequestDate.setValue(CustomerDetails[0].Customer_Address);
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
}
