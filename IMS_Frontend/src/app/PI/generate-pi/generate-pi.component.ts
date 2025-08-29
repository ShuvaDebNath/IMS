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
        console.log(res);
        console.log(DataSet);
        this.ShipperList.push(DataSet.Tables1[0]);
      } else {
        if (res.msg == 'Invalid Token') {
          this.gs.Logout();
        } else {
        }
      }
    });    
  }
}
