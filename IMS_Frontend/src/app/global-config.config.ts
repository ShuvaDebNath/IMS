import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export class GlobalConfig {

  public static BASE_URL_USERMANAGE = 'http://localhost:5077/api/';
  public static LOGIN_URL_USERMANAGE = 'http://localhost:5077/login';

  public static BASE_URL = 'http://localhost:5077/api/';
  public static BASE_URL_REPORT = 'http://localhost:5077/';

  // public static BASE_URL_USERMANAGE = 'http://119.18.147.187:5077/DB/api/';
  //  public static LOGIN_URL_USERMANAGE = 'http://119.18.147.187:5077/DB/login';
  //  public static BASE_URL = 'http://119.18.147.187:5077/DB/api/';
  //  public static BASE_URL_REPORT = 'http://119.18.147.187:5077/DB/';


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
