import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {  HttpClient,  HttpHeaders,} from '@angular/common/http';
import { GlobalConfig } from '../../global-config.config';
import { GlobalServiceService } from '../../services/Global-service.service';
import { map } from 'rxjs/operators';
import { GetDataModel } from 'src/app/models/GetDataModel';

@Injectable({
  providedIn: 'root'
})
export class GetDataService {

  readonly baseUrlApi = GlobalConfig.BASE_URL;
  readonly baseUrl = GlobalConfig.BASE_URL_REPORT;
  token:any;
  readonly getapiController = 'GetData';

  constructor(
    private router: Router,
    private http: HttpClient,
    private gs: GlobalServiceService
  ) {
    this.token = gs.getSessionData('token');
  }

  public GetInitialData(model: GetDataModel){
     
      const token = localStorage.getItem('token');
      
      return this.http.post<any>(this.baseUrlApi+this.getapiController+'/GetInitialData',model,{
        headers: new HttpHeaders({
           Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }),
      })
      .pipe(map((Response)=> {return Response;}));
    }

}
