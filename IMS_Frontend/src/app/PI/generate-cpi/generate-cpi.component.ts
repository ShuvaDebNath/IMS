import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import Swal from 'sweetalert2';
import { DateFormat } from 'src/app/shared/date-format';
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-generate-cpi',
  templateUrl: './generate-cpi.component.html',
  styleUrls: ['./generate-cpi.component.css']
})
export class GenerateCpiComponent implements OnInit {
  datePipe = new DatePipe('en-US');


  ShipperList: any | [];
  BenificaryBankList: any | [];
  CountryList: any | [];
  PackingList: any | [];
  LoadingModeList: any | [];
  PaymentModeList: any | [];
  ConsigneeList: any | [];
  ApplicantBankList: any | [];
  BuyingHouseList: any | [];
  CurrencyList: any | [];
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
  UserInfosList: any | [];
  PINo!: string;
  PageTitle: any;

  Formgroup!: FormGroup;
  isSubmit!: boolean;
  SetDDL: boolean = true;
  GTQTY: any = 0;
  GTAMNT: any = 0;
  ExchangeRate: any = 1;
  
tempPI?: string | null;
 PI_Master_ID!: string;  
isEdit = false;
basePINo: string = '';

  constructor(private service: MasterEntryService,
    private des: DoubleMasterEntryService,
    private gs: GlobalServiceService,
    private fb: FormBuilder,
    private activeLink: ActivatedRoute, 
  ) { 

     if (this.activeLink.snapshot.queryParamMap.has('PI_Master_ID')) {
    this.PI_Master_ID = this.activeLink.snapshot.queryParams['PI_Master_ID'];
    this.isEdit = true;
  }

  // ✅ FALLBACK: localStorage (only if URL missing)
  if (!this.PI_Master_ID) {
    const temp = this.tryConsumeTempPI();
    if (temp) {
      this.PI_Master_ID = temp;
      this.isEdit = true;
    }
  }


  }

  // ngOnInit(): void {
  //   this.PageTitle = 'Generate LC PI';

  // this.GTQTY = 0;
  // this.GTAMNT = 0;

  // this.SetDDL = true;

  // if (this.isEdit && this.PI_Master_ID) {

  //   // ✅ ONLY load dropdowns, NO default values
  //   this.GenerateFrom(false);

  //   // ✅ THEN load edit data
  //   this.GetById(this.PI_Master_ID);

  // } else {

  //   // ✅ Create mode only
  //   this.GenerateFrom(true);
  // }

  // this.RegisterFormControlsChangeEvent();
  // }

  
  ngOnInit(): void {

  this.PageTitle = 'Generate Cash PI';

  this.GTQTY = 0;
  this.GTAMNT = 0;

  if (this.isEdit && this.PI_Master_ID) {

    // ✅ EDIT MODE
    this.GenerateFrom(false);

    // ✅ Load dropdown ONLY (no default)
    this.GetInitialData(false);

    // ✅ THEN load edit data
    this.GetById(this.PI_Master_ID);

  } else {

    // ✅ CREATE MODE
    this.GenerateFrom(true);

    // ✅ Load dropdown + default values
    this.GetInitialData(true);
  }

  this.RegisterFormControlsChangeEvent();
}

  RegisterFormControlsChangeEvent() {

    this.Formgroup.get('Currency_ID')?.valueChanges.subscribe(value => {
      this.GetExchangeRate(value);
    });


    this.Formgroup.get('Consignee_Initial')?.valueChanges.subscribe(value => {
      // let piNo = value ? `${value.toUpperCase()}-${this.PINo}` : this.PINo;

      let piNo = this.basePINo;

      if (value && this.basePINo) {
        piNo = `${value.toUpperCase()}-${this.basePINo}`;
      }

      this.Formgroup.get('PINo')?.setValue(piNo, { emitEvent: false });

      this.Formgroup.controls["PINo"].setValue(piNo);
    });

    this.Formgroup.get('Customer_ID')?.valueChanges.subscribe(value => {
      let contactPerson = this.ConsigneeList.filter((x: any) => x.Customer_ID == value)[0];
      this.Formgroup.controls["Contact_Person"].setValue(contactPerson.Contact_Name);


       const consigneeCreatedBy = this.ConsigneeList.find(
          (x: any) => x.Customer_ID == value
        );
        if (consigneeCreatedBy) {
          this.Formgroup.controls['User_ID'].setValue(consigneeCreatedBy.Created_By); 
        }

         const getSuperior = this.UserInfosList.find(
            (x: any) => x.User_ID == consigneeCreatedBy.Created_By
          );
          if (getSuperior) {
            this.Formgroup.controls['Superior_ID'].setValue(getSuperior.Superior_ID);
          }



    });

    

  }

