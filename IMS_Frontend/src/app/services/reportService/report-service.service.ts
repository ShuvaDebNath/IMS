import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { GlobalConfig } from '../../global-config.config';
import { GlobalServiceService } from '../../services/Global-service.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GlobalClass } from 'src/app/shared/global-class';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  readonly baseUrl = GlobalConfig.BASE_URL;
  readonly BASE_URL_REPORT = GlobalConfig.BASE_URL_REPORT;
  readonly apiController = 'Report';
  token: any;
  constructor(
    private http: HttpClient,
    private gs: GlobalServiceService,
    private router: Router
  ) {
    this.token = gs.getSessionData('token');
  }

  httpHeader = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  PrintSampleRequest(
    report: any,
    rptType: 'pdf' | 'excel' | 'word',
    isView: boolean
  ) {
    const requestStatus = report.requestStatus ?? '';
    const fromDate = report.fromDate ? this.formatDate(report.fromDate) : '';
    const toDate = report.toDate ? this.formatDate(report.toDate) : '';
    const UserID = report.UserID ?? '';

    const url = `${this.baseUrl}${this.apiController}/SampleRequestReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: { rptType, fromDate, toDate, requestStatus, UserID },
        responseType: 'blob',
      })
      .subscribe((res: Blob) => {
        const blobType =
          rptType === 'pdf'
            ? 'application/pdf'
            : rptType === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        const blob = new Blob([res], { type: blobType });

        const fileName =
          rptType === 'pdf'
            ? 'SampleRequestReport.pdf'
            : rptType === 'excel'
            ? 'SampleRequestReport.xlsx'
            : 'SampleRequestReport.docx';

        if (isView && rptType === 'pdf') {
          // View PDF in new tab
          const fileURL = window.URL.createObjectURL(blob);
          window.open(fileURL, '_blank');
        } else {
          // Force download
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
        }
      });
  }

    PrintProformaInvoiceRequest(report: any, rptType: any, isView: any) {
    
    const PI_Master_ID = report.PI_Master_ID ?? '';

    const url = `${this.baseUrl}${this.apiController}/ProformaInvoiceReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: { rptType, PI_Master_ID },
        responseType: 'blob',
      })
      .subscribe((res: Blob) => {
        const fileURL = window.URL.createObjectURL(res);
        window.open(fileURL, '_blank');
      });
  }

  private formatDate(date: any): string {
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  }
}
