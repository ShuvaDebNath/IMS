import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-generate-pi',
  templateUrl: './pi-list.component.html',
  styleUrls: ['./pi-list.component.css'],
})
export class GeneratePiComponent implements OnInit {
  datePipe = new DatePipe('en-US');
  DataTable!:any[];
  PIData!:any;
  PIDetails!:any[];
  // Totals for PI details table
  totalsOrderQty: number = 0;
  totalsDeliveredQty: number = 0;
  totalsAmount: number = 0;
  totalsProdCost: number = 0;
  totalsRolls: number = 0;
  PITypeList:any[]=[{value:1,text:'LC'},{value:2,text:'Cash'}];
  first: any=1;
  rows: any=10;
  totalRecords!: number;
  isViewDetails: boolean=false;  
  PageTitle: any;

  ShowbtnPar:boolean=false;
  ShowbtnQar:boolean=false;
  ShowbtnFull:boolean=false;
  ShowbtnRej:boolean=false;
  ShowbtnSpecial:boolean=false;

  SearchFormgroup!: FormGroup;
  selectedRows: any[] = []; 

  insertPermissions: boolean = true;
  updatePermissions: boolean = true;
  deletePermissions: boolean = true;
  printPermissions: boolean = true;
  allPermissions: boolean = true;

   isDeliveryDetailsVisible = false;
   deliveryDetailsData: any = null;
  // Delivery totals
  deliveryTotalsOrdered: number = 0;
  deliveryTotalsDelivered: number = 0;
  deliveryTotalsOrderedMeter: number = 0;
  deliveryTotalsDeliveredMeter: number = 0;
  deliveryTotalsRolls: number = 0;

  specialApprovalMaxDeliverable: number = 0;
  isSpecialApprovalVisible: boolean = false;
  specialApprovalSaveEnabled: boolean = false;


  ShipperList: any|[];
  BenificaryBankList: any|[];
  CountryList: any|[];
  PackingList: any|[];
  LoadingModeList: any|[];
  PaymentModeList: any|[];
  ConsigneeList: any|[];
  ApplicantBankList: any|[];
  BuyingHouseList: any|[];
  TermsofDeliveryList: any|[];
  DescriptionList: any|[];
  WidthList: any|[];
  ColorList: any|[];
  PackagingList: any|[];
  UnitList: any|[];
  AAList: any|[];
  DeliveryConditionList: any|[];
  PartialShipmentList: any|[];
  PriceTermsList: any|[];
  ForceMajeureList: any|[];
  ArbitrationList: any|[];
  PINo!:string;

  Formgroup!: FormGroup;
  isSubmit!: boolean;
  SetDDL:boolean=true;
  GTQTY: any=0;
  GTAMNT: any=0;

  constructor( private service:MasterEntryService,
    private gs: GlobalServiceService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.SetDDL=true;
    this.GenerateFrom(); 
    this.GetInitialData();
    this.BuyerToggle(false);
    this.RegisterFormControlsChangeEvent();    
    this.GTQTY=0;
    this.GTAMNT=0;
  }

  RegisterFormControlsChangeEvent(){
    this.Formgroup.get('IsBuyerMandatory')?.valueChanges.subscribe(value => {
      this.BuyerToggle(value);
    });

    this.Formgroup.get('Consignee_Initial')?.valueChanges.subscribe(value => {
      let piNo= value? `${value}-${this.PINo}`: this.PINo;
      this.Formgroup.controls["PINo"].setValue(piNo);
    });

    this.Formgroup.get('Customer_ID')?.valueChanges.subscribe(value => {
      let contactPerson=this.ConsigneeList.filter((x:any)=>x.Customer_ID==value)[0];
      this.Formgroup.controls["Contact_Person"].setValue(contactPerson.Contact_Name);
    });

  }


  BuyerToggle(value:boolean){
      if(value){
        this.Formgroup.get('Buyer_ID')?.enable();
      }else{
        this.Formgroup.get('Buyer_ID')?.disable();
      }
  }

  GenerateFrom() {
    this.Formgroup = this.fb.group({
      PI_Master_ID: [''],
      PINo: [''],
      Consignee_Initial: ['',[Validators.required,Validators.minLength(3),Validators.maxLength(3)]],
      Date: [this.datePipe.transform(new Date, 'MM/dd/yyyy')],
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
      Delivered_Quantity_In_Meter: [0]
    });
  }
  SetActualArticle(itemrow:any){ 
    let articleID=itemrow.controls["Item_ID"].value;
    let articleNo=this.AAList.filter((x:any)=>x.Item_ID==articleID)[0].Article_No;
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
    if (con != null && con.length>1) {
        con.removeAt(index);
        this.calculatetotalGrandTotal();
    }
  }

