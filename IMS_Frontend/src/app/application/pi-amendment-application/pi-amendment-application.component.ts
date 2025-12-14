// Create Page Component
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
  selector: 'app-pi-amendment-application',
  templateUrl: './pi-amendment-application.component.html',
  styleUrls: ['./pi-amendment-application.component.css'],
})
export class PiAmendmentApplicationComponent {
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
  ShipperList: any | [];
  BenificaryBankList: any | [];
  CountryList: any | [];
  PackingList: any | [];
  LoadingModeList: any | [];
  PaymentModeList: any | [];
  ConsigneeList: any | [];
  ApplicantBankList: any | [];
  BuyingHouseList: any | [];
  TermsofDeliveryList: any | [];
  DescriptionList: any | [];
  WidthList: any | [];
  ColorList: any | [];
  PackagingList: any | [];
  UnitList: any | [];
  AAList: any | [];
  DeliveryConditionList: any | [];
  PartialShipmentList: any | [];
  PriceTermsList: any | [];
  ForceMajeureList: any | [];
  ArbitrationList: any | [];
  Id: any = '';
  CustomerList: any[] = [];
  PIList: any[] = [];
  PIPreviewList: any[] = [];
  ReviseDetails: any[] = [];
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
    var permissions = this.gs.CheckUserPermission('PI Amendment Application');
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;

    this.title.setTitle('PI Amendment Application');
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
    const today = new Date().toISOString().split('T')[0];
    this.Formgroup = this.fb.group({
      Date: [today, Validators.required],
      Customer: ['', Validators.required],
      PINo: ['', Validators.required],
      items: this.fb.array([]),
      itemsRevise: this.fb.array([]),
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
          var DataSet = JSON.parse(results.data);
          this.CustomerList = JSON.parse(results.data).Tables1;
          this.AAList = DataSet.Tables2;
          this.ColorList = DataSet.Tables3;
          this.WidthList = DataSet.Tables4;
          this.UnitList = DataSet.Tables5;
          this.PaymentModeList = DataSet.Tables6;
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

  get itemsRevise(): FormArray {
    return this.Formgroup.get('itemsRevise') as FormArray;
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
    });

    const masterRow = {
      FormTypeId: 'PIAmendment',
      TotalQuantity: totalQty,
      TotalDeliveredQuantity: totalDeliveredQuantity,
      TotalAppliedDelQty: totalAproveQty,
      Date: this.Formgroup.value.Date,
      SuperiorId: SuperiorId,
      UserId: userId,
      Status: 'Pending',
      FormTypeName: 'PI Amendment Application',
      CreatedDate: new Date(
        new Date().toLocaleString('en', { timeZone: 'Asia/Dhaka' })
      ),
      PiNos: this.Formgroup.value.PINo,
    };

    console.log(fv.itemsRevise);

    const detailRows = fv.itemsRevise.map((i: any) => ({
      PiNo: i.PINo,
      ArticleNo: i.Article,
      CustomerId: fv.Customer,
      TblPiMasterId: i.PI_Master_ID,
      TblPiDetailId: i.PI_Detail_ID,
      TblPoFormMasterId: '',
      ActualArticleNo: i.Item_ID,
      CreatedDate: new Date(
        new Date().toLocaleString('en', { timeZone: 'Asia/Dhaka' })
      ),
      CreatedById: userId,
      Colour: i.Color_ID,
      Width: i.Width_ID,
      Unit: i.Unit_ID,
      Quantity: i.Quantity,
      UnitPrice: i.Unit_Price,
      UnitCommission: i.CommissionUnit,
      PaymentTerms: i.PaymentTerms,
      DeliveredQuantity: i.Delivered_Quantity,
      ApplyDeliveryQty: 0,
    }));

    this.doubleMasterEntryService
      .SaveDataMasterDetailsGetId(
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
          console.log(res);
          //Id, CustomerName, PiNo, PiArticle, ActualArticle, Colour, Width, Unit, Quantity, UnitPrice, CMS, PaymentTerms, Note, TblPoFormMasterId, CreatedDate, CreatedById, UpdatedDate, UpdatedById

          const detailRows = fv.itemsRevise.map((i: any) => ({
            CustomerName: fv.customer_name,
            PiNo: i.PINo,
            PiArticle: i.Article,
            ActualArticle: i.Item_ID,
            TblPoFormMasterId: res,
            CreatedDate: new Date(
              new Date().toLocaleString('en', { timeZone: 'Asia/Dhaka' })
            ),
            CreatedById: userId,
            Colour: i.Color_ID,
            Width: i.Width_ID,
            Unit: i.Unit_ID,
            Quantity: i.Quantity,
            UnitPrice: i.Unit_Price,
            CMS: i.CommissionUnit,
            PaymentTerms: i.PaymentTerms,
            Note: i.Remarks,
          }));
          this.doubleMasterEntryService
            .SaveData(detailRows, 'tbl_po_form_pi_revise_detail')
            .subscribe({
              next: (res) => {
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
                    'Application generation Failed',
                    res?.message || 'Application generation failed.',
                    'info'
                  );
                }
              },
              error: (err) => {
                console.error(err);
                swal.fire(
                  'Application generation Failed',
                  err?.error?.message || 'Application generation failed.',
                  'info'
                );
              },
            });

