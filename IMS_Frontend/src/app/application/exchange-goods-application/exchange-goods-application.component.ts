import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  FormArray,
  FormGroup,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import swal from 'sweetalert2';
import { DropdownModule } from 'primeng/dropdown';
import {
  CreateRmRequisitionItem,
  CreateRmRequisitionRequest,
} from 'src/app/models/requisition/rmRequisition';
import { startWith, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';

@Component({
  selector: 'app-exchange-goods-application',
  templateUrl: './exchange-goods-application.component.html',
  styleUrls: ['./exchange-goods-application.component.css']
})
export class ExchangeGoodsApplicationComponent {
Formgroup!: FormGroup;
  isEdit = false;
  exportDate: Date = new Date();
  private destroy$ = new Subject<void>();
  private unitByArticleId = new Map<number, number | null>();
  rollOrBagOptions = [
    { label: 'Rolls', value: 'roll' },
    { label: 'Bags', value: 'bag' },
  ];
  reloadingArticles = false;
  LoadingPortList: any[] = [];
  DestinationPortList: any[] = [];
  RawMaterialList: any[] = [];
  WidthList: any[] = [];
  ColorList: any[] = [];
  UnitList: any[] = [];
  Id: any = '';
  CustomerList: any[] = [];
  PIList: any[] = [];
  PIPreviewList: any[] = [];
  FormType: any[] = [
    {
      value: '0',
      text: '--Select Form Type--',
    },
    {
      value: 'PI Amendment Application',
      text: 'PI Amendment Application',
    },
    {
      value: 'Special Delivery Application',
      text: 'Special Delivery Application',
    },
    {
      value: 'Cancel PI Application',
      text: 'Cancel PI Application',
    },
    {
      value: 'Exchange Goods Application',
      text: 'Exchange Goods Application',
    },
  ];
  insertPermissions: boolean = false;
  updatePermissions: boolean = false;
  deletePermissions: boolean = false;
  printPermissions: boolean = false;

  constructor(
    private fb: FormBuilder,
    private doubleMasterEntryService: DoubleMasterEntryService,
    private getDataService: GetDataService,
    private gs: GlobalServiceService,
    private activeLink: ActivatedRoute,
    private title: Title,
    private masterEntryService: MasterEntryService
  ) {}

  ngOnInit(): void {
    var permissions = this.gs.CheckUserPermission(
      'Exchange Goods Application'
    );
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    this.title.setTitle('Exchange Goods Application');
    this.generateForm();
    this.loadPageData();

    let has = this.activeLink.snapshot.queryParamMap.has('Id');
    if (has) {
      this.Id = this.activeLink.snapshot.queryParams['Id'];
      this.isEdit = true;
      this.getEditData();
    } else {
      this.isEdit = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  generateForm() {
    this.Formgroup = this.fb.group({
      Date: ['', Validators.required],
      Customer: ['', Validators.required],
      PINo: ['', Validators.required],
      items: this.fb.array([]),
    });
  }

  loadPageData(): void {
    var userId = window.localStorage.getItem('userId');
    var ProcedureData = {
      procedureName: '[usp_Application_GetInitialData]',
      parameters: {
        userID: userId,
      },
    };

    this.getDataService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.CustomerList = JSON.parse(results.data).Tables1;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }

  get items(): FormArray {
    return this.Formgroup.get('items') as FormArray;
  }

  removeItem(i: number) {
    this.items.removeAt(i);
  }

  // totals (bind to UI + send to API)

  saveData(): void {
    console.log(this.Formgroup);

    if (this.Formgroup.invalid) {
      swal.fire(
        'Validation Error',
        'Please fill all required fields.',
        'warning'
      );
      return;
    }

    var userId = window.localStorage.getItem('userId');

    var fDate = new Date();
    const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();

    const formatted = `${mm}/${dd}/${yyyy}`;

    // 1) Form -> DTO (typed)
    const fv = this.Formgroup.value;

    var totalQty = 0;
    var totalDeliveredQuantity = 0;
    var totalAproveQty = 0;

    var SuperiorId = this.PIList.filter(
      (e: any) => e.value == this.Formgroup.value.PINo
    )[0].Superior_ID;

    const formArray = this.Formgroup.get('items') as FormArray;

    formArray.controls.forEach((group) => {
      const item = group.value;
      console.log(item);

      totalQty += Number(item.Quantity) || 0;
      totalDeliveredQuantity += Number(item.Delivered_Quantity) || 0;
      totalAproveQty += Number(item.ApprovedQty) || 0;
    });

    const masterRow = {
      FormTypeId: 'ExchangeGoods',
      TotalQuantity: totalQty,
      TotalDeliveredQuantity: totalDeliveredQuantity,
      TotalAppliedDelQty: totalAproveQty,
      Date: this.Formgroup.value.Date,
      SuperiorId: SuperiorId,
      UserId: userId,
      Status: 'Pending',
      FormTypeName: 'Exchange Goods Application',
      CreatedDate: new Date(
        new Date().toLocaleString('en', { timeZone: 'Asia/Dhaka' })
      ),
      PiNos: this.Formgroup.value.PINo,
    };

    console.log(fv.items);

    const detailRows = fv.items.map((i: any) => ({
      PiNo: i.PINo,
      ArticleNo: i.Article,
      CustomerId: fv.Customer,
      ApplyDeliveryQty: i.ApprovedQty,
      TblPiMasterId: i.PI_Master_ID,
      TblPiDetailId: i.PI_Detail_ID,
      TblPoFormMasterId: '',
      ActualArticleNo: i.ActualArticle,
      CreatedDate: new Date(
        new Date().toLocaleString('en', { timeZone: 'Asia/Dhaka' })
      ),
      CreatedById: userId,
      Colour: i.Color,
      Width: i.Width,
      Unit: i.Unit,
      Quantity: i.Quantity,
      UnitPrice: i.Unit_Price,
      UnitCommission: i.CommissionUnit,
      PaymentTerms: i.PaymentTerms,
      DeliveredQuantity: i.Delivered_Quantity,
    }));

    this.doubleMasterEntryService
      .SaveDataMasterDetails(
        detailRows, // fd (child rows)
        'tbl_po_form_detail', // tableName (child)
        masterRow, // fdMaster (master row)
        'tbl_po_form_master', // tableNameMaster (master)
        'Id', // columnNamePrimary (PK)
        'TblPoFormMasterId', // columnNameForign (FK in child)
        'Application', // serialType (your code uses it)
        'Application' // columnNameSerialNo (series name)
      )
      .subscribe({
        next: (res: any) => {
          console.log(res);

          if (res.messageType === 'Success' && res.status) {
            swal.fire(
              'Success',
              'Application generated successfully',
              'success'
            );
            // Optionally reset form / navigate
            this.Formgroup.reset({});
            this.items.clear();
          } else {
            swal.fire(
              'Application generated Failed',
              res?.message || 'Application generated failed.',
              'info'
            );
          }
        },
        error: () => {
          swal.fire('info', 'Could not save requisition', 'info');
        },
      });
  }

  UpdateData(): void {
    if (this.Formgroup.invalid) {
      swal.fire(
        'Validation Error',
        'Please fill all required fields.',
        'warning'
      );
      return;
    }

    var userId = window.localStorage.getItem('userId');

    var fDate = new Date();
    const mm = String(fDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(fDate.getDate()).padStart(2, '0');
    const yyyy = fDate.getFullYear();

    const formatted = `${mm}/${dd}/${yyyy}`;

    // 1) Form -> DTO (typed)
    const fv = this.Formgroup.value;

    var totalQty = 0;
    var totalDeliveredQuantity = 0;
    var totalAproveQty = 0;

    var SuperiorId = this.PIList.filter(
      (e: any) => e.value == this.Formgroup.value.PINo
    )[0].Superior_ID;

    const formArray = this.Formgroup.get('items') as FormArray;

    formArray.controls.forEach((group) => {
      const item = group.value;
      console.log(item);

      totalQty += Number(item.Quantity) || 0;
      totalDeliveredQuantity += Number(item.Delivered_Quantity) || 0;
      totalAproveQty += Number(item.ApprovedQty) || 0;
    });

    const masterRow = {
      FormTypeId: 'ExchangeGoods',
      TotalQuantity: totalQty,
      TotalDeliveredQuantity: totalDeliveredQuantity,
      TotalAppliedDelQty: totalAproveQty,
      Date: this.Formgroup.value.Date,
      SuperiorId: SuperiorId,
      UserId: userId,
      Status: 'Pending',
      FormTypeName: 'Exchange Goods Application',
      CreatedDate: new Date(
        new Date().toLocaleString('en', { timeZone: 'Asia/Dhaka' })
      ),
      PiNos: this.Formgroup.value.PINo,
    };

    console.log(fv.items);

    const detailRows = fv.items.map((i: any) => ({
      PiNo: i.PINo,
      ArticleNo: i.Article,
      CustomerId: fv.Customer,
      ApplyDeliveryQty: i.ApprovedQty,
      TblPiMasterId: i.PI_Master_ID,
      TblPiDetailId: i.PI_Detail_ID,
      TblPoFormMasterId: this.Id,
      ActualArticleNo: i.ActualArticle,
      CreatedDate: new Date(
        new Date().toLocaleString('en', { timeZone: 'Asia/Dhaka' })
      ),
      CreatedById: userId,
      Colour: i.Color,
      Width: i.Width,
      Unit: i.Unit,
      Quantity: i.Quantity,
      UnitPrice: i.Unit_Price,
      UnitCommission: i.CommissionUnit,
      PaymentTerms: i.PaymentTerms,
      DeliveredQuantity: i.Delivered_Quantity,
    }));
    var whereParam = {
      Id: this.Id,
    };

    this.doubleMasterEntryService
      .UpdateDataMasterDetails(
        detailRows, // fd (child rows)
        'tbl_po_form_detail', // tableName (child)
        masterRow, // fdMaster (master row)
        'tbl_po_form_master', // tableNameMaster (master)
        'Id', // columnNamePrimary (PK)
        'TblPoFormMasterId', // columnNameForign (FK in child)
        'Application', // serialType (your code uses it)
        'Application', // columnNameSerialNo (series name)
        whereParam
      )
      .subscribe({
        next: (res: any) => {
          if (res.messageType === 'Success' && res.status) {
            swal.fire('Success', 'Application Update successfully', 'success');
          } else {
            swal.fire('info', 'Could not save Application', 'info');
          }
        },
        error: () => {
          swal.fire('info', 'Could not save Application', 'info');
        },
      });
  }

  getCustomerList() {
    var userId = window.localStorage.getItem('userId');
    var procedureName = 'usp_Application_PINo_ByCustomer';
    var ProcedureData = {
      procedureName: procedureName,
      parameters: {
        CustomerId: this.Formgroup.value.Customer,
      },
    };

    this.masterEntryService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.PIList = JSON.parse(results.data).Tables1;
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }

  getPIDetails() {
    var userId = window.localStorage.getItem('userId');
    var PINo = this.Formgroup.value.PINo;

    this.PIPreviewList.forEach((e: any) => {
      if (e.PINo == PINo) {
        swal.fire('info', 'this pi data already contain in the list', 'info');
        return;
      }
    });

    var procedureName = 'usp_Application_GetPIInfo';
    var ProcedureData = {
      procedureName: procedureName,
      parameters: {
        PIId: PINo,
      },
    };

    this.masterEntryService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        console.log(results);
        if (results.status) {
          const formArray = this.Formgroup.get('items') as FormArray;
          formArray.clear();
          JSON.parse(results.data).Tables1.forEach((item: any) => {
            formArray.push(
              this.fb.group({
                customer_name: [item.customer_name],
                PINo: [item.PINo],
                PIMasterId: [item.PINo],
                PIDetailsId: [item.PINo],
                Article: [item.Article],
                ActualArticle: [item.ActualArticle],
                Color: [item.Color],
                Width: [item.Width],
                Unit: [item.Unit],
                Quantity: [item.Quantity],
                Unit_Price: [item.Unit_Price],
                CommissionUnit: [item.CommissionUnit],
                PaymentTerms: [item.PaymentTerms],
                Delivered_Quantity: [item.Delivered_Quantity],
                ApprovedQty: [null, [Validators.required, Validators.min(1)]],
                Remarks: [''],
                PI_Detail_ID: [item.PI_Detail_ID],
                PI_Master_ID: [item.PI_Master_ID],
              })
            );
          });
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }

  approveQtyChange(item: any) {
    if (item.value.Quantity < item.value.ApprovedQty) {
      console.log(item);
      item.value.ApprovedQty = 0;
      swal.fire('info', 'Approve Qty can not be greater then Pi Qty', 'info');
    }
  }

  getEditData() {
    var userId = window.localStorage.getItem('userId');

    var procedureName = 'usp_Application_GetDataById';
    var ProcedureData = {
      procedureName: procedureName,
      parameters: {
        Id: this.Id,
      },
    };

    this.masterEntryService.GetInitialData(ProcedureData).subscribe({
      next: (results) => {
        console.log(JSON.parse(results.data).Tables1);
        if (results.status) {
          const formArray = this.Formgroup.get('items') as FormArray;
          formArray.clear();
          const input = JSON.parse(results.data).Tables1[0].Date;
          const formatted = new Date(input).toISOString();
          console.log(formatted);

          this.Formgroup.controls['Date'].setValue(
            this.toYMD(JSON.parse(results.data).Tables1[0].Date)
          );
          this.Formgroup.controls['Customer'].setValue(
            JSON.parse(results.data).Tables1[0].Customer_ID
          );
          this.getCustomerList();
          this.Formgroup.controls['PINo'].setValue(
            JSON.parse(results.data).Tables1[0].TblPiMasterId
          );
          JSON.parse(results.data).Tables1.forEach((item: any) => {
            formArray.push(
              this.fb.group({
                customer_name: [item.customer_name],
                PINo: [item.PiNo],
                PI_Master_ID: item.TblPiMasterId,
                PI_Detail_ID: item.TblPiDetailId,
                Article: [item.ArticleNo],
                ActualArticle: [item.ActualArticleNo],
                Color: [item.Colour],
                Width: [item.Width],
                Unit: [item.Unit],
                Quantity: [item.Quantity],
                Unit_Price: [item.UnitPrice],
                CommissionUnit: [item.UnitCommission],
                PaymentTerms: [item.PaymentTerms],
                Delivered_Quantity: [item.DeliveredQuantity],
                Remarks: [''],
                ApprovedQty: [
                  item.ApplyDeliveryQty,
                  [Validators.required, Validators.min(1)],
                ],
              })
            );
          });
        } else if (results.msg == 'Invalid Token') {
          swal.fire('Session Expierd!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
        }
      },
      error: (err) => {},
    });
  }

  private toYMD(d: any): string {
    if (!d) return '';
    const dt = new Date(d);
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${dt.getFullYear()}-${m}-${day}`;
  }
}
