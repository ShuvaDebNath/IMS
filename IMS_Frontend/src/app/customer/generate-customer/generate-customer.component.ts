import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CD } from 'src/app/models/CDModel';
import { Customers } from 'src/app/models/customers';
import { LC } from 'src/app/models/LCModel';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { Roles } from 'src/app/models/roles.model';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-generate-customer',
  templateUrl: './generate-customer.component.html',
  styleUrls: ['./generate-customer.component.css']
})
export class GenerateCustomerComponent {
Formgroup!: FormGroup;
  isEdit = false;
  UserList: any;
  CustomerId!: string;
  CountryList!: any;
  menu: any;

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
    let has = this.activeLink.snapshot.queryParamMap.has(
      'Customer_Id'
    );
    if (has) {
      this.CustomerId = this.activeLink.snapshot.queryParams['Customer_Id'];
      this.isEdit = true;
    } else {
      this.isEdit = false;
    }
  }

  ngOnInit() {
    var permissions = this.gs.CheckUserPermission(
      'All Customers'
    );
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.insertPermissions) {
      window.location.href = 'All Customers';
    }

    this.title.setTitle('Customers');
    this.GenerateFrom();
    this.getInitialData();

    if (this.isEdit) {
      this.GetCustomerEditDataById();
    }
  }

  GenerateFrom() {
    // Customer_ID, Company_Name, Contact_Name, Customer_Address, City, Postal_Code, Country_ID, Contact_Title, Phone_No, FAX_No, Email, Notes, Superior_ID, Created_By, Updated_By, Created_At, Updated_At, 
    //                      IsAvailable, ItemDoing, Status, ApprovedById, ApprovedDate

    this.Formgroup = this.fb.group({
      Company_Name: ['', [Validators.required]],
      Contact_Name: [''],
      Customer_Address: [''],
      City: [''],
      Postal_Code: [''],
      Country_ID: [''],
      Contact_Title: [''],
      Phone_No: [''],
      FAX_No: [''],
      Email: [''],
      Notes: [''],
      Company_Info:[''],
      User_Id: [''],
      IsAvailable: ['', [Validators.required]],
      Status: [''],
    });
  }

  getInitialData() {
    var ProcedureData = {
      procedureName: '[usp_Customer_GetInitialData]',
      parameters: {},
    };

    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.CountryList = JSON.parse(results.data).Tables1;
          this.UserList = JSON.parse(results.data).Tables2;
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
    var cd = new Customers();
    cd.Company_Name = this.Formgroup.value.Company_Name;
    cd.Contact_Name = this.Formgroup.value.Contact_Name;
    cd.Customer_Address = this.Formgroup.value.Customer_Address;
    cd.Company_Info = this.Formgroup.value.Company_Info;
    cd.City = this.Formgroup.value.City;
    cd.Postal_Code = this.Formgroup.value.Postal_Code;
    cd.Country_ID = this.Formgroup.value.Country_ID;
    cd.Contact_Title = this.Formgroup.value.Contact_Title;
    cd.Phone_No = this.Formgroup.value.Phone_No;
    cd.FAX_No = this.Formgroup.value.FAX_No;
    cd.Email = this.Formgroup.value.Email;
    cd.Notes = this.Formgroup.value.Notes;
    cd.Superior_ID = this.Formgroup.value.User_Id;
    cd.IsAvailable = this.Formgroup.value.IsAvailable;
    cd.Status = 'Unapproved';    
    cd.Created_By = this.Formgroup.value.FreightCharge;
    cd.Created_At = formatted;
    cd.Created_By = userId == undefined ? '' : userId;

    var tableName = 'tbl_customer';

    this.masterEntyService
      .SaveSingleData(cd, tableName)
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
              icon: 'error',
              timer: 5000,
            });
          }
        }
      });
  }

  GetCustomerEditDataById() {
    console.log(this.CustomerId);
    
    var ProcedureData = {
      procedureName: '[usp_Customer_ById]',
      parameters: {
        Customer_Id: this.CustomerId,
      },
    };
    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        console.log(results);
        
        if (results.status) {
          var tableData = JSON.parse(results.data).Tables1;

          tableData.forEach((e: any) => {
            this.Formgroup.controls.Company_Name.setValue(e.Company_Name);
            this.Formgroup.controls.Contact_Name.setValue(e.Contact_Name);
            this.Formgroup.controls.Customer_Address.setValue(e.Customer_Address);
            this.Formgroup.controls.Company_Info.setValue(e.Company_Info);
            this.Formgroup.controls.City.setValue(e.City);
            this.Formgroup.controls.Postal_Code.setValue(e.Postal_Code);
            this.Formgroup.controls.Country_ID.setValue(e.Country_ID);
            this.Formgroup.controls.Contact_Title.setValue(e.Contact_Title);
            this.Formgroup.controls.Phone_No.setValue(e.Phone_No);
            this.Formgroup.controls.FAX_No.setValue(e.FAX_No);
            this.Formgroup.controls.Email.setValue(e.Email);
            this.Formgroup.controls.Notes.setValue(e.Notes);
            console.log(e.Superior_ID);
            
            this.Formgroup.controls.User_Id.setValue(e.Superior_ID);
            this.Formgroup.controls.IsAvailable.setValue(e.IsAvailable);
            this.Formgroup.controls.Status.setValue(e.Status);
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

  updateData() {
    if (this.Formgroup.invalid) {
      swal.fire('Invaild Input', 'Please check inputs', 'error');
      return;
    }
    var fDate = new Date();
    const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();

    const formatted = `${mm}/${dd}/${yyyy}`;

    var userId = window.localStorage.getItem('userId');
    var cd = new Customers();
    cd.Company_Name = this.Formgroup.value.Company_Name;
    cd.Contact_Name = this.Formgroup.value.Contact_Name;
    cd.Company_Info = this.Formgroup.value.Company_Info;
    cd.Customer_Address = this.Formgroup.value.Customer_Address;
    cd.City = this.Formgroup.value.City;
    cd.Postal_Code = this.Formgroup.value.Postal_Code;
    cd.Country_ID = this.Formgroup.value.Country_ID;
    cd.Contact_Title = this.Formgroup.value.Contact_Title;
    cd.Phone_No = this.Formgroup.value.Phone_No;
    cd.FAX_No = this.Formgroup.value.FAX_No;
    cd.Email = this.Formgroup.value.Email;
    cd.Notes = this.Formgroup.value.Notes;
    console.log(this.Formgroup.value.User_Id);
    
    cd.Superior_ID = this.Formgroup.value.User_Id;
    cd.IsAvailable = this.Formgroup.value.IsAvailable;
    cd.Status = 'Unapproved';    
    cd.Created_By = this.Formgroup.value.FreightCharge;
    cd.Created_At = formatted;
    cd.Created_By = userId == undefined ? '' : userId;
    console.log(cd);
    
    var tableName = 'tbl_customer';


    let queryParams = cd;
    let condition = {
      Customer_Id: this.CustomerId,
    };

    this.masterEntyService
      .UpdateData(queryParams, condition, tableName)
      .subscribe((res: any) => {
        if (res.status) {
          swal
            .fire({
              title: `${res.message}!`,
              text: `Update Successfully!`,
              icon: 'success',
              timer: 5000,
            })
            .then((result) => {
              this.ngOnInit();
            });
        } else {
          if (res.message == 'Invalid Token') {
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
