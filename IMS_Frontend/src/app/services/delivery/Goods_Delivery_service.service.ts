import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {  HttpClient,  HttpHeaders,} from '@angular/common/http';
import { GlobalConfig } from '../../global-config.config';
import { GlobalServiceService } from '../../services/Global-service.service';
import { map } from 'rxjs/operators';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { DoubleMasterEntryModel } from 'src/app/models/DoubleMasterEntryModel';
import { MasterEntryModel } from 'src/app/models/MasterEntryModel';
import { GetDataModel } from 'src/app/models/GetDataModel';
import { MasterEntryWithSlUpdateModel } from 'src/app/models/MasterEntryWithSlUpdateModel ';


@Injectable({
  providedIn: 'root'
})
export class Goods_Delivery_serviceService {
  readonly baseUrlApi = GlobalConfig.BASE_URL;
  readonly baseUrl = GlobalConfig.BASE_URL_REPORT;
  readonly postApiController: string="GoodsDelivery";
  token:any;
  readonly getapiController = 'GetData';

  constructor(
    private router: Router,
    private http: HttpClient,
    private gs: GlobalServiceService
  ) {
    this.token = gs.getSessionData('token');
  }

  
  public SaveData(fd: any) {
   

    return this.http
      .post<ResponseModel>(
        this.baseUrlApi + this.postApiController + '/Insert',
        fd,
        {
          headers: new HttpHeaders({
            Authorization: 'Bearer ' + this.token,
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(
        map((Response) => {
          return Response;
        })
      );
  }

}
