import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-generate-pi',
  templateUrl: './generate-pi.component.html',
  styleUrls: ['./generate-pi.component.css'],
})
export class GeneratePiComponent implements OnInit {
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
  PINo!: string;
  PageTitle: any;
  // temporary PI passed from another tab (via localStorage)
  tempPI?: string | null;

  // keep a snapshot of original master/details when loading for edit so we can compute audit logs
  private originalMaster: any = null;
  private originalDetails: any[] = [];

  Formgroup!: FormGroup;
  isSubmit!: boolean;
  SetDDL: boolean = true;
  GTQTY: any = 0;
  GTAMNT: any = 0;
  GrandTotalQty: any = 0;
  GrandTotalAmount: any = 0;

  constructor(
    private service: MasterEntryService,
    private des: DoubleMasterEntryService,
    private gs: GlobalServiceService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    console.log(this.tempPI);

    this.PageTitle = 'Generate LC PI';
    this.GTQTY = 0;
    this.GTAMNT = 0;
    this.SetDDL = true;
    this.GenerateFrom();
    this.GetInitialData();
    this.BuyerToggle(false);
    this.RegisterFormControlsChangeEvent();
    this.GrandTotalQty = 0;
    this.GrandTotalAmount = 0;
    // If another tab passed a PI_No via localStorage, consume and store it for later
    const incomingPi = this.tryConsumeTempPI();
    if (incomingPi) {
      this.tempPI = incomingPi;
      // set early if form exists (GenerateFrom will also initialize the form)
      try {
        if (this.Formgroup) {
          this.Formgroup.controls['PINo'].setValue(this.tempPI);
        }
      } catch (e) {}
    }
  }

  /**
   * Load full PI data (master + details) for editing using provided identifier.
   * The procedure name used is 'usp_ProformaInvoice_GetDataById' but we send multiple
   * possible params so backend can pick whichever it supports (PI_Master_ID, PINo, PI_No).
   */
  loadPIForEdit(piIdentifier: string) {
    try {
      const model = new GetDataModel();
      model.procedureName = 'usp_ProformaInvoice_GetDataById';
      model.parameters = {
        PI_Master_ID: Number(piIdentifier),
      };

      this.service.GetInitialData(model).subscribe((res: any) => {
        if (res.status) {
          const ds = JSON.parse(res.data);
          console.log(ds);

          if (ds.Tables1[0].ExpireDate) {
            const parts = ds.Tables1[0].ExpireDate.split('/');
            const formattedDate = new Date(+parts[2], +parts[1] - 1, +parts[0]); // dd/mm/yyyy → Date
            ds.Tables1[0].ExpireDate = formattedDate;
          }

          // Try to find master record
          let master: any = null;
          if (ds.Tables1 && ds.Tables1.length > 0) master = ds.Tables1[0];
          if (!master && ds.Tables2 && ds.Tables2.length > 0)
            master = ds.Tables2[0];

          // store original snapshot for audit diff later
          try {
            this.originalMaster = master
              ? JSON.parse(JSON.stringify(master))
              : null;
          } catch (e) {
            this.originalMaster = master;
          }

          if (master) {
            // set PINo and other master form controls if present
            this.PINo = master.PINo || master.PINO || master.PI_No || this.PINo;
            this.Formgroup.controls['Customer_Bank_ID'].setValue(master.Customer_Bank_ID);
            try {
              // patch known fields into the form
              const keys = Object.keys(master);
              for (const k of keys) {
                if ((this.Formgroup.controls as any)[k] !== undefined) {
                  (this.Formgroup.controls as any)[k].setValue(master[k]);
                }
              }
            } catch (e) {}
          }

          // Details table: try Tables2, Tables1 (if it's the details), or Tables3
          let details = ds.Tables2 || ds.Tables1 || ds.Tables3 || [];
          // If master was taken from Tables1, details likely in Tables2
          if (ds.Tables1 && master === ds.Tables1[0] && ds.Tables2)
            details = ds.Tables2;

          // populate ItemArray form with details
          try {
            // keep original details snapshot for audit
            try {
              this.originalDetails = Array.isArray(details)
                ? JSON.parse(JSON.stringify(details))
                : [];
            } catch (e) {
              this.originalDetails = details || [];
            }
            const con = this.Formgroup.get('ItemArray') as FormArray;
            // clear existing
            while (con.length) con.removeAt(0);
            if (Array.isArray(details) && details.length > 0) {
              for (const d of details) {
                const row = this.InitRow();
                Object.keys(d).forEach((k) => {
                  if ((row.controls as any)[k] !== undefined) {
                    (row.controls as any)[k].setValue(d[k]);
                  }
                });
                con.push(row);
              }
            } else {
              // ensure at least one row
              con.push(this.InitRow());
            }
            // Recalculate grand totals after populating the ItemArray so GTQTY/GTAMNT reflect loaded data
            try {
              this.calculatetotalGrandTotal();
            } catch (tt) {
              /* ignore */
            }
          } catch (e) {}
        } else {
          if (res.msg === 'Invalid Token') this.gs.Logout();
        }
      });
    } catch (err) {
      console.error('loadPIForEdit error', err);
    }
  }

