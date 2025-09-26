import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {  HttpClient,  HttpHeaders,} from '@angular/common/http';
import { GlobalConfig } from '../../global-config.config';
import { GlobalServiceService } from '../../services/Global-service.service';
import { map } from 'rxjs/operators';
import { ResponseModel } from 'src/app/models/ResponseModel';
import { DoubleMasterEntryModel } from 'src/app/models/DoubleMasterEntryModel';


export interface MasterDetailsPayload {
  TableNameMaster: string;
  TableNameChild: string;
  ColumnNamePrimary: string;
  ColumnNameForign: string;
  ColumnNameSerialNo: string;
  SerialType: string;
  Data: any;
  DetailsData: any[];
  WhereParams: Record<string, any>;
}


@Injectable({
  providedIn: 'root'
})
export class DoubleMasterEntryService {

  readonly baseUrlApi = GlobalConfig.BASE_URL;
  readonly baseUrl = GlobalConfig.BASE_URL_REPORT;
  readonly postApiController: string="DoubleMasterEntry";
  token:any;
  readonly getapiController = 'GetData';

  constructor(
    private router: Router,
    private http: HttpClient,
    private gs: GlobalServiceService
  ) {
    this.token = gs.getSessionData('token');
  }


  public SaveData(fd: any, tableName: any) {
    let model: DoubleMasterEntryModel=new DoubleMasterEntryModel();
    model.tableNameChild=tableName;
    model.detailsData=fd;

    return this.http
      .post<ResponseModel>(
        this.baseUrlApi + this.postApiController + '/InsertListData',
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


  public SaveDataMasterDetails
        (fd: any, tableName: any,fdMaster:any,tableNameMaster: any,primaryColumnName: any,ColumnNameForign: any,serialType:any,ColumnNameSerialNo:any) {
    let model: DoubleMasterEntryModel=new DoubleMasterEntryModel();

    model.tableNameMaster = tableNameMaster;
    model.tableNameChild=tableName;

    model.columnNamePrimary = primaryColumnName;
    model.columnNameForign = ColumnNameForign;
    model.columnNameSerialNo = ColumnNameSerialNo;
    model.serialType = serialType;
    model.isFlag = null;
    model.detailsData=fd;
    model.data  =fdMaster;
    model.whereParams = null;

    return this.http
      .post<ResponseModel>(
        this.baseUrlApi + this.postApiController + '/Insert',
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
  public SaveDataMasterDetailsGetId
        (fd: any, tableName: any,fdMaster:any,tableNameMaster: any,primaryColumnName: any,ColumnNameForign: any,serialType:any,ColumnNameSerialNo:any) {
    let model: DoubleMasterEntryModel=new DoubleMasterEntryModel();

    model.tableNameMaster = tableNameMaster;
    model.tableNameChild=tableName;

    model.columnNamePrimary = primaryColumnName;
    model.columnNameForign = ColumnNameForign;
    model.columnNameSerialNo = ColumnNameSerialNo;
    model.serialType = serialType;
    model.isFlag = null;
    model.detailsData=fd;
    model.data  =fdMaster;
    model.whereParams = null;

    return this.http
      .post<ResponseModel>(
        this.baseUrlApi + this.postApiController + '/InsertGetId',
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


  public SaveDataMasterDetailsList(fd: any, tableName: any,fdMaster:any,tableNameMaster: any,primaryColumnName: any,ColumnNameForign: any,serialType:any,ColumnNameSerialNo:any) {
   
    let model: DoubleMasterEntryModel=new DoubleMasterEntryModel();

    model.tableNameMaster = tableNameMaster;
    model.tableNameChild=tableName;

    model.columnNamePrimary = primaryColumnName;
    model.columnNameForign = ColumnNameForign;
    model.columnNameSerialNo = ColumnNameSerialNo;
    model.serialType = serialType;
    model.isFlag = null;
    model.detailsData=fd;
    model.data  =fdMaster;
    model.whereParams = null;

    return this.http
      .post<ResponseModel>(
        this.baseUrlApi + this.postApiController + '/InsertListData',
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

  public SaveDataMasterDetailsWithReferenceTableUpdate
        ( fd: any, 
          tableName: any,
          fdMaster:any,
          tableNameMaster: any,
          primaryColumnName: any,
          ColumnNameForign: any,
          serialType:any,
          ColumnNameSerialNo:any,
          Whereparam:any,
          Status:any) {
    let model: DoubleMasterEntryModel=new DoubleMasterEntryModel();

    model.tableNameMaster = tableNameMaster;
    model.tableNameChild=tableName;

    model.columnNamePrimary = primaryColumnName;
    model.columnNameForign = ColumnNameForign;
    model.columnNameSerialNo = ColumnNameSerialNo;
    model.serialType = serialType;
    model.isFlag = null;
    model.detailsData=fd;
    model.data  =fdMaster;
    model.whereParams = Whereparam;
    model.Status=Status;

    return this.http
      .post<ResponseModel>(
        this.baseUrlApi + this.postApiController + '/Insert',
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


  public UpdateDataMasterDetails(fd: any, tableName: any,fdMaster:any,tableNameMaster: any,primaryColumnName: any,ColumnNameForign: any,serialType:any,ColumnNameSerialNo:any,Whereparam:any) {
    let model: DoubleMasterEntryModel=new DoubleMasterEntryModel();

    model.tableNameMaster = tableNameMaster;
    model.tableNameChild=tableName;

    model.columnNamePrimary = primaryColumnName;
    model.columnNameForign = ColumnNameForign;
    model.columnNameSerialNo = ColumnNameSerialNo;
    model.serialType = serialType;
    model.isFlag = null;
    model.detailsData=fd;
    model.data  =fdMaster;
    model.whereParams = Whereparam;

    return this.http
      .post<ResponseModel>(
        this.baseUrlApi + this.postApiController + '/Update',
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

  public DeleteDataMasterDetails(fd: any, tableName: any,fdMaster:any,tableNameMaster: any,primaryColumnName: any,ColumnNameForign: any,serialType:any,ColumnNameSerialNo:any,Whereparam:any) {
    let model: DoubleMasterEntryModel=new DoubleMasterEntryModel();

    model.tableNameMaster = tableNameMaster;
    model.tableNameChild=tableName;

    model.columnNamePrimary = primaryColumnName;
    model.columnNameForign = ColumnNameForign;
    model.columnNameSerialNo = ColumnNameSerialNo;
    model.serialType = serialType;
    model.isFlag = null;
    model.detailsData=fd;
    model.data  =fdMaster;
    model.whereParams = Whereparam;

    return this.http
      .post<ResponseModel>(
        this.baseUrlApi + this.postApiController + '/Delete',
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
