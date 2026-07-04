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
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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

   private piSearch$ = new Subject<string>();
    private customerSearch$ = new Subject<string>();
    piList: any[] = [];
    consigneeList: any[] = [];
    UserList: any[] = [];
    isLoading: boolean = false;

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

     // PI Search
      this.piSearch$
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(keyword => {
          this.callPISearchAPI(keyword);
        });
    
      // Customer Search
      this.customerSearch$
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(keyword => {
          this.callCustomerSearchAPI(keyword);
        });
    

    this.generateForm();
    this.loadPageData();
    this.RegisterFormControlsChangeEvent();

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
      User_ID: ['', Validators.required],
      Customer_ID: [''],
      PINo: ['', Validators.required],
      items: this.fb.array([]),
    });
  }

  loadPageData(): void {
     const procedureData = {
              procedureName: 'usp_GetUserInfo_With_Superior',
              parameters: {
                UserId: this.gs.getSessionData('userId')
              },
            };
        
            this.getDataService.GetInitialData(procedureData).subscribe({
              next: (results) => {
                if (results.status) {
        
                  let DataSet = JSON.parse(results.data);
        
                  this.UserList = DataSet.Tables1;
        
                  if (this.UserList.length === 1) {
                    const userId = this.UserList[0].User_ID;
    
                    this.Formgroup.controls['User_ID']
                      .setValue(userId);
    
                       this.OnUserChange(userId);
                  }
                } else if (results.msg == 'Invalid Token') {
                  swal.fire('Session Expired!', 'Please Login Again.', 'info');
                  this.gs.Logout();
                  this.isLoading = false;
                }
              },
              error: (err) => {
                this.isLoading = false;
              },
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

    var actualPrepareUserId = window.localStorage.getItem('userId');

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

     var selectedPI = this.piList.find(
      (e: any) => e.PINo == this.Formgroup.value.PINo
    );

    var SuperiorId = selectedPI?.Superior_ID;
    var userId = selectedPI?.User_ID;

    const formArray = this.Formgroup.get('items') as FormArray;

    formArray.controls.forEach((group) => {
      const item = group.value;
      console.log(item);

      totalQty += Number(item.Quantity) || 0;
      totalDeliveredQuantity += Number(item.Delivered_Quantity) || 0;
      totalAproveQty += Number(item.ApprovedQty) || 0;
    });

    const masterRow = {
      FormTypeId: 4, 
      TotalQuantity: totalQty,
      TotalDeliveredQuantity: totalDeliveredQuantity,
      TotalAppliedDelQty: totalAproveQty,
      Date: this.Formgroup.value.Date,
      SuperiorId: SuperiorId,
      UserId: userId,
      Status: 'Pending',
      FormTypeName: 'Exchange goods Application', 
      CreatedDate: new Date(
        new Date().toLocaleString('en', { timeZone: 'Asia/Dhaka' })
      ),
      PiNos: this.Formgroup.value.PINo,
    };
    

    const detailRows = fv.items.map((i: any) => ({
      PiNo: i.PINo,
      ArticleNo: i.Article,
      CustomerId: i.Customer_ID,
      CustomerName: i.customer_name,
      ApplyDeliveryQty: i.ApprovedQty,
      Commitment: i.Remarks,
      TblPiMasterId: i.PI_Master_ID,
      TblPiDetailId: i.PI_Detail_ID,
      TblPoFormMasterId: '',
      ActualArticleNo: i.ActualArticle,
      CreatedDate: new Date(
        new Date().toLocaleString('en', { timeZone: 'Asia/Dhaka' })
      ),
      CreatedById: actualPrepareUserId,
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
        detailRows, 
        'tbl_po_form_detail',
        masterRow,
        'tbl_po_form_master', 
        'Id',
        'TblPoFormMasterId', 
        'Application',
        'Application' 
      )
      .subscribe({
        next: (res: any) => {
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

   var actualPrepareUserId = window.localStorage.getItem('userId');

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

      var selectedPI = this.piList.find(
      (e: any) => e.PINo == this.Formgroup.value.PINo
    );

    var SuperiorId = selectedPI?.Superior_ID;
    var userId = selectedPI?.User_ID;


    const formArray = this.Formgroup.get('items') as FormArray;

    formArray.controls.forEach((group) => {
      const item = group.value;
      console.log(item);

      totalQty += Number(item.Quantity) || 0;
      totalDeliveredQuantity += Number(item.Delivered_Quantity) || 0;
      totalAproveQty += Number(item.ApprovedQty) || 0;
    });


    const masterRow = {
      FormTypeId: 4, 
      TotalQuantity: totalQty,
      TotalDeliveredQuantity: totalDeliveredQuantity,
      TotalAppliedDelQty: totalAproveQty,
      Date: this.Formgroup.value.Date,
      SuperiorId: SuperiorId,
      UserId: userId,
      Status: 'Pending',
      FormTypeName: 'Exchange goods Application', 
      CreatedDate: new Date(
        new Date().toLocaleString('en', { timeZone: 'Asia/Dhaka' })
      ),
      PiNos: this.Formgroup.value.PINo,
    };
    

    const detailRows = fv.items.map((i: any) => ({
      PiNo: i.PINo,
      ArticleNo: i.Article,
      CustomerId: i.Customer_ID,
      CustomerName: i.customer_name,
      ApplyDeliveryQty: i.ApprovedQty,
      Commitment: i.Remarks,
      TblPiMasterId: i.PI_Master_ID,
      TblPiDetailId: i.PI_Detail_ID,
      TblPoFormMasterId: '',
      ActualArticleNo: i.ActualArticle,
      CreatedDate: new Date(
        new Date().toLocaleString('en', { timeZone: 'Asia/Dhaka' })
      ),
      CreatedById: actualPrepareUserId,
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
        detailRows, 
        'tbl_po_form_detail',
        masterRow, 
        'tbl_po_form_master',
        'Id',
        'TblPoFormMasterId', 
        'Application',
        'Application',
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

  LoadPIDetails() {
    var userId = window.localStorage.getItem('userId');
    var PINo = this.Formgroup.value.PINo;    

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
                Customer_ID: [item.Customer_ID],
                customer_name: [item.customer_name],
                PINo: [item.PINo],                
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
                Remarks: [item.Commitment],
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
          const parsed = JSON.parse(results.data);
          const rows = parsed.Tables1 || [];
          if (rows.length === 0) {
            return;
          }

          const formArray = this.Formgroup.get('items') as FormArray;
          formArray.clear();

          const firstRow = rows[0];
          const customerId = firstRow.Customer_ID;
          const piNo = firstRow.PiNo;
          const userId = firstRow.User_ID;

          this.Formgroup.get('User_ID')?.setValue(userId, { emitEvent: false });
          this.Formgroup.get('Customer_ID')?.setValue(customerId, {
            emitEvent: false,
          });
          this.Formgroup.get('PINo')?.setValue(piNo, { emitEvent: false });

          this.Formgroup.controls['Date'].setValue(this.toYMD(firstRow.Date));

          this.consigneeList = rows
            .map((item: any) => ({
              Customer_ID: item.Customer_ID,
              Company_Name: item.Company_Name || item.customer_name || '',
            }))
            .filter(
              (item: any, index: number, self: any[]) =>
                self.findIndex((x: any) => x.Customer_ID === item.Customer_ID) ===
                index
            );

          this.piList = rows
            .map((item: any) => ({ PINo: item.PiNo }))
            .filter(
              (item: any, index: number, self: any[]) =>
                self.findIndex((x: any) => x.PINo === item.PINo) === index
            );

          this.LoadConsignee(userId);
          this.LoadPI(userId);

          rows.forEach((item: any) => {
            formArray.push(
              this.fb.group({
                Customer_ID: [item.Customer_ID],
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
                Remarks: [item.Commitment],
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

   onSearchPI(event: any) {
    
        const keyword = event?.filter?.trim() || '';
        if (!keyword) {
          this.onClearPI();
          return;
        }
    
         this.piSearch$.next(keyword); 
      }
    
       onSearchCustomerName(event: any) {
    
        const keyword = event?.filter?.trim() || '';
        if (!keyword) {
          this.onClearCustomerName();
          return;
        }
    
         this.customerSearch$.next(keyword); 
      }
    
      callPISearchAPI(keyword: string) {  
    
        const userId = this.Formgroup.get('User_ID')?.value;
    
        if (!userId) {
          this.piList = [];
    
          swal.fire({
            icon: 'warning',
            title: 'Select Name First',
            text: 'Please select a user before searching PI No',
            timer: 2000,
            showConfirmButton: false
          });
    
          return;
        }
    
        const procedureData = {
          procedureName: 'usp_PINumberSearchWithUserReference',
          parameters: {
            UserId: this.Formgroup.get('User_ID')?.value,
            SearchPI: keyword
          }
        };
    
        this.getDataService.GetInitialData(procedureData).subscribe({
          next: (results) => {
    
            if (results.status) {
    
              const data = JSON.parse(results.data);
    
              this.piList = data?.Tables1 || [];
    
              if (this.piList.length === 1) {
                this.Formgroup.get('PINo')?.setValue(this.piList[0].PINo);
              }
    
            }
            else if (results.msg === 'Invalid Token') {
              swal.fire('Session Expired!', 'Please Login Again.', 'info');
              this.gs.Logout();
            }
    
            this.isLoading = false;
          },
          error: (err) => {
            console.error(err);
            this.isLoading = false;
          }
        });
      }
    
     callCustomerSearchAPI(keyword: string) {  
    
        const userId = this.Formgroup.get('User_ID')?.value;
    
        if (!userId) {
          this.consigneeList = [];
    
          swal.fire({
            icon: 'warning',
            title: 'Select Name First',
            text: 'Please select a user before searching PI No',
            timer: 2000,
            showConfirmButton: false
          });
    
          return;
        }
    
        const procedureData = {
          procedureName: 'usp_CustomerNameSearchWithUserReference',
          parameters: {
            UserId: this.Formgroup.get('User_ID')?.value,
            SearchCustomerName: keyword
          }
        };      
    
        this.getDataService.GetInitialData(procedureData).subscribe({
          next: (results) => {
    
            if (results.status) {
    
              const data = JSON.parse(results.data);
    
              this.consigneeList = data?.Tables1 || [];
    
              if (this.consigneeList.length === 1) {
                this.Formgroup.get('Customer_ID')?.setValue(
                this.consigneeList[0].Customer_ID,
                { emitEvent: false } 
              );
              }
    
            }
            else if (results.msg === 'Invalid Token') {
              swal.fire('Session Expired!', 'Please Login Again.', 'info');
              this.gs.Logout();
            }
    
            this.isLoading = false;
          },
          error: (err) => {
            console.error(err);
            this.isLoading = false;
          }
        });
      }
    
      onClearPI() {
    
        const rawUserId = this.Formgroup.get('User_ID')?.value;
    
        const userId = rawUserId ? rawUserId : 1;
    
        if (!userId) {
          this.piList = [];
          return;
        }
    
        const procedureData = {
          procedureName: 'usp_PINumberSearchWithUserReference',
          parameters: {
            UserId: userId,
            SearchPI: null,
          }
        };
    
        this.getDataService.GetInitialData(procedureData).subscribe({
          next: (results) => {
            if (results.status) {
    
              const data = typeof results.data === 'string'
                ? JSON.parse(results.data)
                : results.data;
    
              this.piList = data?.Tables1 || [];
            }
          }
        });
      }
    
      onClearCustomerName() {
    
        const rawUserId = this.Formgroup.get('User_ID')?.value;
    
        const userId = rawUserId ? rawUserId : 1;
    
        if (!userId) {
          this.consigneeList = [];
          return;
        }
    
        const procedureData = {
          procedureName: 'usp_CustomerNameSearchWithUserReference',
          parameters: {
            UserId: userId,
            SearchCustomerName: null,
          }
        };
    
        this.getDataService.GetInitialData(procedureData).subscribe({
          next: (results) => {
            if (results.status) {
    
              const data = typeof results.data === 'string'
                ? JSON.parse(results.data)
                : results.data;
    
              this.consigneeList = data?.Tables1 || [];
            }
          }
        });
      }
  
  
      RegisterFormControlsChangeEvent() {
  
    this.Formgroup.get('User_ID')
      ?.valueChanges
      .subscribe((userId) => {
  
        this.OnUserChange(userId);
  
      });
  
  }
  
  OnUserChange(userId: any) {
  
    //---------------------------------------------------
    // RESET
    //---------------------------------------------------
  
    this.Formgroup.get('Customer_ID')?.reset();
  
    this.Formgroup.get('PINo')?.reset();
  
    this.consigneeList = [];
  
    this.piList = [];
  
    //---------------------------------------------------
    // NO USER
    //---------------------------------------------------
  
    if (!userId) {
      return;
    }
  
    //---------------------------------------------------
    // LOAD CONSIGNEE
    //---------------------------------------------------
  
    this.LoadConsignee(userId);
  
    //---------------------------------------------------
    // LOAD PI
    //---------------------------------------------------
  
    this.LoadPI(userId);
  
  }
  
  LoadConsignee(userId: number) {
  
    const model = {
  
      procedureName:
        'usp_CustomerNameSearchWithUserReference',
  
      parameters: {
  
        UserId: userId,
        SearchPI: null
  
      }
  
    };
  
    this.getDataService
      .GetInitialData(model)
      .subscribe({
  
        next: (results) => {
  
          if (results.status) {
  
            this.consigneeList =
              JSON.parse(results.data).Tables1;
  
          }
  
        }
  
      });
  
  }
  
  LoadPI(userId: number) {
  
    const model = {
  
      procedureName:
        'usp_PINumberSearchWithUserReference',
  
      parameters: {
  
        UserId: userId,
        SearchPI: null
  
      }
  
    };
  
    this.getDataService
      .GetInitialData(model)
      .subscribe({
  
        next: (results) => {
  
          if (results.status) {
  
            this.piList =
              JSON.parse(results.data).Tables1;
  
          }
  
        }
  
      });
  
  }
}
