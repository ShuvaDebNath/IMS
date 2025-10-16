import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import swal from 'sweetalert2';
import { Page } from 'src/app/models/Page';
import { GlobalClass } from 'src/app/shared/global-class';
//Material Datatable
import { MatPaginator } from '@angular/material/paginator';
import { PagesComponent } from 'src/app/pages/pages.component';
import { Title } from '@angular/platform-browser';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { DoubleMasterEntryModel } from 'src/app/models/DoubleMasterEntryModel';
import { CG } from 'src/app/models/cg';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';

@Component({
  selector: 'app-pending-rm-import-list',
  templateUrl: './pending-rm-import-list.component.html',
  styleUrls: ['./pending-rm-import-list.component.css'],
})
export class PendingRmImportListComponent {
  pageIndex = 1;
  searchText = '';
  length = 100;
  pageSize = 10;
  tableData!: CG[];
  SelectedExportMasterId = '0';
  pageSizeOptions: number[] = [];
  displayedColumns: string[] = [
    'Sl',
    'Date',
    'Voucher Type',
    'Voucher No',
    'Debit',
    'Credit',
    'Prepared By',
    'Approved By',
    'Status',
    'Action',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  isEdit: any;
  page = new Page();
  rows: any;
  SearchForm!: FormGroup;
  fromDate: any;
  toDate: any;
  LCNo: string = '';
  CR_Id: any;
  tableVisible: boolean = false;
  detailsTableData: any;
  totalQty: any = 0;

  showPaginator = false;
  insertPermissions: boolean = true;
  updatePermissions: boolean = true;
  deletePermissions: boolean = true;
  printPermissions: boolean = true;
  allPersmissions: boolean = true;
  getDataModel: GetDataModel = new GetDataModel();
  detailsData: any;
  isDetailsVisible: boolean = false;
  isReceiveInfoVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private gs: GlobalServiceService,
    private pagesComponent: PagesComponent,
    private masterEntryService: MasterEntryService,
    private activeLink: ActivatedRoute,
    private title: Title,
    private doubleMasterEntryService: DoubleMasterEntryService
  ) {}
  ngOnInit(): void {
    var permissions = this.gs.CheckUserPermission('Pending RM Import List');

    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }

    this.initForm();
    this.pageSizeOptions = this.gs.GetPageSizeOptions();
    this.title.setTitle('Pending RM Import List');