  // GetExchangeRate(value: any) {
  //   this.ExchangeRate = 1;
  //   let exchangerate = this.CurrencyList.filter((x: any) => x.Currency_ID == value)[0].ExchangeRate;
  //   this.ExchangeRate = exchangerate ? exchangerate : 1;
  // }

  GetExchangeRate(value: any) {

  this.ExchangeRate = 1;

  const selected = this.CurrencyList.find(
    (x: any) => x.Currency_ID == value
  );

  if (selected) {
    this.ExchangeRate = selected.ExchangeRate ?? 1;
  }
}

  GetById(id: any) {
    let model = new GetDataModel();
    model.procedureName = 'usp_ProformaInvoice_GetDataById';
    model.parameters = {
      PI_Master_ID: Number(this.PI_Master_ID),
    };

    this.service.GetInitialData(model).subscribe((res: any) => {
      if (res.status) {
        const ds = JSON.parse(res.data);


        const header = ds.Tables1?.[0];   // Master
        const details = ds.Tables2 || []; // Details
        if (header) {
          this.Formgroup.patchValue(header);
        }

        const formArray = this.Formgroup.get('ItemArray') as FormArray;
        formArray.clear();

        (details || []).forEach((item: any) => {
          formArray.push(this.createDetailForm(item));
          this.calculatetotalGrandTotal();
        });

      } else {
        if (res.msg == 'Invalid Token') {
          this.gs.Logout();
        }
      }
    });
  }

  createDetailForm(item: any): FormGroup {
    return this.fb.group({
      PI_Detail_ID: [item.PI_Detail_ID],
      Article: [item.Article],
      Description: [item.Description],
      Width_ID: [item.Width_ID],
      Color_ID: [item.Color_ID],
      Packaging_ID: [item.Packaging_ID],
      Quantity: [item.Quantity],
      Unit_ID: [item.Unit_ID],
      Unit_Price: [item.Unit_Price],
      Total_Amount: [item.Total_Amount],
      CommissionUnit: [item.CommissionUnit],
      TotalCommission: [item.TotalCommission],
      Item_ID: [item.Item_ID]
    });
  }

   GenerateFrom(setDefault: boolean = true) {

  this.Formgroup = this.fb.group({
    PI_Master_ID: [''],
    PINo: [''],

    Consignee_Initial: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(3)],
    ],

    // ❌ REMOVE direct default from here
    Date: [''],

     Beneficiary_Account_ID: [''],
      Beneficiary_Bank_ID: [''],
      Country_Of_Orgin_ID: [''],
      Packing_ID: [''],
      Loading_Mode_ID: [''],
      Payment_Term_ID: [''],
      Consignee: [''],
      Contact_Person: [''],
      Buyer_Name: [''],
      Delivery_Address: [''],
      Style: [''],
      Marketing_Concern_ID: [''],
      Delivery_Condition_ID: [''],
      Shipment_Condition_ID: [''],
      Price_Term_ID: [''],
      Good_Description: [''],
      Documents: [''],
      Shipping_Marks: [''],
      Loading_Port: [''],
      Destination_Port: [''],
      Remarks: [''],
      Force_Majeure_ID: [''],
      Arbitration_ID: [''],
      Status: ['Pending'],
      User_ID: [''],
      Superior_ID: [''],
      LC_ID: [''],
      Customer_ID: [''],
      Currency_ID: [''],
      IsMPI: [1],
      CR_ID: [''],
      LastUpdateDate: [new Date()],
      Buyer_ID: [''],
      SalesContractId: [''],
      IsBuyerMandatory: [false],
      CustomMaxDeliveryPercentage: [''],
      GrandTotalAmount_LC: [''],
      GrandTotalAmount_Cash: [''],
      GrandTotalAmount_Both: [''],
      GrandTotalQty: [''], 

    // ✅ Start EMPTY (important for edit mode)
    ItemArray: this.fb.array([]),
  });

  // ✅ Apply default ONLY for create mode
  if (setDefault) {
    this.setDefaultValues();
    this.addInitialRow();
  }
}

