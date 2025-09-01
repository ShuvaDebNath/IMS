import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map} from "rxjs/operators";
import {GlobalConfig} from '../../global-config.config'
import { userDTO } from 'src/app/models/userDTO';
import { ResetPasswords } from 'src/app/models/ResetPasswords';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { GlobalServiceService } from '../Global-service.service';
@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {
  readonly baseUrl = GlobalConfig.BASE_URL;
  readonly apiControllerUser = 'User';
  readonly apiController = 'Accounts';
  token:any;
constructor(private http:HttpClient,
    private gs: GlobalServiceService) { 
  
    this.token = gs.getSessionData('token');
}

public GetBasicData(){
  let url='';
  url=this.baseUrl+this.apiController+'/';
  return this.http.get<any>(url).pipe(map((Response)=> Response));
}

public UserLogin(fd:any){
  let data= new userDTO;
  data.UserName = fd.userName;
  data.Password = fd.password;
  data.User_ID = "";
  data.Role_id = "";
  data.Superior_ID = "";
  data.Supplier_ID  = "";
  data.IsAuthorized = true;
  data.IsSupplier = true;

 

  
var test = this.baseUrl+this.apiController+'/Login';

  return this.http.post<any>(this.baseUrl+this.apiController+'/Login',data)
  .pipe(map((Response)=> Response));
}

public ResetPassword(fd: any) {
    let model: ResetPasswords=new ResetPasswords();
    model = fd; ;

    return this.http
      .post<ResponseModel>(
        this.baseUrl + this.apiControllerUser + '/ResetPassword',
        model,
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
