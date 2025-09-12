import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LC } from 'src/app/models/LCModel';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { Roles } from 'src/app/models/roles.model';
import { SC } from 'src/app/models/SalesContract';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-generate-sales-contract',
  templateUrl: './generate-sales-contract.component.html',
  styleUrls: ['./generate-sales-contract.component.css']
})
export class GenerateSalesContractComponent {
  Formgroup!: FormGroup;
  isEdit = false;
  SCId!: string;
  companyId!: string;
  menu: any;
  MarketingConcern: any;
  BenificiaryAccounts: any;
  PaymentTerms: any;
  PINo: any;

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
    let has = this.activeLink.snapshot.queryParamMap.has('SC_Id');
    if (has) {
      this.SCId = this.activeLink.snapshot.queryParams['SC_Id'];
      this.isEdit = true;
    } else {
      this.isEdit = false;
    }
  }

  ngOnInit() {
    var permissions = this.gs.CheckUserPermission("Generate Sales Contract");
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    if (!this.insertPermissions) {
      window.location.href = 'all-sales-contract';
    }
    if (!this.updatePermissions && this.isEdit) {
      window.location.href = 'all-sales-contract';
    }

    this.title.setTitle('Generate Sales Contract');
    this.GenerateFrom();
    this.getInitialData();


  }

  GenerateFrom() {
    this.Formgroup = this.fb.group({
      Marketing_Concern: ['', [Validators.required]],
      PINo: [[], [Validators.required]],
    });
  }

  getInitialData() {
    var ProcedureData = {
      procedureName: '[usp_SC_GetInitialData]',
      parameters: {},
    };

    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.MarketingConcern = JSON.parse(results.data).Tables1;
          if (this.isEdit) {
            this.GetSCyId();
          }
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => { },
    });
  }

  getPINoByMarketingConcern() {
    var procedureName = 'usp_SC_PINo_ByMarketingConcern'
    var ProcedureData = {
      procedureName: procedureName,
      parameters: {
        UserID: this.Formgroup.value.Marketing_Concern,
      },
    };

    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.PINo = JSON.parse(results.data).Tables1;

        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => { },
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

    var filterSuperior = this.MarketingConcern.filter(
      (e: any) => e.User_ID == this.Formgroup.value.Marketing_Concern
    );


    var userId = window.localStorage.getItem('userId');
    var fDate = new Date();
    const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();

    const formatted = `${mm}/${dd}/${yyyy}`;


    var fDateAfterTwoMonth = new Date();
    const mmAfterTwoMonth = String(fDateAfterTwoMonth.getMonth() + 3).padStart(2, '0'); // Months are 0-based
    const ddAfterTwoMonth = String(fDateAfterTwoMonth.getDate()).padStart(2, '0');
    const yyyyAfterTwoMonth = fDate.getFullYear();

    const formattedAfterTwoMonth = `${mm}/${dd}/${yyyy}`;

    const selectedValues: number[] = this.Formgroup.value.PINo || [];
    const selectedLabels = this.PINo
      .filter((c: any) => selectedValues.includes(c.value))
      .map((c: any) => c.label);
    //Id, SalesContractNo, Superior_ID, CreatedById, CreatedDate, PIs, FirstPIId, ModifiedById, ModifiedDate, ExpiryDate
    var sc = new SC();
    sc.Superior_ID = filterSuperior[0].Superior_ID;
    sc.CreatedById = parseInt(userId!);
    sc.CreatedDate = formatted;
    sc.PIs = selectedLabels.join(',');
    sc.FirstPIId = this.Formgroup.value.PINo[0];
    sc.ExpiryDate = formattedAfterTwoMonth;

    this.masterEntyService
      .SaveSingleData(
        sc,
        'tbl_sales_contract'
      )
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
              window.location.href = 'sales-contract-details';
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

  GetSCyId() {
    var ProcedureData = {
      procedureName: '[usp_SC_ById]',
      parameters: {
        SCId: this.SCId,
      },
    };
    this.masterEntyService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.PINo = JSON.parse(results.data).Tables1;

          var tableData = JSON.parse(results.data).Tables2;

          tableData.forEach((e: any) => {

            var filterSuperior = this.MarketingConcern.filter(
              (e: any) => e.Superior_ID == e.Superior_ID
            );


            this.Formgroup.controls.Marketing_Concern.setValue(filterSuperior[0].User_ID);
            this.getPINoByMarketingConcern();
            //
            var piArr = e.PIs.split(',');
            const piArrInt = piArr.map(Number);

            const preselectedLabels = e.PIs.split(',').map((l: any) => l.trim());
            const preselectedValues = this.PINo
              .filter((c: any) => preselectedLabels.includes(c.label))
              .map((c: any) => c.value);
            this.Formgroup.controls.PINo.setValue(
              preselectedValues
            );
          });
        } else if (results.message == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => { },
    });
  }


  updateData() {
    if (this.Formgroup.invalid) {
      swal.fire('Invaild Input', 'Please check inputs', 'error');
      return;
    }
    var filterSuperior = this.MarketingConcern.filter(
      (e: any) => e.User_ID == this.Formgroup.value.Marketing_Concern
    );


    var userId = window.localStorage.getItem('userId');
    var fDate = new Date();
    const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();

    const formatted = `${mm}/${dd}/${yyyy}`;


    var fDateAfterTwoMonth = new Date();
    const mmAfterTwoMonth = String(fDateAfterTwoMonth.getMonth() + 3).padStart(2, '0'); // Months are 0-based
    const ddAfterTwoMonth = String(fDateAfterTwoMonth.getDate()).padStart(2, '0');
    const yyyyAfterTwoMonth = fDate.getFullYear();

    const formattedAfterTwoMonth = `${mm}/${dd}/${yyyy}`;

    const selectedValues: number[] = this.Formgroup.value.PINo || [];
    const selectedLabels = this.PINo
      .filter((c: any) => selectedValues.includes(c.value))
      .map((c: any) => c.label);
    //Id, SalesContractNo, Superior_ID, CreatedById, CreatedDate, PIs, FirstPIId, ModifiedById, ModifiedDate, ExpiryDate
    var sc = new SC();
    sc.Superior_ID = filterSuperior[0].Superior_ID;
    sc.ModifiedById = parseInt(userId!);
    sc.ModifiedDate = formatted;
    sc.PIs = selectedLabels.join(',');
    sc.FirstPIId = this.Formgroup.value.PINo[0];


    let queryParams = sc
    let condition = {
      Id: this.SCId
    }
    let tableName = 'tbl_sales_contract';

    this.masterEntyService.UpdateData(queryParams, condition, tableName).subscribe((res: any) => {
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
            window.location.href = 'sales-contract-details';
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