setDefaultValues() {
  this.Formgroup.patchValue({
    Date: this.datePipe.transform(new Date(), 'MM/dd/yyyy'),
    Status: 'Pending'
  });
}

addInitialRow() {
  this.ItemArray.push(this.InitRow());
}

get ItemArray(): FormArray {
  return this.Formgroup.get('ItemArray') as FormArray;
}




  InitRow() {
    return this.fb.group({
      PI_Master_ID: [''],
      Article: [''],
      Description: [''],
      Width_ID: [''],
      Color_ID: [''],
      Packaging_ID: [''],
      Quantity: [],
      Total_Amount: [0],
      Total_Amount_Tk: [0],
      Delivered_Quantity: [0],
      Unit_Price: [],
      CommissionUnit: [],
      TotalCommission: [0],
      Item_ID: [''],
      ActualArticle: [''],
      Unit_ID: [''],
    });
  }
  SetActualArticle(itemrow: any) {
    let articleID = itemrow.controls["Item_ID"].value;
    let articleNo = this.AAList.filter((x: any) => x.Item_ID == articleID)[0].Article_No;
    itemrow.controls["ActualArticle"].setValue(articleNo);
  }
  getControls() {
    return (this.Formgroup.get('ItemArray') as FormArray).controls;
  }

  Addrow() {
    const con = <FormArray>this.Formgroup.controls['ItemArray'];
    con.push(this.InitRow());
  }

  DeleteRow(index: any) {
    const con = <FormArray>this.Formgroup.controls['ItemArray'];
    if (con != null && con.length > 1) {
      con.removeAt(index);
      this.calculatetotalGrandTotal();
    }
  }

  RemoveLast() {
    const con = <FormArray>this.Formgroup.controls['ItemArray'];
    if (con != null && con.length > 1) {
      con.removeAt(con.length - 1);
      this.calculatetotalGrandTotal();
    }
  }
  calculateAmount(itemrow: any) {
    let qty = itemrow.controls["Quantity"].value;
    let rate = itemrow.controls["Unit_Price"].value;
    let proCostUnti = itemrow.controls["CommissionUnit"].value;
    itemrow.controls["Total_Amount_Tk"].setValue(qty * rate);
    itemrow.controls["Total_Amount"].setValue((qty * rate) / this.ExchangeRate);
    itemrow.controls["TotalCommission"].setValue(qty * proCostUnti);
    this.calculatetotalGrandTotal();
  }

  calculatetotalGrandTotal() {
    this.GTQTY = 0; this.GTAMNT = 0;
    const itemArray = this.Formgroup.get('ItemArray') as FormArray;
    itemArray.controls.forEach(control => {
      this.GTQTY += control.value.Quantity;
      this.GTAMNT += control.value.Total_Amount_Tk;
    });
  }

  isInvalid(itemrow: any, controlName: any) {
    if (itemrow.controls[controlName].invalid && (itemrow.controls[controlName].touched || this.isSubmit)) {
      return true;
    } else {
      return false;
    }
  }

  SetDDLDefaultValue(): void {
    this.Formgroup.controls["Beneficiary_Account_ID"].setValue(2);
    this.Formgroup.controls["Beneficiary_Bank_ID"].setValue(5);
    this.Formgroup.controls["Country_Of_Orgin_ID"].setValue(1);
    this.Formgroup.controls["Packing_ID"].setValue(1);
    this.Formgroup.controls["Loading_Mode_ID"].setValue(1);
    this.Formgroup.controls["Payment_Term_ID"].setValue(13);
    //this.Formgroup.controls["Currency_ID"].setValue(2);
    this.Formgroup.controls["Delivery_Condition_ID"].setValue(1);
    this.Formgroup.controls["Shipment_Condition_ID"].setValue(1);
    this.Formgroup.controls["Price_Term_ID"].setValue(1);
    //this.Formgroup.controls["PINo"].setValue(this.PINo);
  }


  RefrashDDL(): void {
    this.SetDDL = false;
    this.GetInitialData()
  }

  GetInitialData(setDefault: boolean = true): void {

  this.ShipperList = [];

  let model = new GetDataModel();
  model.procedureName = 'usp_ProformaInvoice_GetInitialData';
  model.parameters = {
    userID: this.gs.getSessionData('userId'),
    roleID: this.gs.getSessionData('roleId'),
    PaymentType: 2,
  };

  this.service.GetInitialData(model).subscribe((res: any) => {

    if (res.status) {

      let DataSet = JSON.parse(res.data);

      // ✅ dropdowns
        this.ShipperList=DataSet.Tables31;
        this.BenificaryBankList=DataSet.Tables2;
        this.CountryList=DataSet.Tables3;
        this.PackingList=DataSet.Tables4;
        this.LoadingModeList=DataSet.Tables5;
        this.PaymentModeList=DataSet.Tables6;
        this.ConsigneeList=DataSet.Tables7;
        this.ApplicantBankList=DataSet.Tables8;
        this.BuyingHouseList=DataSet.Tables9;
        
        this.DescriptionList=DataSet.Tables11;
        this.WidthList=DataSet.Tables12;
        this.ColorList=DataSet.Tables13;
        this.PackagingList=DataSet.Tables14;
        this.UnitList=DataSet.Tables15;
        this.AAList=DataSet.Tables28;
        this.DeliveryConditionList=DataSet.Tables17;
        this.PartialShipmentList=DataSet.Tables18;
        this.PriceTermsList=DataSet.Tables19;
        this.ForceMajeureList=DataSet.Tables20;
        this.ArbitrationList=DataSet.Tables21;
        this.CurrencyList=DataSet.Tables22;
        this.UserInfosList = DataSet.Tables32;
        
const bdt = this.CurrencyList.find((x: any) => x.CurrencyCode === 'BDT');

if (bdt) {
  this.Formgroup.patchValue({
    Currency_ID: bdt.Currency_ID
  });

  this.GetExchangeRate(bdt.Currency_ID); // trigger exchange rate
}

      // ✅ ONLY for create mode
      if (setDefault) {
        this.basePINo = DataSet.Tables30[0].PINO;
        this.Formgroup.patchValue({
            PINo: this.basePINo
          });
        this.SetDDLDefaultValue();
      }

    } else {
      if (res.msg == 'Invalid Token') {
        this.gs.Logout();
      }
    }
  });
}


  Save(): void {

    console.log(this.Formgroup.controls['Currency_ID']?.value);

    const requiredFields = [
      { key: 'Consignee_Initial', label: 'Consignee Initial' },
      { key: 'PINo', label: 'PI No' },
      { key: 'Date', label: 'Date' },
      { key: 'Beneficiary_Account_ID', label: 'Shippeer' },
      { key: 'Beneficiary_Bank_ID', label: "Beneficiary's Bank" },
      { key: 'Country_Of_Orgin_ID', label: 'Country of Origin' },
      { key: 'Packing_ID', label: 'Packing' },
      { key: 'Loading_Mode_ID', label: 'Loading Mode' },
      { key: 'Payment_Term_ID', label: 'Payment Mode' },
      { key: 'Customer_ID', label: 'Consignee' },
      { key: 'Contact_Person', label: 'Contact Person' },
      { key: 'Buyer_Name', label: 'Buyer Name' },
      { key: 'Delivery_Address', label: 'Delivery Address' },
      { key: 'Style', label: 'Style' },
      { key: 'Good_Description', label: 'Goods Description' },
      { key: 'Currency_ID', label: 'Currency' },
      { key: 'Delivery_Condition_ID', label: 'Delivery Condition' },
      { key: 'Shipment_Condition_ID', label: 'Partial Shipment' },
      { key: 'Price_Term_ID', label: 'Price Terms' },
      { key: 'Documents', label: 'Documents' },
      { key: 'Loading_Port', label: 'Port Of Loading' },
      { key: 'Destination_Port', label: 'Port Of Destination' },
      { key: 'Force_Majeure_ID', label: 'Force Majeure' },
      { key: 'Arbitration_ID', label: 'Arbitration' }
    ];

    let missingFields: string[] = [];
    requiredFields.forEach(field => {
      const value = this.Formgroup.controls[field.key]?.value;
      if (value === null || value === undefined || value === '' || value === 0) {
        missingFields.push(field.label);
      }
    });

    const itemArray = this.Formgroup.get('ItemArray') as FormArray;
    if (!itemArray || itemArray.length === 0) {
      missingFields.push('At least one Item Row');
    } else {
      itemArray.controls.forEach((row, idx) => {
        const itemRequired = [
          { key: 'Article', label: 'Article No' },
          { key: 'Description', label: 'Description' },
          { key: 'Width_ID', label: 'Width' },
          { key: 'Color_ID', label: 'Color' },
          { key: 'Packaging_ID', label: 'Packaging' },
          { key: 'Quantity', label: 'Qty' },
          { key: 'Unit_ID', label: 'Unit' },
          { key: 'Unit_Price', label: 'Unit Price' },
          { key: 'CommissionUnit', label: 'Prod. Cost Unit' },
          { key: 'Item_ID', label: 'A. A.' }
        ];
        itemRequired.forEach(col => {
          const val = row.get(col.key)?.value;
          if (val === null || val === undefined || val === '' || val === 0) {
            missingFields.push(`Row ${idx + 1}: ${col.label}`);
          }
        });
      });
    }

    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        html: 'Please fill the following fields:<br><ul style="text-align:left">' + missingFields.map(f => `<li>${f}</li>`).join('') + '</ul>'
      });
      return;
    }

    let model = {
      PI_Master_ID: this.Formgroup.controls['PI_Master_ID'].value,
      PINo: this.Formgroup.controls['PINo'].value,
      Consignee_Initial: this.Formgroup.controls['Consignee_Initial'].value,
      Date: this.Formgroup.controls['Date'].value,
      Beneficiary_Account_ID: this.Formgroup.controls['Beneficiary_Account_ID'].value,
      Beneficiary_Bank_ID: this.Formgroup.controls['Beneficiary_Bank_ID'].value,
      Country_Of_Orgin_ID: this.Formgroup.controls['Country_Of_Orgin_ID'].value,
      Packing_ID: this.Formgroup.controls['Packing_ID'].value,
      Loading_Mode_ID: this.Formgroup.controls['Loading_Mode_ID'].value,
      Payment_Term_ID: this.Formgroup.controls['Payment_Term_ID'].value,
      Consignee: this.Formgroup.controls['Consignee'].value,
      Contact_Person: this.Formgroup.controls['Contact_Person'].value,
      Buyer_Name: this.Formgroup.controls['Buyer_Name'].value,
      Delivery_Address: this.Formgroup.controls['Delivery_Address'].value,
      Style: this.Formgroup.controls['Style'].value,
      Delivery_Condition_ID: this.Formgroup.controls['Delivery_Condition_ID'].value,
      Shipment_Condition_ID: this.Formgroup.controls['Shipment_Condition_ID'].value,
      Price_Term_ID: this.Formgroup.controls['Price_Term_ID'].value,
      Good_Description: this.Formgroup.controls['Good_Description'].value,
      Documents: this.Formgroup.controls['Documents'].value,
      Shipping_Marks: this.Formgroup.controls['Shipping_Marks'].value,
      Loading_Port: this.Formgroup.controls['Loading_Port'].value,
      Destination_Port: this.Formgroup.controls['Destination_Port'].value,
      Remarks: this.Formgroup.controls['Remarks'].value,
      Force_Majeure_ID: this.Formgroup.controls['Force_Majeure_ID'].value,
      Arbitration_ID: this.Formgroup.controls['Arbitration_ID'].value,
      Status: this.Formgroup.controls['Status'].value,
      User_ID: this.Formgroup.controls['User_ID'].value,
      Superior_ID: this.Formgroup.controls['Superior_ID'].value,
      Customer_ID: this.Formgroup.controls['Customer_ID'].value,
      IsMPI: this.Formgroup.controls['IsMPI'].value,
      LastUpdateDate: this.Formgroup.controls['LastUpdateDate'].value,
      Currency_ID: this.Formgroup.controls['Currency_ID'].value,
      GrandTotalQty: this.GTQTY,
      GrandTotalAmount_LC: 0,
      GrandTotalAmount_Cash: this.GTAMNT,
      GrandTotalAmount_Both: 0,
    };

    this.service
          .SaveDataMasterDetailsWithLog(
            this.Formgroup.value.ItemArray,
            'tbl_pi_detail',
            model,
            'tbl_pi_master',
            'PI_Master_ID',
            'PI_Master_ID',
            'tbl_pi_master',
            'PI_Master_ID',
          )
          .subscribe((res) => {
            if (res.messageType == 'Success' && res.status) {
              Swal.fire(res.messageType, res.message, 'success').then(() => {
                this.ngOnInit();
              });
            } else {
              if (!res.isAuthorized) {
                //this.gs.Logout();
              } else {
                Swal.fire(res.messageType, res.message, 'info');
              }
            }
          });

  }

   Update(): void {
     
     const requiredFields = [
      { key: 'Consignee_Initial', label: 'Consignee Initial' },
      { key: 'PINo', label: 'PI No' },
      { key: 'Date', label: 'Date' },
      { key: 'Beneficiary_Account_ID', label: 'Shippeer' },
      { key: 'Beneficiary_Bank_ID', label: "Beneficiary's Bank" },
      { key: 'Country_Of_Orgin_ID', label: 'Country of Origin' },
      { key: 'Packing_ID', label: 'Packing' },
      { key: 'Loading_Mode_ID', label: 'Loading Mode' },
      { key: 'Payment_Term_ID', label: 'Payment Mode' },
      { key: 'Customer_ID', label: 'Consignee' },
      { key: 'Contact_Person', label: 'Contact Person' },
      { key: 'Buyer_Name', label: 'Buyer Name' },
      { key: 'Delivery_Address', label: 'Delivery Address' },
      { key: 'Style', label: 'Style' },
      { key: 'Good_Description', label: 'Goods Description' },
      { key: 'Currency_ID', label: 'Currency' },
      { key: 'Delivery_Condition_ID', label: 'Delivery Condition' },
      { key: 'Shipment_Condition_ID', label: 'Partial Shipment' },
      { key: 'Price_Term_ID', label: 'Price Terms' },
      { key: 'Documents', label: 'Documents' },
      { key: 'Loading_Port', label: 'Port Of Loading' },
      { key: 'Destination_Port', label: 'Port Of Destination' },
      { key: 'Force_Majeure_ID', label: 'Force Majeure' },
      { key: 'Arbitration_ID', label: 'Arbitration' }
    ];

    let missingFields: string[] = [];
    requiredFields.forEach(field => {
      const value = this.Formgroup.controls[field.key]?.value;
      if (value === null || value === undefined || value === '' || value === 0) {
        missingFields.push(field.label);
      }
    });

    const itemArray = this.Formgroup.get('ItemArray') as FormArray;
    if (!itemArray || itemArray.length === 0) {
      missingFields.push('At least one Item Row');
    } else {
      itemArray.controls.forEach((row, idx) => {
        const itemRequired = [
          { key: 'Article', label: 'Article No' },
          { key: 'Description', label: 'Description' },
          { key: 'Width_ID', label: 'Width' },
          { key: 'Color_ID', label: 'Color' },
          { key: 'Packaging_ID', label: 'Packaging' },
          { key: 'Quantity', label: 'Qty' },
          { key: 'Unit_ID', label: 'Unit' },
          { key: 'Unit_Price', label: 'Unit Price' },
          { key: 'CommissionUnit', label: 'Prod. Cost Unit' },
          { key: 'Item_ID', label: 'A. A.' }
        ];
        itemRequired.forEach(col => {
          const val = row.get(col.key)?.value;
          if (val === null || val === undefined || val === '' || val === 0) {
            missingFields.push(`Row ${idx + 1}: ${col.label}`);
          }
        });
      });
    }

    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        html: 'Please fill the following fields:<br><ul style="text-align:left">' + missingFields.map(f => `<li>${f}</li>`).join('') + '</ul>'
      });
      return;
    }

  
      Swal.fire({
        title: 'Confirm Update',
        text: 'Are you sure you want to update this Proforma Invoice?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          // Use getRawValue to get all form values, including disabled controls and nested arrays
          let model = {
              PI_Master_ID: this.Formgroup.controls['PI_Master_ID'].value,
              PINo: this.Formgroup.controls['PINo'].value,
              Consignee_Initial: this.Formgroup.controls['Consignee_Initial'].value,
              Date: this.Formgroup.controls['Date'].value,
              Beneficiary_Account_ID: this.Formgroup.controls['Beneficiary_Account_ID'].value,
              Beneficiary_Bank_ID: this.Formgroup.controls['Beneficiary_Bank_ID'].value,
              Country_Of_Orgin_ID: this.Formgroup.controls['Country_Of_Orgin_ID'].value,
              Packing_ID: this.Formgroup.controls['Packing_ID'].value,
              Loading_Mode_ID: this.Formgroup.controls['Loading_Mode_ID'].value,
              Payment_Term_ID: this.Formgroup.controls['Payment_Term_ID'].value,
              Consignee: this.Formgroup.controls['Consignee'].value,
              Contact_Person: this.Formgroup.controls['Contact_Person'].value,
              Buyer_Name: this.Formgroup.controls['Buyer_Name'].value,
              Delivery_Address: this.Formgroup.controls['Delivery_Address'].value,
              Style: this.Formgroup.controls['Style'].value,
              Delivery_Condition_ID: this.Formgroup.controls['Delivery_Condition_ID'].value,
              Shipment_Condition_ID: this.Formgroup.controls['Shipment_Condition_ID'].value,
              Price_Term_ID: this.Formgroup.controls['Price_Term_ID'].value,
              Good_Description: this.Formgroup.controls['Good_Description'].value,
              Documents: this.Formgroup.controls['Documents'].value,
              Shipping_Marks: this.Formgroup.controls['Shipping_Marks'].value,
              Loading_Port: this.Formgroup.controls['Loading_Port'].value,
              Destination_Port: this.Formgroup.controls['Destination_Port'].value,
              Remarks: this.Formgroup.controls['Remarks'].value,
              Force_Majeure_ID: this.Formgroup.controls['Force_Majeure_ID'].value,
              Arbitration_ID: this.Formgroup.controls['Arbitration_ID'].value,
              Status: this.Formgroup.controls['Status'].value,
              User_ID: this.Formgroup.controls['User_ID'].value,
              Superior_ID: this.Formgroup.controls['Superior_ID'].value,
              Customer_ID: this.Formgroup.controls['Customer_ID'].value,
              IsMPI: this.Formgroup.controls['IsMPI'].value,
              LastUpdateDate: this.Formgroup.controls['LastUpdateDate'].value,
              Currency_ID: this.Formgroup.controls['Currency_ID'].value,
              GrandTotalQty: this.GTQTY,
              GrandTotalAmount_LC: 0,
              GrandTotalAmount_Cash: this.GTAMNT,
              GrandTotalAmount_Both: 0,
            };

  
  
          const whereParams = { PI_Master_ID: model.PI_Master_ID };     
  
          this.des
            .UpdateDataMasterDetailsWithLog(
              this.Formgroup.value.ItemArray,
              'tbl_pi_detail',
              model,
              'tbl_pi_master',
              'PI_Master_ID',
              'PI_Master_ID',
              '',
              '',
              whereParams,
            )
            .subscribe((res) => {
  
              if (res.messageType == 'Success' && res.status) {
                Swal.fire(res.messageType, res.message, 'success').then(() => {
                  this.ngOnInit();
                });
              } else {
                if (!res.isAuthorized) {
                  this.gs.Logout();
                } else {
                  Swal.fire(res.messageType, res.message, 'error');
                }
              }
            });
        }
      });
    }

  toUppercase(controlName: string) {
    const control = this.Formgroup.get(controlName);
    if (control) {
      const value = control.value || '';
      control.setValue(value.toUpperCase(), { emitEvent: false });
    }
  }


    private tryConsumeTempPI(): any {
  try {
    const raw = localStorage.getItem('IMS_temp_open_pi');
    if (!raw) return null;

    const data = JSON.parse(raw);

    // expire after 10 seconds (avoid stale data)
    if (Date.now() - data.ts > 10000) {
      localStorage.removeItem('IMS_temp_open_pi');
      return null;
    }

    localStorage.removeItem('IMS_temp_open_pi');
    return data.PI_Master_ID;

  } catch {
    return null;
  }
}

GeneratePINo() {

  const consignee = this.Formgroup.get('Consignee_Initial')?.value;

  if (consignee && this.basePINo) {
    this.Formgroup.patchValue({
      PINo: `${consignee}-${this.basePINo}`
    }, { emitEvent: false });
  }
  else if (this.basePINo) {
    // fallback (initial load)
    this.Formgroup.patchValue({
      PINo: this.basePINo
    }, { emitEvent: false });
  }
}


}
