// import { Component, OnInit, ViewChild } from '@angular/core';
// import { Router } from '@angular/router';
// import { Title } from '@angular/platform-browser';
// import { MatPaginator } from '@angular/material/paginator';
// import swal from 'sweetalert2';

// import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
// import { GlobalServiceService } from 'src/app/services/Global-service.service';
// import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
// import { JsonPipe } from '@angular/common';

// @Component({
//   selector: 'app-beneficiary-list',
//   templateUrl: './beneficiary-list.component.html',
//   styleUrls: ['./beneficiary-list.component.css']
// })
// export class BeneficiaryListComponent implements OnInit {

//   pageIndex: number = 1;
//   searchText: string = '';
//   length = 100;
//   pageSize = 10;
//   isPage = false;
//   pageSizeOptions: number[] = [];
//   menu: any;

//   insertPermissions: boolean = false;
//   updatePermissions: boolean = false;
//   deletePermissions: boolean = false;
//   printPermissions: boolean = false;

//   allPermissions: boolean = true;

//   displayedColumns: string[] = [
//     'Sl',
//     'CompanyName',
//     'BINNo',
//     'City',
//     'Country',
//     'ETIN',
//     'VATRegNo',
//     'PaymentType',
//     'Action',
//   ];

//   @ViewChild(MatPaginator) paginator!: MatPaginator;
//   rows: any[] = [];

//   constructor(
//     public service: MasterEntryService,
//     private gs: GlobalServiceService,
//     private router: Router,
//     private title: Title
//   ) { }

//   ngOnInit() {
//     this.menu = window.localStorage.getItem('UserMenuWithPermission');
//     this.menu = JSON.parse(this.menu);
//     var buttonPermissions: any = [];
//     let countFound = 0;

//     this.menu.forEach((e: any) => {
//       e.Children = JSON.parse(e.Children);
//       e.Children.forEach((childMenu: any) => {
//         if (childMenu.SubMenuName == "Beneficiaries") {
//           countFound++;
//           buttonPermissions = childMenu.ButtonName;

//           if (buttonPermissions[0].ButtonName == "Insert") {
//             this.insertPermissions = true;
//           }
//           else if (buttonPermissions[0].ButtonName == "Update") {
//             this.updatePermissions = true;
//           }
//           else if (buttonPermissions[0].ButtonName == "View") {
//             this.printPermissions = true;
//           }
//           else if (buttonPermissions[0].ButtonName == "Delete") {
//             this.deletePermissions = true;
//           }
//         }
//       });
//     });

//     // if (countFound == 0) {
//     //   window.location.href = 'dashboard';
//     // }

//     this.title.setTitle('Beneficiary List');
//     this.pageSizeOptions = this.gs.GetPageSizeOptions();

//     this.getBeneficiaries(
//       { offset: 0 },
//       this.pageIndex,
//       this.pageSize,
//       this.searchText
//     );
//   }

//   getBeneficiaries(
//     pageInfo: any,
//     pageIndex: number,
//     pageSize: number,
//     searchText: string
//   ) {
//     let param = new MasterEntryModel();
//     param.tableName = 'tbl_beneficiary_account';
//     param.columnNames = 'Beneficiary_Account_ID,CompanyName,BinNo,Address,City,Country_ID,ETIN,VATRegNo,IsAvailable,PaymentTypeId';
//     // param.whereParams = '{"Beneficiary_Account_ID":' + this.BeneficiaryId + '}';

//     param.queryParams = {
//       PageIndex: pageIndex,
//       PageSize: pageSize,
//       SearchText: searchText,
//     };
//     param.whereParams = {};

//     this.service.GetDataTable(param).subscribe({
//       next: (results) => {

//         console.log(results)
//         if (results.status) {

//           let tables = JSON.parse(results.data);

//           let mapTable = tables.map((i: any) => JSON.parse(i))
//           // console.log(mapTable, "--")
//           // console.log(tables)
//           // this.rows = mapTable[0].data
//           const rowsData = mapTable[0].data.map((row: any[]) => {
//             const obj: any = {};
//             Object.keys(mapTable[0].metadata).forEach((key) => {
//               const index = Number(key);
//               obj[mapTable[0].metadata[index]] = row[index];
//             });
//             return obj;
//           });
//           this.rows = rowsData;

//           // tables[0].data.map((row: any[]) => {
//           //   const obj: any = {};
//           //   Object.keys(tables[0].metadata).forEach((key) => {
//           //     const index = Number(key);
//           //     obj[tables[0].metadata[index]] = row[index];
//           //   });
//           //   return obj;
//           // });

//           // console.log(this.rows);
//           // // let mapTable= tables.map((item: any)=>JSON.parse(item))
//           // this.rows = tables.Table || tables.Tables1 || [];
//           this.isPage = this.rows[0]?.totallen > 10;
//           this.length = this.rows[0]?.totallen || 0;
//         } else if (results.message == 'Invalid Token') {
//           swal.fire('Session Expired!', 'Please Login Again.', 'info');
//           this.gs.Logout();
//         }
//       },
//       error: (err) => { },
//     });
//   }

//   paginatiorChange(e: any) {
//     this.pageIndex = e.pageIndex + 1;
//     this.pageSize = e.pageSize;
//     this.getBeneficiaries(e, e.pageIndex + 1, e.pageSize, this.searchText);
//   }

