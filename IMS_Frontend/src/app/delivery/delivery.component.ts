import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import Swal from 'sweetalert2';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { DropdownChangeEvent, DropdownModule } from "primeng/dropdown";
import { MasterEntryService } from 'src/app/services/masterEntry/masterEntry.service';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { InputNumberModule } from 'primeng/inputnumber';
import { Goods_Delivery_serviceService } from '../services/delivery/Goods_Delivery_service.service';

@Component({
  standalone:true,
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css'],
  imports: [FormsModule, InputTextModule , InputNumberModule, ReactiveFormsModule, CommonModule, TableModule, ButtonModule, DividerModule, FieldsetModule, DropdownModule]
})
export class DeliveryComponent implements OnInit {



  PITypeList:any[]=[{value:1,text:'LC'},{value:2,text:'Cash'}];
  PIList:any[]=[];  
  StoreLocation:any[]=[];
  PITypeID!:number;
  SearchFormgroup!: FormGroup;
  Formgroup!: FormGroup;
  Delivers!:[];
  datePipe = new DatePipe('en-US');

  constructor(
    private service:MasterEntryService,
    private deliveryService:Goods_Delivery_serviceService,
    private getDataService: GetDataService,
    private gs: GlobalServiceService,
    private title: Title,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.title.setTitle('Delivery');
    this.GenerateSearchFrom();
  }

  GenerateSearchFrom() {
    this.SearchFormgroup = this.fb.group({
      PINo: [''],
      PIId: [''],
      PIType: ['']
    });

    this.Formgroup = this.fb.group({
      PIStatus:[''],
      RestQty:[''],
      LCNo:[''],
      IsCash:[''],

      ItemArray:this.fb.array([]),
    });    


  }

    getControls() {
    return (this.Formgroup.get('ItemArray') as FormArray).controls;
  }


  onChange($event: DropdownChangeEvent) {

    let model=new GetDataModel();
      model.procedureName="usp_Get_Delivery_Initial_Data";
      model.parameters={
        TypeId:$event.value
      };
      this.service.GetInitialData(model).subscribe((res:any) => {
        if (res.status) {  
          let DataSet = JSON.parse(res.data);
          this.PIList=DataSet.Tables1;
          this.StoreLocation=DataSet.Tables2;
  
        } else {
          if (res.msg == 'Invalid Token') {
            this.gs.Logout();
          } else {
          }
        }
      });    
  }
  SetMeterValue(event:any,item:any){
    console.log(event.target.value);
    let unitID=item.controls["Unit_ID"].value;
    let value= unitID==2? event.target.value*1.09361 : 0;
    item.controls["Deliverd_In_Meter"].setValue(value);
  }
  GetPIByPID() {
    let model=new GetDataModel();
      model.procedureName="usp_ProformaInvoice_DeliveryInfoByPIId";
      model.parameters={
        TypeId:this.SearchFormgroup.controls["PIId"].value
      };
      console.log(model);
      this.Formgroup.setControl('items', this.fb.array([]));

      this.service.GetInitialData(model).subscribe((res:any) => {
        if (res.status) {  
          let DataSet = JSON.parse(res.data);
          this.Delivers=DataSet.Tables1;
          
          this.Formgroup.controls['PIStatus'].setValue(DataSet.Tables1[0].IsMPI==0?'LC':'Cash');
          this.Formgroup.controls['RestQty'].setValue(DataSet.Tables1[0].Unit_ID==2 ? DataSet.Tables1[0].DeliverableQty_In_Meter : DataSet.Tables1[0].DeliverableQty);
          this.Formgroup.controls['LCNo'].setValue(DataSet.Tables1[0].LC_No);
          this.Formgroup.controls['IsCash'].setValue(DataSet.Tables1[0].CR_NO);

          let itemarray=this.Formgroup.get('ItemArray') as FormArray;
          
          DataSet.Tables1.forEach((item:any)=>{
           
            itemarray.push(this.fb.group({ 
              PI_Detail_ID: [item.PI_Detail_ID],
              Date: [new Date],
              Ordered: [0],
              Delivered: [0], 
              Roll: [0],
              Remark: [''],
              Chalan_No: [0],
              Item_ID: [item.Item_ID],
              Stock_Location_ID: [''],
              Description:[item.Description],
              Color:[item.Color],
              Packaging:[item.Packaging],
              Measurement:[item.Measurement],
              ActualArticle:[item.ActualArticle],
              UndeliveredQty:[item.Unit_ID==2?item.UndeliveredQty_In_Meter: item.UndeliveredQty],
              UnitName:[item.UnitName],
              Unit_ID:[item.Unit_ID],
              StockBalance:[item.Stock],
              Stock_In_MeterBalance:[item.Stock_In_Meter],
              RollBalance:[item.Roll],
              BagBalance:[item.Bag],
              Deliverd_In_Meter:[0],
            }));
          });
          
          
  
        } else {
          if (res.msg == 'Invalid Token') {
            this.gs.Logout();
          } else {
          }
        }
      });
  }

  Save() {
    console.log(this.Formgroup.controls['ItemArray'].value);
    let listData=this.Formgroup.controls['ItemArray'].value;
    let restQty=this.Formgroup.controls['RestQty'].value;
    let sum = 0;
    listData.forEach((element:any) => {
        sum+=element.Delivered;
        if(element.Unit_ID==2){
          element.Deliverd_In_Meter=element.Delivered;
          element.Delivered=element.Deliverd_In_Meter*1.09361;
        }
      });

      if(sum>restQty){
        Swal.fire('Save Fail!', 'Deliverable Excced.', 'info');
        return;
      }

    let unAllowedList=listData.filter((x:any)=> (x.Unit_ID!=2 && x.Delivered>x.StockBalance) || (x.Unit_ID==2 && x.Deliverd_In_Meter>x.Stock_In_MeterBalance));

    if(unAllowedList.length>0){
      Swal.fire('Save Fail!', 'Stock Unavailable.', 'info');
      return;
    }

 

     
    this.deliveryService.SaveData(listData).subscribe(res=>{
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

}