          // if (res.messageType === 'Success' && res.status) {
          //   swal.fire(
          //     'Success',
          //     'Application generated successfully',
          //     'success'
          //   );
          //   // Optionally reset form / navigate
          //   this.Formgroup.reset({});
          //   this.items.clear();
          // } else {
          //   swal.fire(
          //     'Application generated Failed',
          //     res?.message || 'Application generated failed.',
          //     'info'
          //   );
          // }
        },
        error: () => {
          swal.fire('info', 'Could not save requisition', 'info');
        },
      });
  }

  UpdateData(): void {
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
    });

    const masterRow = {
      FormTypeId: 'PIAmendment',
      TotalQuantity: totalQty,
      TotalDeliveredQuantity: totalDeliveredQuantity,
      TotalAppliedDelQty: totalAproveQty,
      Date: this.Formgroup.value.Date,
      SuperiorId: SuperiorId,
      UserId: userId,
      Status: 'Pending',
      FormTypeName: 'PI Amendment Application',
      UpdatedDate: new Date(
        new Date().toLocaleString('en', { timeZone: 'Asia/Dhaka' })
      ),
      PiNos: this.Formgroup.value.PINo,
    };

    console.log(fv.itemsRevise);

    const detailRows = fv.itemsRevise.map((i: any) => ({
      PiNo: i.PINo,
      ArticleNo: i.Article,
      CustomerId: fv.Customer,
      TblPiMasterId: i.PI_Master_ID,
      TblPiDetailId: i.PI_Detail_ID,
      TblPoFormMasterId: '',
      ActualArticleNo: i.Item_ID,
      UpdatedDate: new Date(
        new Date().toLocaleString('en', { timeZone: 'Asia/Dhaka' })
      ),
      UpdatedById: userId,
      Colour: i.Color_ID,
      Width: i.Width_ID,
      Unit: i.Unit_ID,
      Quantity: i.Quantity,
      UnitPrice: i.Unit_Price,
      UnitCommission: i.CommissionUnit,
      PaymentTerms: i.PaymentTerms,
      DeliveredQuantity: i.Delivered_Quantity,
      ApplyDeliveryQty: 0,
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
          fv.itemsRevise.map((e: any) => {
            const detailRows = {
              CustomerName: fv.customer_name,
              PiNo: e.PINo,
              PiArticle: e.Article,
              ActualArticle: e.Item_ID,
              TblPoFormMasterId: this.Id,
              UpdatedDate: new Date(
                new Date().toLocaleString('en', { timeZone: 'Asia/Dhaka' })
              ),
              UpdatedById: userId,
              Colour: e.Color_ID,
              Width: e.Width_ID,
              Unit: e.Unit_ID,
              Quantity: e.Quantity,
              UnitPrice: e.Unit_Price,
              CMS: e.CommissionUnit,
              PaymentTerms: e.PaymentTerms,
              Note: e.Remarks,
            };
            console.log(e.ReviseID);
            
            if (e.ReviseID == '' || e.ReviseID == null) {
              this.masterEntryService
                .SaveSingleData(detailRows, 'tbl_po_form_pi_revise_detail')
                .subscribe({
                  next: (res) => {
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
                        'Application generation Failed',
                        res?.message || 'Application generation failed.',
                        'info'
                      );
                    }
                  },
                  error: (err) => {
                    console.error(err);
                    swal.fire(
                      'Application generation Failed',
                      err?.error?.message || 'Application generation failed.',
                      'info'
                    );
                  },
                });
            } else {
              var whereParamPIINDiv = {
                Id: e.ReviseID,
              };
              console.log(whereParamPIINDiv);

              this.masterEntryService
                .UpdateData(
                  detailRows,
                  whereParamPIINDiv,
                  'tbl_po_form_pi_revise_detail'
                )
                .subscribe({
                  next: (res) => {
                    console.log(res);

                    if (res.messageType === 'Success' && res.status) {
                      swal.fire(
                        'Success',
                        'Application Update successfully',
                        'success'
                      );
                    } else {
                      swal.fire(
                        'Application Update Failed',
                        res?.message || 'Stock update failed.',
                        'info'
                      );
                    }
                  },
                  error: (err) => {
                    console.error(err);
                    swal.fire(
                      'Application Update Failed',
                      err?.error?.message || 'Application update failed.',
                      'info'
                    );
                  },
                });
            }
          });
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
                ActualArticleId: [item.Item_ID],
                Color: [item.Color],
                ColorId: [item.Color_ID],
                Width: [item.Width],
                WidthId: [item.Width_ID],
                Unit: [item.Unit],
                UnitId: [item.Unit_ID],
                Quantity: [item.Quantity],
                Unit_Price: [item.Unit_Price],
                CommissionUnit: [item.CommissionUnit],
                PaymentTerms: [item.PaymentTerms],
                PaymentTermsId: [item.Payment_Term_ID],
                Delivered_Quantity: [item.Delivered_Quantity],
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
        if (results.status) {
          const formArray = this.Formgroup.get('items') as FormArray;
          const formArrayRevise = this.Formgroup.get(
            'itemsRevise'
          ) as FormArray;
          formArray.clear();
          formArrayRevise.clear();
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
            JSON.parse(results.data).Tables1[0].PI_Master_ID
          );
          JSON.parse(results.data).Tables1.forEach((item: any) => {
            formArray.push(
              this.fb.group({
                customer_name: [item.customer_name],
                PINo: [item.PINo],
                PIMasterId: [item.PINo],
                PIDetailsId: [item.PINo],
                Article: [item.Article],
                ActualArticle: [item.ActualArticle],
                ActualArticleId: [item.Item_ID],
                Color: [item.Color],
                ColorId: [item.Color_ID],
                Width: [item.Width],
                WidthId: [item.Width_ID],
                Unit: [item.Unit],
                UnitId: [item.Unit_ID],
                Quantity: [item.Quantity],
                Unit_Price: [item.Unit_Price],
                CommissionUnit: [item.CommissionUnit],
                PaymentTerms: [item.PaymentTerms],
                PaymentTermsId: [item.Payment_Term_ID],
                Delivered_Quantity: [item.Delivered_Quantity],
                Remarks: [''],
                PI_Detail_ID: [item.PI_Detail_ID],
                PI_Master_ID: [item.PI_Master_ID],
              })
            );
          });

          JSON.parse(results.data).Tables2.forEach((item: any) => {
            console.log(item);

            const grp = this.buildReviseGroup({
              customer_name: item.customer_name,
              PINo: item.PINo,
              Article: item.ArticleNo,
              Item_ID: item.ActualArticleNo,
              ArticleNo: item.ActualArticleNo,
              Color_ID: item.Colour,
              Width_ID: item.Width,
              Unit_ID: item.Unit,
              Quantity: item.Quantity,
              Unit_Price: item.Unit_Price,
              CommissionUnit: item.CommissionUnit,
              Delivered_Quantity: item.Delivered_Quantity,
              PI_Detail_ID: item.PI_Detail_ID,
              PI_Master_ID: item.PI_Master_ID,
              TblPiMasterId: item.PI_Master_ID,
              TblPiDetailId: item.PI_Detail_ID,
              PaymentTerms: item.PaymentTerms,
              ReviseID: item.ReviseID,
            });

            this.itemsRevise.push(grp);

            this.ReviseDetails.push({
              customer_name: item.customer_name || '',
              PINo: item.PINo || '',
              Article: item.ArticleNo || '',
              ArticleNo: item.ActualArticleNo,
              Item_ID: item.ActualArticleNo || '',
              Color_ID: item.Colour || '',
              Width: item.Width || '',
              Unit: item.Unit || '',
              Quantity: item.Quantity || 0,
              Unit_Price: item.Unit_Price || 0,
              CommissionUnit: item.CommissionUnit || '',
              PaymentTerms: item.PaymentTerms || '',
              Delivered_Quantity: item.Delivered_Quantity || 0,
              PI_Detail_ID: item.PI_Detail_ID || null,
              PI_Master_ID: item.PI_Master_ID || null,
              TblPiMasterId: item.PI_Master_ID,
              TblPiDetailId: item.PI_Detail_ID,
              ReviseID: item.ReviseID,
            });
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

  CopyItem(item: any) {
    console.log(item);

    try {
      // build a revise group (with validators) and push it
      const grp = this.buildReviseGroup({
        customer_name: item.customer_name,
        PINo: item.PINo,
        Article: item.Article,
        Item_ID: item.ActualArticleId,
        Color_ID: item.ColorId,
        Width_ID: item.WidthId,
        Unit_ID: item.UnitId,
        Quantity: item.Quantity,
        Unit_Price: item.Unit_Price,
        CommissionUnit: item.CommissionUnit,
        Delivered_Quantity: item.Delivered_Quantity,
        PI_Detail_ID: item.PI_Detail_ID,
        PI_Master_ID: item.PI_Master_ID,
        ActualArticle: item.ActualArticle,
        // prefer payment term id if available
        PaymentTerms:
          item.PaymentTermsId ??
          item.Payment_Term_ID ??
          item.PaymentTerms ??
          null,
      });
      console.log(grp);

      this.itemsRevise.push(grp);

      // add a display entry to ReviseDetails used by the template
      this.ReviseDetails.push({
        customer_name: item.customer_name || '',
        PINo: item.PINo || '',
        Article: item.Article || '',
        ActualArticle: item.ActualArticle || '',
        Color: item.Color || '',
        Width: item.Width || '',
        Unit: item.Unit || '',
        Quantity: item.Quantity || 0,
        Unit_Price: item.Unit_Price || 0,
        CommissionUnit: item.CommissionUnit || '',
        PaymentTerms: item.PaymentTerms || '',
        Delivered_Quantity: item.Delivered_Quantity || 0,
        PI_Detail_ID: item.PI_Detail_ID || null,
        PI_Master_ID: item.PI_Master_ID || null,
      });

      console.log(this.ReviseDetails);
    } catch (err) {
      console.error('CopyItem error', err);
    }
  }

  /**
   * Build a FormGroup for revise rows with validators.
   * If data provided, populate values; otherwise leave empty.
   */
  buildReviseGroup(data?: any): FormGroup {
    return this.fb.group({
      customer_name: [data?.customer_name || ''],
      PINo: [data?.PINo || ''],
      Article: [data?.Article || '', Validators.required],
      // dropdowns are required per user's request
      Item_ID: [data?.Item_ID ?? null, Validators.required],
      Color_ID: [data?.Color_ID ?? null, Validators.required],
      Width_ID: [data?.Width_ID ?? null, Validators.required],
      Unit_ID: [data?.Unit_ID ?? null, Validators.required],
      Quantity: [data?.Quantity ?? 0, [Validators.required, Validators.min(1)]],
      Unit_Price: [
        data?.Unit_Price ?? 0,
        [Validators.required, Validators.min(0)],
      ],
      CommissionUnit: [data?.CommissionUnit || ''],
      Remarks: [data?.Remarks || ''],
      Delivered_Quantity: [data?.Delivered_Quantity ?? 0],
      PI_Detail_ID: [data?.PI_Detail_ID ?? null],
      PI_Master_ID: [data?.PI_Master_ID ?? null],
      ActualArticle: [data?.ActualArticle || ''],
      // PaymentTerms stores the selected payment term id (required)
      PaymentTerms: [
        data?.PaymentTerms ?? data?.PaymentTermsId ?? null,
        Validators.required,
      ],
      ReviseID: [data?.ReviseID ?? ''],
    });
  }

  addReviseRow() {
    // only allow adding if there's at least one item in PI Info
    if (!this.items || this.items.length === 0) return;

    // copy customer and PI from the first row of the items FormArray
    const first = (this.items.at(0) as FormGroup).value;
    const customerName = first.customer_name || '';
    const pinLabel = first.PINo || '';

    const grp = this.buildReviseGroup({
      customer_name: customerName,
      PINo: pinLabel,
    });

    this.itemsRevise.push(grp);
    this.ReviseDetails.push({
      customer_name: customerName,
      PINo: pinLabel,
      Article: '',
      ActualArticle: '',
      Color: '',
      Width: '',
      Unit: '',
      Quantity: 0,
      Unit_Price: 0,
      CommissionUnit: '',
      PaymentTerms: '',
      Delivered_Quantity: 0,
      PI_Detail_ID: null,
      PI_Master_ID: null,
    });
  }

  calculateAmount(item: any) {
    // placeholder: keep existing behavior or wire-up calculations if needed
  }

  SetActualArticle(item: any) {
    // placeholder for onChange of AAList dropdown
  }

  removeRevise(i: number) {
    if (this.itemsRevise && this.itemsRevise.length > i) {
      this.itemsRevise.removeAt(i);
    }
    if (this.ReviseDetails && this.ReviseDetails.length > i) {
      this.ReviseDetails.splice(i, 1);
    }
  }

  // --- helper: normalize revise items to ensure ID fields are numeric ---
  private normalizeReviseItems(input: any[]): any[] {
    const rows = Array.isArray(input) ? input : [];
    return rows.map((r: any, idx: number) => {
      const out: any = { ...r };

      // Helper to try resolve ids by matching label or id
      const resolve = (
        list: any[] | undefined,
        idKey: string,
        labelKey: string,
        value: any
      ) => {
        if (value == null || list == null) return value;
        // numeric or already id => return as-is (attempt numeric cast)
        if (typeof value === 'number') return value;
        // try to find by idKey first
        let found = list.find((x: any) => String(x[idKey]) === String(value));
        if (found) return found[idKey];
        // try to match by label
        found = list.find(
          (x: any) =>
            String(x[labelKey]).trim().toLowerCase() ===
            String(value).trim().toLowerCase()
        );
        if (found) return found[idKey];
        return value; // unresolved
      };

      // Item_ID from AAList (Item_ID/Article_No)
      out.Item_ID = resolve(
        this.AAList,
        'Item_ID',
        'Article_No',
        out.Item_ID ?? out.ActualArticle ?? out.Article
      );

      // Color_ID from ColorList (Color_ID/Color)
      out.Color_ID = resolve(
        this.ColorList,
        'Color_ID',
        'Color',
        out.Color_ID ?? out.Color
      );

      // Width_ID from WidthList (Width_ID/Measurement)
      out.Width_ID = resolve(
        this.WidthList,
        'Width_ID',
        'Measurement',
        out.Width_ID ?? out.Width
      );

      // Unit_ID from UnitList (Unit_ID/Unit)
      out.Unit_ID = resolve(
        this.UnitList,
        'Unit_ID',
        'Unit',
        out.Unit_ID ?? out.Unit
      );

      // PaymentTerms to Payment_Term_ID
      out.PaymentTerms = resolve(
        this.PaymentModeList,
        'Payment_Term_ID',
        'PaymentTerms',
        out.PaymentTerms ?? out.PaymentTermsId
      );

      // If any unresolved values remain, log a warning to help debugging
      if (
        typeof out.Item_ID === 'string' ||
        typeof out.Color_ID === 'string' ||
        typeof out.Width_ID === 'string' ||
        typeof out.Unit_ID === 'string'
      ) {
        console.warn(
          'normalizeReviseItems: could not fully resolve IDs for row',
          idx,
          out
        );
      }

      return out;
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
