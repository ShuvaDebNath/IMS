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

@Component({
  standalone:true,
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css'],
  imports: [FormsModule, InputTextModule , ReactiveFormsModule, CommonModule, TableModule, ButtonModule, DividerModule, FieldsetModule, DropdownModule]
})
export class DeliveryComponent implements OnInit {


  PITypeList:any[]=[{value:1,text:'LC'},{value:2,text:'Cash'}];
  PIList:any[]=[];
  PITypeID!:number;
  SearchFormgroup!: FormGroup;
  Formgroup!: FormGroup;
  Delivers!:[];


  constructor(
    private service:MasterEntryService,
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
      PINo: [''],
      PIId: [''],
      PIType: ['']
    });    
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
  
        } else {
          if (res.msg == 'Invalid Token') {
            this.gs.Logout();
          } else {
          }
        }
      });    
  }

  GetPIByPID() {
    let model=new GetDataModel();
      model.procedureName="usp_ProformaInvoice_DeliveryInfoByPIId";
      model.parameters={
        TypeId:this.SearchFormgroup.controls["PIId"].value
      };
      console.log(model);

      this.service.GetInitialData(model).subscribe((res:any) => {
        if (res.status) {  
          let DataSet = JSON.parse(res.data);
          this.Delivers=DataSet.Tables1;
          console.log(this.Delivers);
  
        } else {
          if (res.msg == 'Invalid Token') {
            this.gs.Logout();
          } else {
          }
        }
      });
  }

}
