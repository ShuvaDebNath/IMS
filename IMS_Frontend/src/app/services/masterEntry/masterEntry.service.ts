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
export class MasterEntryService {

  readonly baseUrlApi = GlobalConfig.BASE_URL;
  readonly baseUrl = GlobalConfig.BASE_URL_REPORT;
  readonly postApiController: string="DoubleMasterEntry";
  readonly postApiMasterEntryController: string="MasterEntry";
  token:any;
  readonly getapiController = 'GetData';

  constructor(
    private router: Router,
    private http: HttpClient,
    private gs: GlobalServiceService
  ) {
    this.token = gs.getSessionData('token');
  }

  public GetDataTable(model:MasterEntryModel) {
    return this.http
      .post<ResponseModel>(
        this.baseUrlApi + 'MasterEntry/GetAll',
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

  public GetEditData(model:MasterEntryModel) {
    return this.http
      .post<ResponseModel>(
        this.baseUrlApi + 'MasterEntry/GetByColumns',
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

  public SaveSingleData(fd: any, tableName: any) {
    let model: MasterEntryModel=new MasterEntryModel();
    model.tableName=tableName;
    model.queryParams=fd;
    
    return this.http
      .post<ResponseModel>(
        this.baseUrlApi + this.postApiMasterEntryController + '/Insert',
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

  public SaveSingleDataAndUpdateSerial(fd: any, tableName: any,updateTableName:any,updateSerialColumnName:any,whereParams:any) {
    
    let model: MasterEntryWithSlUpdateModel=new MasterEntryWithSlUpdateModel();
    model.tableName=tableName;
    model.queryParams=fd;
    model.updateTableName = updateTableName;
    model.updateColumnName = updateSerialColumnName;
    model.whereParams = whereParams;
    
    return this.http
      .post<ResponseModel>(
        this.baseUrlApi + this.postApiMasterEntryController + '/InsertThenUpdateRefTable',
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
  public SaveSingleDataAndUpdateAnotherTable(fd: any, tableName: any,updateTableName:any,updateSerialColumnName:any,whereParams:any) {
    
    let model: MasterEntryWithSlUpdateModel=new MasterEntryWithSlUpdateModel();
    model.tableName=tableName;
    model.queryParams=fd;
    model.updateTableName = updateTableName;
    model.updateColumnName = updateSerialColumnName;
    model.whereParams = whereParams;
    
    return this.http
      .post<ResponseModel>(
        this.baseUrlApi + this.postApiMasterEntryController + '/InsertThenUpdateRefTable',
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

  public DeleteDataAndUpdateSerial(fd: any, tableName: any,updateTableName:any,updateSerialColumnName:any,whereParams:any) {
    
    let model: MasterEntryWithSlUpdateModel=new MasterEntryWithSlUpdateModel();
    model.tableName=tableName;
    model.queryParams=fd;
    model.updateTableName = updateTableName;
    model.updateColumnName = updateSerialColumnName;
    model.whereParams = whereParams;
    
    return this.http
  .delete<ResponseModel>(
      this.baseUrlApi + 'MasterEntry/DeleteThenUpdateSl',
      {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.token,
          'Content-Type': 'application/json',
        }),
        body: model // 👈 if your API expects a request body
      }
    )
    .pipe(
      map((response) => {
        return response;
      })
    );
  }


  public SaveDataReqPayment(fd: any, tableName: any) {
    let model: DoubleMasterEntryModel=new DoubleMasterEntryModel();
    model.tableNameChild=tableName;
    model.detailsData=fd;

    return this.http
      .post<ResponseModel>(
        this.baseUrlApi + this.postApiController + '/InsertRequisitionPayment',
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


  public UpdateData(queryParams:any,condition:any,tablename:any) {
    let model: MasterEntryModel=new MasterEntryModel();
    model.tableName=tablename;
    model.queryParams=queryParams;
    model.whereParams= condition;
    return this.http
      .put<ResponseModel>(
        this.baseUrlApi + 'MasterEntry/Update',
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

  public DeleteData(model:MasterEntryModel) {

    const options = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
    body: {
      id: 1,
      name: 'test',
    },
  };

  return this.http
  .delete<ResponseModel>(
      this.baseUrlApi + 'MasterEntry/Delete',
      {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.token,
          'Content-Type': 'application/json',
        }),
        body: model // 👈 if your API expects a request body
      }
    )
    .pipe(
      map((response) => {
        return response;
      })
    );
  }

public GetAllData(model: GetDataModel){    
    return this.http.post<any>(this.baseUrlApi+this.getapiController+'/GetAllData',model,{
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.token,
        'Content-Type': 'application/json',
      }),
    })
    .pipe(map((Response)=> {return Response;}));
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

  public GetDataTableWithParam(model: GetDataModel) {
    return this.http
      .post<ResponseModel>(
        this.baseUrlApi + this.getapiController + '/GetDataById',
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

  public SaveDataMasterDetails(fd: any, tableName: any,fdMaster:any,tableNameMaster: any,primaryColumnName: any,ColumnNameForign: any,serialType:any,ColumnNameSerialNo:any,GuidKey:any = false,whereparam:any = {}) {
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
    model.whereParams = whereparam;
    model.GuidKey = GuidKey;

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

  public SaveDataMasterDetailsList(fd: any, tableName: any,fdMaster:any,tableNameMaster: any,primaryColumnName: any,ColumnNameForign: any,serialType:any,ColumnNameSerialNo:any) {
    
    //fd: any, tableName: any,fdMaster:any,tableNameMaster: any,primaryColumnName: any,ColumnNameForign: any,serialType:any,ColumnNameSerialNo:any
//   public string? TableNameMaster { get; set; }
// public string? TableNameChild { get; set; }
// public string? ColumnNamePrimary { get; set; }
// public string? ColumnNameForign { get; set; }
// public string? SerialType { get; set; }
// public string? ColumnNameSerialNo { get; set; }
// public string? IsFlag { get; set; }//Member_Check_for_Sales
// public object? Data { get; set; }
// public object? DetailsData { get; set; }
// public object? WhereParams { get; set; }
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

  PrintRequistionReport(printtype: any,fromdate:any,todate:any,reqno:any): void{
    let url=this.baseUrl +'api/Reports/RequisitionAllReport?rptType='+printtype+'&fromdate='+fromdate+'&todate='+todate+'&reqno='+reqno;
    window.open(url, '_blank');
  }

  PrintRequistionReportByCompany(printtype: any,fromdate:any,todate:any,reqno:any,companyId:any): void{
    let url=this.baseUrl +'api/Reports/RequisitionAllReportByCompany?rptType='+printtype+'&fromdate='+fromdate+'&todate='+todate+'&reqno='+reqno+'&companyId='+companyId;
    window.open(url, '_blank');
  }


  PrintRequistionIndividualReport(printtype: any,reqid:any): void{
    let url=this.baseUrl +'api/Reports/RequisitionIndividualReport?rptType='+printtype+'&reqid='+reqid;
    window.open(url, '_blank');
  }


  PrintRequistionIndividualReportByCompany(printtype: any,reqid:any,companyId:any): void{
    let url=this.baseUrl +'api/Reports/RequisitionIndividualReportByCompany?rptType='+printtype+'&reqid='+reqid+'&companyId='+companyId;
    window.open(url, '_blank');
  }


  RequisitionIndividualApproveReport(printtype: any,reqid:any): void{
    let url=this.baseUrl +'api/Reports/RequisitionIndividualApproveReport?rptType='+printtype+'&reqid='+reqid;
    window.open(url, '_blank');
  }


  RequisitionIndividualApproveReportByCompany(printtype: any,reqid:any,companyId:any): void{
    let url=this.baseUrl +'api/Reports/RequisitionIndividualApproveReportByCompany?rptType='+printtype+'&reqid='+reqid+'&companyId='+companyId;
    window.open(url, '_blank');
  }




  RequisitionIndividualAfterPaymentReportByCompany(printtype: any,reqid:any,companyId:any): void{
    let url=this.baseUrl +'api/Reports/RequisitionIndividualAfterPaymentReportByCompany?rptType='+printtype+'&reqid='+reqid+'&companyId='+companyId;
    window.open(url, '_blank');
  }


  PrintRequistioTopSheetReport(printtype: any,reqid:any): void{
    let url=this.baseUrl +'api/Reports/RequisitionTopSheetReport?rptType='+printtype+'&reqid='+reqid;
    window.open(url, '_blank');
  }


  PrintRequistioTopSheetReportByCompany(printtype: any,reqid:any,companyId:any): void{
    let url=this.baseUrl +'api/Reports/RequisitionTopSheetReportByCompany?rptType='+printtype+'&reqid='+reqid+'&companyId='+companyId;
    window.open(url, '_blank');
  }


  PrintRequistionApprovedTopSheetReport(printtype: any,reqid:any): void{
    let url=this.baseUrl +'api/Reports/RequisitionApprovedTopSheetReport?rptType='+printtype+'&reqid='+reqid;
    window.open(url, '_blank');
  }


  PrintRequistionApprovedTopSheetReportByCompany(printtype: any,reqid:any,companyId:any): void{
    let url=this.baseUrl +'api/Reports/RequisitionApprovedTopSheetReportByCompany?rptType='+printtype+'&reqid='+reqid+'&companyId='+companyId;
    window.open(url, '_blank');
  }


  public UpdateDataMasterDetailsReq(fd: any, tableName: any,fdMaster:any,tableNameMaster: any,primaryColumnName: any,ColumnNameForign: any,serialType:any,ColumnNameSerialNo:any,Whereparam:any) {
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
        this.baseUrlApi + this.postApiController + '/UpdateRequisition',
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