  RemoveLast() {
    const con = <FormArray>this.Formgroup.controls['ItemArray'];
    if (con != null && con.length>1) {
        con.removeAt(con.length-1);
        this.calculatetotalGrandTotal();
    }
  }
  calculateAmount(itemrow:any){
    let qty=itemrow.controls["Quantity"].value;
    let rate=itemrow.controls["Unit_Price"].value;
    let proCostUnti=itemrow.controls["CommissionUnit"].value;
    itemrow.controls["Total_Amount"].setValue(qty*rate);
    itemrow.controls["TotalCommission"].setValue(qty*proCostUnti);
    this.calculatetotalGrandTotal();
  }
OpenSpecialApprove(Id:number){
  this.isSpecialApprovalVisible = true;
  this.specialApprovalMaxDeliverable = 0; // Reset percentage for each row
  this.specialApprovalSaveEnabled = false; // Reset save button state
  this.ViewDetails(Id, true);
}
  ViewDetails(Id:number, fromSpecialApprove: boolean = false){
    const procedureData = {
        procedureName: 'usp_ProformaInvoice_GetDataById',
        parameters: {
          PI_Master_ID :Id
        }
      };
   
    this.isViewDetails = !fromSpecialApprove;
    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.PIDetails = JSON.parse(results.data).Tables1;
          this.PIData = this.PIDetails[0];
          console.clear();
          console.log(this.PIData);
          // compute totals for details
          this.computePidTotals();
        } else if (results.msg == 'Invalid Token') {
          Swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        }
      },
      error: (err) => { },
    });
  }

  isInvalid(itemrow:any,controlName:any){
    if (itemrow.controls[controlName].invalid && (itemrow.controls[controlName].touched||this.isSubmit)) {
      return true;
    }else{
      return false;
    }
  }

  SetDDLDefaultValue():void{
        this.Formgroup.controls["Beneficiary_Account_ID"].setValue(1);
        this.Formgroup.controls["Beneficiary_Bank_ID"].setValue(1);
        this.Formgroup.controls["Country_Of_Orgin_ID"].setValue(1);
        this.Formgroup.controls["Packing_ID"].setValue(1);
        this.Formgroup.controls["Loading_Mode_ID"].setValue(1);
        this.Formgroup.controls["Payment_Term_ID"].setValue(1);
        this.Formgroup.controls["Terms_of_Delivery_ID"].setValue(1);
        this.Formgroup.controls["Delivery_Condition_ID"].setValue(3);
        this.Formgroup.controls["Shipment_Condition_ID"].setValue(1);
        this.Formgroup.controls["Price_Term_ID"].setValue(1);
        this.Formgroup.controls["PINo"].setValue(this.PINo);
  }
  

  RefrashDDL():void{
    this.SetDDL=false;
    this.GetInitialData()
  }

  GetInitialData():void{
    this.ShipperList=[];
    let model=new GetDataModel();
    model.procedureName="usp_ProformaInvoice_GetInitialData";
    model.parameters={
      userID:this.gs.getSessionData('userId'),
      roleID:this.gs.getSessionData('roleId'),
      PaymentType:2
    };
    this.service.GetInitialData(model).subscribe((res:any) => {
      if (res.status) {

        let DataSet = JSON.parse(res.data);
        
        this.ShipperList=DataSet.Tables1;
        this.BenificaryBankList=DataSet.Tables2;
        this.CountryList=DataSet.Tables3;
        this.PackingList=DataSet.Tables4;
        this.LoadingModeList=DataSet.Tables5;
        this.PaymentModeList=DataSet.Tables6;
        this.ConsigneeList=DataSet.Tables7;
        this.ApplicantBankList=DataSet.Tables8;
        this.BuyingHouseList=DataSet.Tables9;
        this.TermsofDeliveryList=DataSet.Tables10;
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

        this.PINo=DataSet.Tables30[0].PINO;

        if (this.SetDDL){
          this.SetDDLDefaultValue();
        }

      } else {
        if (res.msg == 'Invalid Token') {
          this.gs.Logout();
        } else {
        }
      }
    });    
  }


  Save():void{
    let model= {
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
      User_ID: this.gs.getSessionData('userId'),
      Superior_ID: this.gs.getSessionData('userId'),
      Customer_ID: this.Formgroup.controls['Customer_ID'].value,
      IsMPI: this.Formgroup.controls['IsMPI'].value,      
      LastUpdateDate: this.Formgroup.controls['LastUpdateDate'].value,
      ExpireDate: this.Formgroup.controls['ExpireDate'].value,
      Terms_of_Delivery_ID: this.Formgroup.controls['Terms_of_Delivery_ID'].value,  
      IsBuyerMandatory: this.Formgroup.controls['IsBuyerMandatory'].value,    
      Customer_Bank_ID: this.Formgroup.controls['Customer_Bank_ID'].value
    };

    let details=this.Formgroup.value.ItemArray;

    details.forEach((element:any) => {
      if(element.Unit_ID==2){
        element.Quantity_In_Meter=element.Quantity;
        element.Quantity=element.Quantity_In_Meter*1.09361;
      }
    });

    this.service.SaveDataMasterDetails(details,
      "tbl_pi_detail",
      model,
      "tbl_pi_master",
      "PI_Master_ID",
      "PI_Master_ID",
      "tbl_pi_master",
      "PI_Master_ID"
    ).subscribe(res=>{
      if(res.messageType=='Success' && res.status){
        Swal.fire(res.messageType, res.message, 'success').then(()=>{
              this.ngOnInit();
        });
        
      }else{
        if(!res.isAuthorized){
          this.gs.Logout();
        }else{
          Swal.fire(res.messageType, res.message, 'info');
        }
      }
    });

  }
  saveSpecialApproval() {
    const status = this.PIData?.Status || 'Partial Approved';
    const percent = this.specialApprovalMaxDeliverable;
    let valid = false;
    let min = 0, max = 0;
    if (status === 'Partial Approved') {
      min = 21; max = 49;
      valid = percent >= min && percent <= max;
    } else if (status === 'Quartar Approved') {
      min = 51; max = 99;
      valid = percent >= min && percent <= max;
    } else {
      valid = true;
    }
    if (!valid) {
      let msg = '';
      if (status === 'Partial Approved') {
        msg = 'For Partial Approved, please enter a percentage between 21 and 49.';
      } else if (status === 'Quartar Approved') {
        msg = 'For Quartar Approved, please enter a percentage between 51 and 99.';
      } else {
        msg = 'Invalid percentage.';
      }
      Swal.fire('Invalid Percentage', msg, 'error');
      return;
    }
    // Simulate API call for saving
    var convertActualPercent = percent / 100;

     const updateParams = { CustomMaxDeliveryPercentage: convertActualPercent };
     const updateCondition = { PI_Master_ID: this.PIData?.PI_Master_ID };
     const updateTable = 'tbl_pi_master';

    this.service.UpdateData(updateParams, updateCondition, updateTable).subscribe({
      next: (res: any) => {
        if (res.status) {
          Swal.fire('Success', 'Special approval saved successfully.', 'success');
          this.isSpecialApprovalVisible = false;
        } else {
          Swal.fire('Failed', 'Failed to save special approval.', 'error');
        }
      },
      error: () => {
        Swal.fire('Failed', 'Failed to save special approval.', 'error');
      }
    });
  }
  validateSpecialApprovalPercentage() {
    const status = this.PIData?.Status || 'Partial Approved';
    const percent = this.specialApprovalMaxDeliverable;
    let valid = false;
    let min = 0, max = 0;
    if (status === 'Partial Approved') {
      min = 21; max = 49;
      valid = percent >= min && percent <= max;
    } else if (status === 'Quartar Approved') {
      min = 51; max = 99;
      valid = percent >= min && percent <= max;
    } else {
      valid = true;
    }
    this.specialApprovalSaveEnabled = valid;
    if (!valid) {
      let msg = '';
      if (status === 'Partial Approved') {
        msg = 'For Partial Approved, please enter a percentage between 21 and 49.';
      } else if (status === 'Quartar Approved') {
        msg = 'For Quartar Approved, please enter a percentage between 51 and 99.';
      } else {
        msg = 'Invalid percentage.';
      }
      Swal.fire('Invalid Percentage', msg, 'warning');
      this.specialApprovalMaxDeliverable = 0;
    }
  }
    
}
