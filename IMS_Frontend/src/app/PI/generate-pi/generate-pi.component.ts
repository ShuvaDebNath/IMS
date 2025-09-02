import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DoubleMasterEntryModel } from 'src/app/models/DoubleMasterEntryModel';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { PIDetails } from 'src/app/models/PIDetails';
import { PIMaster } from 'src/app/models/PIMaster';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import swal from 'sweetalert2';



@Component({
  selector: 'app-generate-pi',
  templateUrl: './generate-pi.component.html',
  styleUrls: ['./generate-pi.component.css'],
})
export class GeneratePiComponent implements OnInit {
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

    this.Formgroup.get('IsBuyerMandatory')?.valueChanges.subscribe(value => {
      this.BuyerToggle(value);
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
      Date: [new Date()],
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
      ActualArticle: [''],
      Unit_ID: [''],
    });
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

  calculatetotalGrandTotal() {
    this.GTQTY=0;this.GTAMNT=0;
    const itemArray = this.Formgroup.get('ItemArray') as FormArray;
    itemArray.controls.forEach(control => {
      this.GTQTY+=control.value.Quantity;
      this.GTAMNT+=control.value.Total_Amount;
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
  }
  

  RefrashDDL():void{
    this.SetDDL=false;
    this.GetInitialData()
  }

  GetInitialData():void{
    this.ShipperList=[];
    let model=new GetDataModel();
    model.procedureName="usp_ProformaInvoice_GetInitialData";
    model.parameters={};
    this.service.GetInitialData(model).subscribe((res:any) => {
      if (res.status) {

        let DataSet = JSON.parse(res.data);

        this.ShipperList.push(DataSet.Tables1[0]);
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
        this.AAList=DataSet.Tables16;
        this.DeliveryConditionList=DataSet.Tables17;
        this.PartialShipmentList=DataSet.Tables18;
        this.PriceTermsList=DataSet.Tables19;
        this.ForceMajeureList=DataSet.Tables20;
        this.ArbitrationList=DataSet.Tables21;

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

    const datePipe = new DatePipe('en-US');
    model.PINo=`${model.Consignee_Initial}-${datePipe.transform(model.Date, 'yyyyMMdd')}`;

    this.service.SaveDataMasterDetails(this.Formgroup.value.ItemArray,
      "tbl_pi_detail",
      model,
      "tbl_pi_master",
      "PI_Master_ID",
      "PI_Master_ID",
      "tbl_pi_master",
      "PINo"
    ).subscribe(res=>{
      console.log(res);
    });

  }


}
