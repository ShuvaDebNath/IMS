import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Buyer } from 'src/app/models/buyer';
import { CD } from 'src/app/models/CDModel';
import { Customers } from 'src/app/models/customers';
import { LC } from 'src/app/models/LCModel';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { Roles } from 'src/app/models/roles.model';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-generate-buying-house',
  templateUrl: './generate-buying-house.component.html',
  styleUrls: ['./generate-buying-house.component.css']
})
export class GenerateBuyingHouseComponent {
Formgroup!: FormGroup;
  isEdit = false;
  UserList: any;
  BuyingHouseId!: string;
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
      'Buying_House_Id'
    );
    if (has) {
      this.BuyingHouseId = this.activeLink.snapshot.queryParams['Buying_House_Id'];
      this.isEdit = true;
    } else {
      this.isEdit = false;
    }
  }

  ngOnInit() {
    var permissions = this.gs.CheckUserPermission(
      'All Buying House'
    );
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
      window.location.href = 'All Buying House';
    }

    this.title.setTitle('Buying House');
    this.GenerateFrom();
    this.getInitialData();

    if (this.isEdit) {
      this.GetBuyingHouseEditDataById();
    }
  }

  GenerateFrom() {
    // Customer_ID, Company_Name, Contact_Name, Customer_Address, City, Postal_Code, Country_ID, Contact_Title, Phone_No, FAX_No, Email, Notes, Superior_ID, Created_By, Updated_By, Created_At, Updated_At, 
    //                      IsAvailable, ItemDoing, Status, ApprovedById, ApprovedDate

    this.Formgroup = this.fb.group({
      Buying_House: ['', [Validators.required]],
      Contact_Name: [''],
      Buying_House_Address: [''],
      City: [''],
      Postal_Code: [''],
      Country_ID: [''],
      Contact_Title: [''],
      Phone_No: [''],
      FAX_No: [''],
      Email: [''],
      Notes: [''],
      Buying_House_Info:[''],
      User_Id: [''],
      IsAvailable: ['', [Validators.required]],
      Status: [''],
    });
  }

  getInitialData() {
    var ProcedureData = {
      procedureName: '[usp_BuyingHouse_GetInitialData]',
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
    var buyer = new Buyer();
    buyer.Buyer_Name = this.Formgroup.value.Buying_House;
    buyer.Contact_Name = this.Formgroup.value.Contact_Name;
    buyer.Buyer_Address = this.Formgroup.value.Buying_House_Address;
    buyer.BuyerInfo = this.Formgroup.value.Buying_House_Info;
    buyer.City = this.Formgroup.value.City;
    buyer.Postal_Code = this.Formgroup.value.Postal_Code;
    buyer.Country_ID = this.Formgroup.value.Country_ID;
    buyer.Contact_Title = this.Formgroup.value.Contact_Title;
    buyer.Phone_No = this.Formgroup.value.Phone_No;
    buyer.FAX_No = this.Formgroup.value.FAX_No;
    buyer.Email = this.Formgroup.value.Email;
    buyer.Notes = this.Formgroup.value.Notes;
    buyer.Superior_ID = this.Formgroup.value.User_Id;
    buyer.IsAvailable = this.Formgroup.value.IsAvailable;
    buyer.Status = 'Unapproved';    
    buyer.Created_By = this.Formgroup.value.FreightCharge;
    buyer.Created_At = formatted;
    buyer.Created_By = userId == undefined ? '' : userId;

    var tableName = 'tbl_buyer';

    this.masterEntyService
      .SaveSingleData(buyer, tableName)
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

  GetBuyingHouseEditDataById() {
    console.log(this.BuyingHouseId);
    
    var ProcedureData = {
      procedureName: '[usp_BuyingHouse_ById]',
      parameters: {
        Id: this.BuyingHouseId,
      },
    };
    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        console.log(results);
        
        if (results.status) {
          var tableData = JSON.parse(results.data).Tables1;

          tableData.forEach((e: any) => {
            this.Formgroup.controls.Buying_House.setValue(e.Buyer_Name);
            this.Formgroup.controls.Contact_Name.setValue(e.Contact_Name);
            this.Formgroup.controls.Buying_House_Address.setValue(e.Buyer_Address);
            this.Formgroup.controls.Buying_House_Info.setValue(e.BuyerInfo);
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
      swal.fire('Invaild Input', 'Please check inputs', 'info');
      return;
    }
    var fDate = new Date();
    const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();

    const formatted = `${mm}/${dd}/${yyyy}`;

    var userId = window.localStorage.getItem('userId');
    var buyer = new Buyer();
    buyer.Buyer_Name = this.Formgroup.value.Company_Name;
    buyer.Contact_Name = this.Formgroup.value.Contact_Name;
    buyer.BuyerInfo = this.Formgroup.value.Company_Info;
    buyer.Buyer_Address = this.Formgroup.value.Customer_Address;
    buyer.City = this.Formgroup.value.City;
    buyer.Postal_Code = this.Formgroup.value.Postal_Code;
    buyer.Country_ID = this.Formgroup.value.Country_ID;
    buyer.Contact_Title = this.Formgroup.value.Contact_Title;
    buyer.Phone_No = this.Formgroup.value.Phone_No;
    buyer.FAX_No = this.Formgroup.value.FAX_No;
    buyer.Email = this.Formgroup.value.Email;
    buyer.Notes = this.Formgroup.value.Notes;    
    buyer.Superior_ID = this.Formgroup.value.User_Id;
    buyer.IsAvailable = this.Formgroup.value.IsAvailable;
    buyer.Status = 'Unapproved';    
    buyer.Created_By = this.Formgroup.value.FreightCharge;
    buyer.Created_At = formatted;
    buyer.Created_By = userId == undefined ? '' : userId;
    
    var tableName = 'tbl_buyer';


    let queryParams = buyer;
    let condition = {
      Id: this.BuyingHouseId,
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
              icon: 'info',
              timer: 5000,
            });
          }
        }
      });
  }
}