//   deleteBeneficiary(e: any) {
//     swal
//       .fire({
//         title: 'Wait!',
//         html: `<span>Once you delete, you won't be able to revert this!<br> <b>[${e.CompanyName}]</b></span>`,
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, delete it!',
//       })
//       .then((result) => {
//         if (result.isConfirmed == true) {
//           let param = new MasterEntryModel();
//           param.tableName = 'tbl_beneficiary_account';
//           param.whereParams = { Beneficiary_Account_ID: e.Beneficiary_Account_ID };

//           this.service.DeleteData(param).subscribe({
//             next: (results: any) => {
//               if (results.status) {
//                 swal
//                   .fire({
//                     title: `${results.message}!`,
//                     text: `Deleted Successfully!`,
//                     icon: 'success',
//                     timer: 3000,
//                   })
//                   .then(() => {
//                     this.getBeneficiaries(
//                       { offset: 0 },
//                       1,
//                       this.pageSize,
//                       this.searchText
//                     );
//                   });
//               } else if (results.message == 'Invalid Token') {
//                 swal.fire('Session Expired!', 'Please Login Again.', 'info');
//                 this.gs.Logout();
//               }
//             },
//             error: (err) => { },
//           });
//         }
//       });
//   }
// }
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatPaginator } from '@angular/material/paginator';
import swal from 'sweetalert2';

import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';

@Component({
  selector: 'app-beneficiary-list',
  templateUrl: './beneficiary-list.component.html',
  styleUrls: ['./beneficiary-list.component.css']
})
export class BeneficiaryListComponent implements OnInit {

  pageIndex: number = 1;
  searchText: string = '';
  length = 100;
  pageSize = 5;
  isPage = false;
  pageSizeOptions: number[] = [];
  menu: any;

  insertPermissions: boolean = true;
  updatePermissions: boolean = true;
  deletePermissions: boolean = true;
  printPermissions: boolean = true;

  allPermissions: boolean = true;

  displayedColumns: string[] = [
    'Sl',
    'Company Name',
    'BIN No',
    'City',
    'Country',
    'ETIN',
    'VATRegNo',
    'PaymentType',
    'Action',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  rows: any[] = [];

  constructor(
    public service: MasterEntryService,
    private gs: GlobalServiceService,
    private router: Router,
    private title: Title
  ) {}

  ngOnInit() {
    // check permissions from menu
    this.menu = window.localStorage.getItem('UserMenuWithPermission');
    this.menu = JSON.parse(this.menu);

    let countFound = 0;
    this.menu.forEach((e: any) => {
      e.Children = JSON.parse(e.Children);
      e.Children.forEach((childMenu: any) => {
        if (childMenu.SubMenuName == 'Beneficiary') {
          countFound++;
          const buttonPermissions = childMenu.ButtonName;

          buttonPermissions.forEach((btn: any) => {
            if (btn.ButtonName == 'Insert') this.insertPermissions = true;
            if (btn.ButtonName == 'Update') this.updatePermissions = true;
            if (btn.ButtonName == 'Delete') this.deletePermissions = true;
            if (btn.ButtonName == 'View') this.printPermissions = true;
          });
        }
      });
    });

    // if (countFound == 0) {
    //   window.location.href = 'dashboard';
    // }

    this.title.setTitle('Beneficiary List');
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
// console.log(this.pageIndex,this.pageSize,"--")
    this.getBeneficiaries(
      { offset: 0 },
      this.pageIndex,
      this.pageSize,
      this.searchText
    );
  }

  getBeneficiaries(
    pageInfo: any,
    pageIndex: number,
    pageSize: number,
    searchText: string
  ) {
    let param = new GetDataModel();
    param.procedureName = '[usp_GetBeneficiaryAccounts]'; 
    param.parameters = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SearchText: searchText,
    };

    this.service.GetInitialData(param).subscribe({
      next: (results) => {
        if (results.status) {
          let tables = JSON.parse(results.data);
          this.rows = tables.Tables1;
          console.log( tables.Tables1)
          this.isPage = this.rows[0]?.TotalLen > 10;
          this.length = this.rows[0]?.TotalLen || 0;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        }
      },
      error: (err) => {},
    });
  }


  paginatiorChange(e: any) {

    this.pageIndex = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getBeneficiaries(e, e.pageIndex + 1, e.pageSize, this.searchText);
  }

  deleteBeneficiary(e: any) {
    swal
      .fire({
        title: 'Wait!',
        html: `<span>Once you delete, you won't be able to revert this!<br> <b>[${e.CompanyName}]</b></span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      })
      .then((result) => {
        if (result.isConfirmed == true) {
          let param = new MasterEntryModel();
          param.tableName = 'tbl_beneficiary_account';
          param.queryParams = { CompanyName: e.CompanyName };
          param.whereParams = { Beneficiary_Account_ID: e.Beneficiary_Account_ID };

          this.service.DeleteData(param).subscribe({
            next: (results: any) => {
              if (results.status) {
                swal
                  .fire({
                    title: `${results.message}!`,
                    text: `Deleted Successfully!`,
                    icon: 'success',
                    timer: 3000,
                  })
                  .then(() => {
                    this.getBeneficiaries(
                      { offset: 0 },
                      1,
                      this.pageSize,
                      this.searchText
                    );
                  });
              } else if (results.message == 'Invalid Token') {
                swal.fire('Session Expired!', 'Please Login Again.', 'info');
                this.gs.Logout();
              }
            },
            error: (err) => {},
          });
        }
      });
  }
}
