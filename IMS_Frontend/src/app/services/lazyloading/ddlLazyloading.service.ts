import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalConfig } from 'src/app/global-config.config';
import { GlobalServiceService } from '../Global-service.service';
import { map } from 'rxjs/operators';
import { DDLSearchModel } from 'src/app/models/DDLSearchModel';
import { GetDataModel } from 'src/app/models/GetDataModel';

export interface ModelDDL {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class DdlLazyloadingService {

    readonly baseUrlApi = GlobalConfig.BASE_URL;
    readonly baseUrl = GlobalConfig.BASE_URL_REPORT;
    readonly postApiController: string="DoubleMasterEntry";
    readonly postApiMasterEntryController: string="MasterEntry";
    token:any;
    readonly getapiController = 'GetData';

  constructor(
    private http: HttpClient,
    private gs: GlobalServiceService
  ) {
    this.token = gs.getSessionData('token');
  }
  public GetCountryDDLLazyLoad(first: number|undefined, rows: number|undefined, filter: string = '') {
    console.log('asdfsdf');
    var model=new GetDataModel();
    model.procedureName="GetCountryLazyLoad";
    model.parameters={first:first,rows:rows,filter:filter};
    let url=`${this.baseUrlApi}${this.getapiController}/GetAllData`;


    return this.http
      .post<ModelDDL>(url,model,
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
