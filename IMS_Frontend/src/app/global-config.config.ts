import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export class GlobalConfig {

    public static BASE_URL_USERMANAGE = 'https://localhost:44372/api/';
  public static LOGIN_URL_USERMANAGE = 'http://localhost:4200/login';

    public static BASE_URL = 'http://localhost:5077/api/';
 public static BASE_URL_REPORT = 'http://localhost:5077/';

  // public static BASE_URL_USERMANAGE = 'http://163.47.146.42:8092/DB/api/';
  //  public static LOGIN_URL_USERMANAGE = 'http://163.47.146.42:8092/login';
  //  public static BASE_URL = 'http://163.47.146.42:9001/DB/api/';
  //  public static BASE_URL_REPORT = 'http://163.47.146.42:9001/DB/';


  public static USER_NAME = '';
  public static COMPANY_NAME = '';

  public static handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occured : ${err.error.message}`;
    } else {
      errorMessage = `server returned code: ${err.status}, error message is : ${err.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