    //this.Search();
  }
  initForm(): void {
    this.SearchForm = this.fb.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
    });
  }
  Search() {
    var fromDate = this.SearchForm.value.fromDate;
    var toDate = this.SearchForm.value.toDate;

    let param = new GetDataModel();
    param.procedureName = '[usp_ExportRM_ReceivePending_List]';
    param.parameters = {
      FromDate: fromDate,
      ToDate: toDate,
      PageIndex: this.pageIndex,
      PageSize: this.pageSize,
    };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        if (results.status) {
          this.tableData = [];
          this.tableVisible = true;
          let tables = JSON.parse(results.data);
          this.tableData = tables.Tables1;
          //  this.isPage=this.rows[0].totallen>10;
        }
      },
    });
  }

  paginatiorChange(e: any) {
    this.pageIndex = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.Search();
  }

  viewDetails(table: any) {
    this.isDetailsVisible = true;
    let param = new GetDataModel();
    param.procedureName = '[usp_ExportRM_Details]';
    param.parameters = {
      ExportMasterID: table.ExportMasterID,
    };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        if (results.status) {
          let tables = JSON.parse(results.data);

          this.detailsData = tables.Tables1[0];
          this.detailsTableData = tables.Tables2;

          this.detailsTableData.forEach((e: any) => {
            this.totalQty += e.Quantity;
          });
        }
      },
    });
  }

  ReceiveExport(table: any) {
    this.isReceiveInfoVisible = true;

    this.SelectedExportMasterId = table.ExportMasterID;
    let param = new GetDataModel();
    param.procedureName = '[usp_ExportRM_Details_ForReceive]';
    param.parameters = {
      ExportMasterID: table.ExportMasterID,
    };

    this.masterEntryService.GetInitialData(param).subscribe({
      next: (results) => {
        if (results.status) {
          let tables = JSON.parse(results.data);

          this.detailsData = tables.Tables1[0];
          this.detailsTableData = tables.Tables2;

          this.detailsTableData.forEach((e: any) => {
            e.AccptQuantity = e.AcceptedQuantity;
            e.AccptRoll = e.AcceptedRollBag_Qty;
            e.Note = '';

            this.totalQty += e.Quantity;
          });
        }
      },
    });
  }

  receiveItem(table: any[]) {

    // Validate first; if any row is invalid, show alert and stop
    const hasInvalid = table.some(
      (e: any) => e.AccptQuantity == 0 || e.AccptRoll == 0
    );
    var status = 'Received'
    if (hasInvalid) {
      status = 'Partially Received'
    }

    const sentByStr = localStorage.getItem('userId') ?? '';

    const fDate = new Date();
    const mm = String(fDate.getMonth() + 1).padStart(2, '0');
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();
    const formatted = `${mm}/${dd}/${yyyy}`;

    const masterRow = {
      Received_By: sentByStr,
      Received_Date: formatted,
      Status: status,
    };

    // Build details array (map returns a new array; don't use forEach here)
    var detailsData: any[] = [];
    table.forEach((i: any) => {
      var signleArr = {
        AcceptedQuantity: i.AccptQuantity,
        AcceptedRollBag_Qty: i.AccptRoll,
        RawMaterial_ID: i.RawMaterial_ID,
        Article_No: i.RawMaterial_ID,
        Description: i.Description,
        Color_ID: i.Color_ID,
        Width_ID: i.Width_ID,
        Roll_Bag: i.Roll_Bag === 'roll' ? 'roll' : 'bag',
        Unit: i.Unit_ID,
        Weight: i.Weight,
        Gross_Weight: i.Gross_Weight,
        RollBag_Quantity: i.RollBag_Quantity,
        Unit_ID: i.Unit_ID ?? null,
        Received_By:sentByStr,
        Received_Date:formatted,
        ExportDetailsID:i.ExportDetailsID,
        ExportMasterID: null, // keep as your original unless backend expects the selected ID here
      };
      detailsData.push(signleArr);
    });
    console.log(detailsData);

    const whereParam = {
      ExportMasterID: this.SelectedExportMasterId,
    };

    this.doubleMasterEntryService
      .UpdateDataMasterDetails(
        detailsData, // child rows
        'tbl_export_details', // child table
        masterRow, // master row
        'tbl_export_master', // master table
        'ExportMasterID', // PK column in master
        'ExportMasterID', // FK column in child
        'Export', // serialType
        'Export', // columnNameSerialNo
        whereParam
      )
      .subscribe({
        next: (res: any) => {
          if (res.messageType === 'Success' && res.status) {
            this.Search();
            this.isReceiveInfoVisible = false;
            swal.fire('Success', 'Received successfully', 'success');
          } else {
            swal.fire(
              'Error',
              res?.message || 'Could not save requisition',
              'error'
            );
          }
        },
        error: () => {
          swal.fire('Error', 'Could not save requisition', 'error');
        },
      });
  }

  CheckAccptQty(e: any, item: any) {
    console.log(e, item);
    item.AccptQuantity = e.target.value;
    if (item.AccptQuantity > item.Quantity) {
      swal.fire({
        title: 'error',
        text: 'Receive Quantity can not be greater then export quantity!!',
        icon: 'error',
        customClass: {
          popup: 'swal-on-top-of-primeng',
        },
      });
      item.AccptQuantity = item.Quantity;
    }
  }

  CheckRollBagQty(e: any, item: any) {
    item.AccptRoll = e.target.value;
    if (item.AccptRoll > item.RollBag_Quantity) {
      swal.fire(
        'error',
        'Receive Roll/Bag Quantity can not be greater then export Roll/Bag quantity',
        'error'
      );
      item.AccptRoll = item.RollBag_Quantity;
    }
  }
}
