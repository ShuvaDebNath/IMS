import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { map} from "rxjs/operators";
import {GlobalConfig} from '../../global-config.config'
import { userDTO } from 'src/app/models/userDTO';
@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {
  readonly baseUrl = GlobalConfig.BASE_URL;
  readonly apiController = 'Accounts';
constructor(private http:HttpClient) { }

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

}
