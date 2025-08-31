import { Component, OnInit } from '@angular/core';
import { GetDataModel } from 'src/app/models/GetDataModel';
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


  constructor( private service:MasterEntryService,
    private gs: GlobalServiceService
  ) {}

  ngOnInit(): void {    
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
      } else {
        if (res.msg == 'Invalid Token') {
          this.gs.Logout();
        } else {
        }
      }
    });    
  }
}