  private tryConsumeTempPI() {
    try {
      const raw = localStorage.getItem('IMS_temp_open_pi');
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && data.PI_No && Date.now() - (data.ts || 0) < 5000) {
        localStorage.removeItem('IMS_temp_open_pi');
        return data.PI_No;
      }
      localStorage.removeItem('IMS_temp_open_pi');
      return null;
    } catch (e) {
      try {
        localStorage.removeItem('IMS_temp_open_pi');
      } catch (_) {}
      return null;
    }
  }

  RegisterFormControlsChangeEvent() {
    this.Formgroup.get('IsBuyerMandatory')?.valueChanges.subscribe((value) => {
      this.BuyerToggle(value);
    });

    this.Formgroup.get('Consignee_Initial')?.valueChanges.subscribe((value) => {
      let piNo = value ? `${value}-${this.PINo}` : this.PINo;
      this.Formgroup.controls['PINo'].setValue(piNo);
    });

    this.Formgroup.get('Customer_ID')?.valueChanges.subscribe((value) => {
      let contactPerson = this.ConsigneeList.filter(
        (x: any) => x.Customer_ID == value,
      )[0];
      this.Formgroup.controls['Contact_Person'].setValue(
        contactPerson.Contact_Name,
      );
    });
  }

  BuyerToggle(value: boolean) {
    if (value) {
      this.Formgroup.get('Buyer_ID')?.enable();
    } else {
      this.Formgroup.get('Buyer_ID')?.disable();
    }
  }

  GenerateFrom() {
    this.Formgroup = this.fb.group({
      PI_Master_ID: [''],
      PINo: [''],
      Consignee_Initial: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(3)],
      ],
      Date: [this.datePipe.transform(new Date(), 'MM/dd/yyyy')],
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
      IsMPI: [0],
      CR_ID: [''],
      LastUpdateDate: [new Date()],
      ExpireDate: [''],
      Terms_of_Delivery_ID: [''],
      Buyer_ID: [''],
      SalesContractId: [''],
      IsBuyerMandatory: [false],
      CustomMaxDeliveryPercentage: [''],
      Customer_Bank_ID: [''],
      GrandTotalAmount_LC: [''],
      GrandTotalAmount_Cash: [''],
      GrandTotalAmount_Both: [''],

      ItemArray: this.fb.array([this.InitRow()]),
    });
  }
  InitRow() {
    return this.fb.group({
      PI_Master_ID: [''],
      Article: [''],
      Description: [''],
      Width_ID: [''],
      Color_ID: [''],
      Packaging_ID: [''],
      Quantity: [''],
      Total_Amount: [''],
      Delivered_Quantity: [0],
      Unit_Price: [''],
      CommissionUnit: [''],
      TotalCommission: [''],
      Item_ID: [''],
      ActualArticle: [''],
      Unit_ID: [''],
      Quantity_In_Meter: [0],
      Delivered_Quantity_In_Meter: [0],
    });
  }
  SetActualArticle(itemrow: any) {
    let articleID = itemrow.controls['Item_ID'].value;
    let articleNo = this.AAList.filter((x: any) => x.Item_ID == articleID)[0]
      .Article_No;
    itemrow.controls['ActualArticle'].setValue(articleNo);
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
    let qty = itemrow.controls['Quantity'].value;
    let dQty = itemrow.controls['Delivered_Quantity'].value;
    let rate = itemrow.controls['Unit_Price'].value;
    let proCostUnti = itemrow.controls['CommissionUnit'].value;
    if (qty < dQty) {
      Swal.fire(
        'Info',
        'Quantity can not be greater than Delivered Quantity (' + dQty + ')',
        'info',
      );
      itemrow.controls['Quantity'].setValue(0);
      itemrow.controls['Total_Amount'].setValue(0);
      itemrow.controls['TotalCommission'].setValue(0);
    } else {
      itemrow.controls['Total_Amount'].setValue(qty * rate);
      itemrow.controls['TotalCommission'].setValue(qty * proCostUnti);
    }

    this.calculatetotalGrandTotal();
  }

  calculatetotalGrandTotal() {
    this.GTQTY = 0;
    this.GTAMNT = 0;
    this.GrandTotalQty = 0;
    this.GrandTotalAmount = 0;
    const itemArray = this.Formgroup.get('ItemArray') as FormArray;
    itemArray.controls.forEach((control) => {
      this.GTQTY += control.value.Quantity;
      this.GTAMNT += control.value.Total_Amount;
      this.GrandTotalQty += control.value.Quantity;
      this.GrandTotalAmount += control.value.Total_Amount;
    });
  }

  isInvalid(itemrow: any, controlName: any) {
    if (
      itemrow.controls[controlName].invalid &&
      (itemrow.controls[controlName].touched || this.isSubmit)
    ) {
      return true;
    } else {
      return false;
    }
  }

  SetDDLDefaultValue(): void {
    this.Formgroup.controls['Beneficiary_Account_ID'].setValue(1);
    this.Formgroup.controls['Beneficiary_Bank_ID'].setValue(1);
    this.Formgroup.controls['Country_Of_Orgin_ID'].setValue(1);
    this.Formgroup.controls['Packing_ID'].setValue(1);
    this.Formgroup.controls['Loading_Mode_ID'].setValue(1);
    this.Formgroup.controls['Payment_Term_ID'].setValue(1);
    this.Formgroup.controls['Terms_of_Delivery_ID'].setValue(1);
    this.Formgroup.controls['Delivery_Condition_ID'].setValue(3);
    this.Formgroup.controls['Shipment_Condition_ID'].setValue(1);
    this.Formgroup.controls['Price_Term_ID'].setValue(1);
    this.Formgroup.controls['PINo'].setValue(this.PINo);
  }

  RefrashDDL(): void {
    this.SetDDL = false;
    this.GetInitialData();
  }

  GetInitialData(): void {
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

        this.ShipperList = DataSet.Tables1;
        this.BenificaryBankList = DataSet.Tables2;
        this.CountryList = DataSet.Tables3;
        this.PackingList = DataSet.Tables4;
        this.LoadingModeList = DataSet.Tables5;
        this.PaymentModeList = DataSet.Tables6;
        this.ConsigneeList = DataSet.Tables7;
        this.ApplicantBankList = DataSet.Tables8;
        this.BuyingHouseList = DataSet.Tables9;
        this.TermsofDeliveryList = DataSet.Tables10;
        this.DescriptionList = DataSet.Tables11;
        this.WidthList = DataSet.Tables12;
        this.ColorList = DataSet.Tables13;
        this.PackagingList = DataSet.Tables14;
        this.UnitList = DataSet.Tables15;
        this.AAList = DataSet.Tables28;
        this.DeliveryConditionList = DataSet.Tables17;
        this.PartialShipmentList = DataSet.Tables18;
        this.PriceTermsList = DataSet.Tables19;
        this.ForceMajeureList = DataSet.Tables20;
        this.ArbitrationList = DataSet.Tables21;

        this.PINo = DataSet.Tables30[0].PINO;

        console.log(DataSet);

        if (this.SetDDL) {
          this.SetDDLDefaultValue();
        }

        // If we have a temp PI (from another tab), load its full data for edit
        if (this.tempPI) {
          // attempt to load by PINo or by id depending on value
          this.loadPIForEdit(this.tempPI);
        }
      } else {
        if (res.msg == 'Invalid Token') {
          this.gs.Logout();
        } else {
        }
      }
    });
  }

  Save(): void {
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
      { key: 'Delivery_Condition_ID', label: 'Delivery Condition' },
      { key: 'Shipment_Condition_ID', label: 'Partial Shipment' },
      { key: 'Price_Term_ID', label: 'Price Terms' },
      { key: 'Documents', label: 'Documents' },
      { key: 'Loading_Port', label: 'Port Of Loading' },
      { key: 'Destination_Port', label: 'Port Of Destination' },
      { key: 'Force_Majeure_ID', label: 'Force Majeure' },
      { key: 'Arbitration_ID', label: 'Arbitration' },
    ];

    let missingFields: string[] = [];
    requiredFields.forEach((field) => {
      const value = this.Formgroup.controls[field.key]?.value;
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        value === 0
      ) {
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
          { key: 'Item_ID', label: 'A. A.' },
        ];
        itemRequired.forEach((col) => {
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
        html:
          'Please fill the following fields:<br><ul style="text-align:left">' +
          missingFields.map((f) => `<li>${f}</li>`).join('') +
          '</ul>',
      });
      return;
    }

    const consigneeValue = this.Formgroup.controls['Customer_ID'].value;
    const consignee =
      this.ConsigneeList && this.ConsigneeList.length > 0
        ? this.ConsigneeList.find(
            (x: any) =>
              x.Customer_ID == consigneeValue || x.Consignee == consigneeValue,
          )
        : null;
    const roleId = this.gs.getSessionData('roleId');
    const userId = this.gs.getSessionData('userId');
    if (consignee) {
      if (roleId == 1 || roleId == 2 || roleId == 12) {
        this.Formgroup.controls['User_ID']?.setValue(consignee.Created_By);
      } else {
        this.Formgroup.controls['User_ID']?.setValue(userId);
      }
      this.Formgroup.controls['Superior_ID']?.setValue(consignee.Superior_ID);
    }

    let model = {
      PI_Master_ID: this.Formgroup.controls['PI_Master_ID'].value,
      PINo: this.Formgroup.controls['PINo'].value,
      Consignee_Initial: this.Formgroup.controls['Consignee_Initial'].value,
      Date: this.Formgroup.controls['Date'].value,
      Beneficiary_Account_ID:
        this.Formgroup.controls['Beneficiary_Account_ID'].value,
      Beneficiary_Bank_ID: this.Formgroup.controls['Beneficiary_Bank_ID'].value,
      Country_Of_Orgin_ID: this.Formgroup.controls['Country_Of_Orgin_ID'].value,
      Packing_ID: this.Formgroup.controls['Packing_ID'].value,
      Loading_Mode_ID: this.Formgroup.controls['Loading_Mode_ID'].value,
      Payment_Term_ID: this.Formgroup.controls['Payment_Term_ID'].value,
      Consignee: this.Formgroup.controls['Consignee'].value,
      Contact_Person: this.Formgroup.controls['Contact_Person'].value,
      Buyer_ID: this.Formgroup.controls['Buyer_ID'].value,
      Buyer_Name: this.Formgroup.controls['Buyer_Name'].value,
      Delivery_Address: this.Formgroup.controls['Delivery_Address'].value,
      Style: this.Formgroup.controls['Style'].value,
      Delivery_Condition_ID:
        this.Formgroup.controls['Delivery_Condition_ID'].value,
      Shipment_Condition_ID:
        this.Formgroup.controls['Shipment_Condition_ID'].value,
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
      ExpireDate: this.Formgroup.controls['ExpireDate'].value,
      Terms_of_Delivery_ID:
        this.Formgroup.controls['Terms_of_Delivery_ID'].value,
      IsBuyerMandatory: this.Formgroup.controls['IsBuyerMandatory'].value,
      Customer_Bank_ID: this.Formgroup.controls['Customer_Bank_ID'].value,
    };
    // let details=this.Formgroup.value.ItemArray;
    const detailsRaw =
      this.Formgroup.value && this.Formgroup.value.ItemArray
        ? this.Formgroup.value.ItemArray
        : [];
    let details: any[] = JSON.parse(JSON.stringify(detailsRaw));

    details.forEach((element: any) => {
      if (
        element &&
        Object.prototype.hasOwnProperty.call(element, 'PI_Detail_ID')
      ) {
        try {
          delete element.PI_Detail_ID;
        } catch (e) {
          /* ignore */
        }
      }

      if (element.Unit_ID == 2) {
        element.Quantity_In_Meter = element.Quantity;
        element.Quantity = element.Quantity_In_Meter * 1.09361;
      }
    });

    this.service
      .SaveDataMasterDetails(
        details,
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
            this.gs.Logout();
          } else {
            Swal.fire(res.messageType, res.message, 'info');
          }
        }
      });
  }

  // Determine whether the form is editing an existing PI (true) or creating a new one (false)
  isEditMode(): boolean {
    try {
      if (!this.Formgroup) return false;
      const id = (this.Formgroup.controls as any)['PI_Master_ID']?.value;
      return !!(id && id !== '' && id !== 0) || !!this.tempPI;
    } catch (e) {
      return !!this.tempPI;
    }
  }

  // Update behaves similarly to Save but asks for user confirmation and is used when editing
  Update(): void {
    // basic guard
    if (!this.Formgroup) return;

    Swal.fire({
      title: 'Confirm Update',
      text: 'Are you sure you want to update this Proforma Invoice?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        let model = {
          PI_Master_ID: this.Formgroup.controls['PI_Master_ID'].value,
          PINo: this.Formgroup.controls['PINo'].value,
          Consignee_Initial: this.Formgroup.controls['Consignee_Initial'].value,
          Date: this.Formgroup.controls['Date'].value,
          Beneficiary_Account_ID:
            this.Formgroup.controls['Beneficiary_Account_ID'].value,
          Beneficiary_Bank_ID:
            this.Formgroup.controls['Beneficiary_Bank_ID'].value,
          Country_Of_Orgin_ID:
            this.Formgroup.controls['Country_Of_Orgin_ID'].value,
          Packing_ID: this.Formgroup.controls['Packing_ID'].value,
          Loading_Mode_ID: this.Formgroup.controls['Loading_Mode_ID'].value,
          Payment_Term_ID: this.Formgroup.controls['Payment_Term_ID'].value,
          Consignee: this.Formgroup.controls['Consignee'].value,
          Contact_Person: this.Formgroup.controls['Contact_Person'].value,
          Buyer_ID: this.Formgroup.controls['Buyer_ID'].value,
          Buyer_Name: this.Formgroup.controls['Buyer_Name'].value,
          Delivery_Address: this.Formgroup.controls['Delivery_Address'].value,
          Style: this.Formgroup.controls['Style'].value,
          Delivery_Condition_ID:
            this.Formgroup.controls['Delivery_Condition_ID'].value,
          Shipment_Condition_ID:
            this.Formgroup.controls['Shipment_Condition_ID'].value,
          Price_Term_ID: this.Formgroup.controls['Price_Term_ID'].value,
          Good_Description: this.Formgroup.controls['Good_Description'].value,
          Documents: this.Formgroup.controls['Documents'].value,
          Shipping_Marks: this.Formgroup.controls['Shipping_Marks'].value,
          Loading_Port: this.Formgroup.controls['Loading_Port'].value,
          Destination_Port: this.Formgroup.controls['Destination_Port'].value,
          Remarks: this.Formgroup.controls['Remarks'].value,
          Force_Majeure_ID: this.Formgroup.controls['Force_Majeure_ID'].value,
          Arbitration_ID: this.Formgroup.controls['Arbitration_ID'].value,
          // Preserve original status on update if available to avoid accidentally changing PI status
          Status:
            this.originalMaster && this.originalMaster.Status
              ? this.originalMaster.Status
              : this.Formgroup.controls['Status'].value,
          User_ID: this.gs.getSessionData('userId'),
          Superior_ID: this.gs.getSessionData('userId'),
          Customer_ID: this.Formgroup.controls['Customer_ID'].value,
          IsMPI: this.Formgroup.controls['IsMPI'].value,
          LastUpdateDate: this.Formgroup.controls['LastUpdateDate'].value,
          ExpireDate: this.Formgroup.controls['ExpireDate'].value,
          Terms_of_Delivery_ID:
            this.Formgroup.controls['Terms_of_Delivery_ID'].value,
          IsBuyerMandatory: this.Formgroup.controls['IsBuyerMandatory'].value,
          Customer_Bank_ID: this.Formgroup.controls['Customer_Bank_ID'].value,
        };

        let details = this.Formgroup.value.ItemArray;

        details.forEach((element: any) => {
          if (element.Unit_ID == 2) {
            element.Quantity_In_Meter = element.Quantity;
            element.Quantity = element.Quantity_In_Meter * 1.09361;
          }
        });

        const whereParams = { PI_Master_ID: model.PI_Master_ID };

        this.des
          .UpdateDataMasterDetails(
            details,
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
}
