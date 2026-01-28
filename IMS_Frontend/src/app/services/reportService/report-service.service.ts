import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { GlobalConfig } from '../../global-config.config';
import { GlobalServiceService } from '../../services/Global-service.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GlobalClass } from 'src/app/shared/global-class';
import Swal from 'sweetalert2';

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

  PrintSampleRequest(report: any, rptType: any, isView: any) {
    console.log(report);

    const requestStatus = report.requestStatus ?? '';
    const fromDate = report.fromDate ? this.formatDate(report.fromDate) : '';
    const toDate = report.toDate ? this.formatDate(report.toDate) : '';
    const UserID = report.UserID ? report.UserID : '';

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
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintTaskDetails(
    report: any,
    rptType: 'pdf' | 'excel' | 'word',
    isView: boolean
  ) {
    const fromDate = report.fromDate ? this.formatDate(report.fromDate) : '';
    const toDate = report.toDate ? this.formatDate(report.toDate) : '';

    const url = `${this.baseUrl}${this.apiController}/TaskDetailsReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: { rptType, fromDate, toDate },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          const blobType =
          rptType === 'pdf'
            ? 'application/pdf'
            : rptType === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        const blob = new Blob([res], { type: blobType });

        // Choose base filename according to requested reportType
        const reportTypeKey = (rptType || '').toString();
        
        var baseFileName = 'PIReport';
        const fileName =
          rptType === 'pdf'
            ? `${baseFileName}_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.pdf`
            : rptType === 'excel'
            ? `${baseFileName}_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
            : `${baseFileName}_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
    const IsMPI = report.IsMPI ?? '';

    const url = `${this.baseUrl}${this.apiController}/ProformaInvoiceReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: { rptType, PI_Master_ID, IsMPI },
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

        // Choose base filename according to requested reportType
        const reportTypeKey = (rptType || '').toString();
        
        var baseFileName = 'PIReport';
        const fileName =
          rptType === 'pdf'
            ? `${baseFileName}.pdf`
            : rptType === 'excel'
            ? `${baseFileName}.xlsx`
            : `${baseFileName}.docx`;

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

  PrintCustomerList(report: any, rptType: any, isView: any) {
    const Superior_Id = report.Superior_Id ?? '';
    const Customer_Id = report.Customer_Id ?? '';
    const Status = report.Status ?? '';
    const UserID = report.UserID ?? '';

    const url = `${this.baseUrl}${this.apiController}/CustomerReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: {
          rptType: 'PDF',
          Superior_Id: Superior_Id,
          Customer_Id: Customer_Id,
          Status: Status,
          UserID: UserID,
        },
        responseType: 'blob',
      })
      .subscribe((res: Blob) => {
        const fileURL = window.URL.createObjectURL(res);
        window.open(fileURL, '_blank');
      });
  }

  PrintCommercialInvoiceReports(
    report: any,
    rptType: 'pdf' | 'excel' | 'word',
    isView: boolean
  ) {
    const commercialInvoiceNo = report.Commercial_Invoice_No ?? '';
    const reportType = report.reportType ?? '';

    const url = `${this.baseUrl}${this.apiController}/CommercialInvoiceReports`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: { rptType, commercialInvoiceNo, reportType },
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

        // Choose base filename according to requested reportType
        const reportTypeKey = (reportType || '').toString();
        let baseFileName = 'CommercialInvoiceReport';
        switch (reportTypeKey) {
          case 'CI':
            baseFileName = 'CommercialInvoiceReport';
            break;
          case 'PL':
            baseFileName = 'PackingListReport';
            break;
          case 'DC':
            baseFileName = 'DeliveryChallanReport';
            break;
          case 'BOE':
            baseFileName = 'BOEReport';
            break;
          case 'IC':
            baseFileName = 'InsuranceCertificateReport';
            break;
          case 'Origin':
            baseFileName = 'CertificateOfOriginReport';
            break;
          case 'Beneficiary':
            baseFileName = 'BeneficiaryBankReport';
            break;
          default:
            baseFileName = 'CommercialInvoiceReport';
        }

        const fileName =
          rptType === 'pdf'
            ? `${baseFileName}.pdf`
            : rptType === 'excel'
            ? `${baseFileName}.xlsx`
            : `${baseFileName}.docx`;

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

  PrintDeliveryChallanReport(report: any, rptType: any, isView: any) {
    const challanNo = report.Chalan_No ?? '';

    const url = `${this.baseUrl}${this.apiController}/DeliveryChallanReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    Swal.fire({
      title: 'Generating report...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        // show spinner
        Swal.showLoading();
        // Ensure the Swal popup appears above PrimeNG dialogs by raising z-index
        try {
          const container = Swal.getContainer();
          if (container && container.style) {
            container.style.zIndex = '2147483647';
          }
          const popup = Swal.getPopup();
          if (popup && popup.style) {
            popup.style.zIndex = '2147483648';
          }
        } catch (e) {
          // ignore if DOM APIs are not available for some reason
        }
      },
    });

    this.http
      .get(url, {
        headers,
        params: { rptType, challanNo },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          try {
            Swal.close();
            const fileURL = window.URL.createObjectURL(res);
            window.open(fileURL, '_blank');
          } catch (err) {
            Swal.close();
            Swal.fire('Error', 'Unable to open report.', 'error');
          }
        },
        (err) => {
          Swal.close();
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  private formatDate(date: any): string {
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  }

  private formatDateDMY(date: any): string {
    const d = new Date(date);
    const day = ('0' + d.getDate()).slice(-2);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  PrintApplicationReport(report: any, rptType: any, isView: any) {
    console.log(report);

    const fromDate = report.fromDate ? this.formatDate(report.fromDate) : '';
    const toDate = report.toDate ? this.formatDate(report.toDate) : '';
    const appType = report.applicationType ? report.applicationType : '';

    const url = `${this.baseUrl}${this.apiController}/ApplicationReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: { rptType, fromDate, toDate, appType },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'ApplicationReport.pdf'
              : rptType === 'excel'
              ? `ApplicationReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `ApplicationReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintLCReport(report: any, rptType: any, isView: any) {
    console.log(report);

    const fromDate = report.fromDate ? this.formatDate(report.fromDate) : '';
    const toDate = report.toDate ? this.formatDate(report.toDate) : '';
    const LCNo = report.applicationType ? report.applicationType : '';

    const url = `${this.baseUrl}${this.apiController}/LCReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: { rptType, fromDate, toDate, LCNo },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? `LCReport${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.pdf`
              : rptType === 'excel'
              ? `LCReport${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `LCReport${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintCashReceiveReport(report: any, rptType: any, isView: any) {
    console.log(report);

    const fromDate = report.fromDate ? this.formatDate(report.fromDate) : '';
    const toDate = report.toDate ? this.formatDate(report.toDate) : '';

    const url = `${this.baseUrl}${this.apiController}/CashReceiveReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: { rptType, fromDate, toDate },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? `CashReceiveReport${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.pdf`
              : rptType === 'excel'
              ? `CashReceiveReport${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `CashReceiveReport${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintPIAmendmentApplicationReport(report: any, rptType: any, isView: any) {
    console.log(report);

    const id = report.id;

    const url = `${this.baseUrl}${this.apiController}/PIAmendMentReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: { rptType, id },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'ApplicationReport.pdf'
              : rptType === 'excel'
              ? `ApplicationReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `ApplicationReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintOtherApplicationReport(report: any, rptType: any, isView: any) {
    console.log(report);

    const id = report.id;

    const url = `${this.baseUrl}${this.apiController}/PIOtherReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: { rptType, id },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'ApplicationReport.pdf'
              : rptType === 'excel'
              ? `ApplicationReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `ApplicationReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintSalescontractReport(report: any, rptType: any, isView: any) {
    console.log(report);

    const id = report.id;

    const url = `${this.baseUrl}${this.apiController}/SalesContractReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: { rptType, id },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'SalesContractReport.pdf'
              : rptType === 'excel'
              ? `SalesContractReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `SalesContractReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintCustomerReport(report: any, rptType: any, isView: any) {
    console.log(report);

    const Superior_Id = report.Superior_Id;
    const Customer_Id = report.Customer_Id;
    const Status = report.Status;
    const sentBy = report.User;

    const url = `${this.baseUrl}${this.apiController}/CustomerReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: { rptType, Superior_Id, Customer_Id, Status, sentBy },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'CustomerReport.pdf'
              : rptType === 'excel'
              ? `CustomerReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `CustomerReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintBuyerReport(report: any, rptType: any, isView: any) {
    console.log(report);

    const fromDate = report.FromDateInput;
    const toDate = report.ToDateInput;
    const SuperioId = report.Superior_Id;
    const CustomerId = report.Customer_Id;
    const Status = report.Status;
    const sentBy = report.User;

    const url = `${this.baseUrl}${this.apiController}/BuyerReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: {
          rptType,
          fromDate,
          toDate,
          SuperioId,
          CustomerId,
          Status,
          sentBy,
        },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'BuyerReport.pdf'
              : rptType === 'excel'
              ? `BuyerReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `BuyerReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintTaskReport(report: any, rptType: 'pdf' | 'excel' | 'word', isView: any) {
    const id = report.id ? report.id : '';

    const url = `${this.baseUrl}${this.apiController}/TaskReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http
      .get(url, {
        headers,
        params: {
          rptType,
          id,
        },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'TaskReport.pdf'
              : rptType === 'excel'
              ? `TaskReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `TaskReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintExportReport(
    report: any,
    rptType: 'pdf' | 'excel' | 'word',
    isView: any
  ) {
    const id = report.id ? report.id : '';

    const url = `${this.baseUrl}${this.apiController}/ExportReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http
      .get(url, {
        headers,
        params: {
          rptType,
          id,
        },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'ExportReport.pdf'
              : rptType === 'excel'
              ? `ExportReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `ExportReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintRMIssueInvoice(
    report: any,
    rptType: 'pdf' | 'excel' | 'word',
    isView: any
  ) {
    const id = report.id ? report.id : '';

    const url = `${this.baseUrl}${this.apiController}/RawMaterialIssueInvoiceReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http
      .get(url, {
        headers,
        params: {
          rptType,
          id,
        },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'RawMaterialIssueInvoiceReport.pdf'
              : rptType === 'excel'
              ? `RawMaterialIssueInvoiceReport_${this.formatDateDMY(
                  new Date()
                ).replace(/\//g, '-')}.xlsx`
              : `RawMaterialIssueInvoiceReport_${this.formatDateDMY(
                  new Date()
                ).replace(/\//g, '-')}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintRMStock(report: any, rptType: 'pdf' | 'excel' | 'word', isView: any) {
    const url = `${this.baseUrl}${this.apiController}/RMStockReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http
      .get(url, {
        headers,
        params: {
          rptType,
        },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'RMStockReport.pdf'
              : rptType === 'excel'
              ? `RMStockReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `RMStockReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintExportReceiveReport(
    report: any,
    rptType: 'pdf' | 'excel' | 'word',
    isView: any
  ) {
    const id = report.id ? report.id : '';

    const url = `${this.baseUrl}${this.apiController}/ExportReceiveReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http
      .get(url, {
        headers,
        params: {
          rptType,
          id,
        },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'ExportReport.pdf'
              : rptType === 'excel'
              ? `ExportReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `ExportReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintFinishGoodSentReport(
    report: any,
    rptType: 'pdf' | 'excel' | 'word',
    isView: any
  ) {
    const id = report.id ? report.id : '';

    const url = `${this.baseUrl}${this.apiController}/FinishGoodSentReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http
      .get(url, {
        headers,
        params: {
          rptType,
          id,
        },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'FinishGoodSentReport.pdf'
              : rptType === 'excel'
              ? `FinishGoodSentReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `FinishGoodSentReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintFinishGoodReceiveReport(
    report: any,
    rptType: 'pdf' | 'excel' | 'word',
    isView: any
  ) {
    const id = report.id ? report.id : '';

    const url = `${this.baseUrl}${this.apiController}/FinishGoodReceiveReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http
      .get(url, {
        headers,
        params: {
          rptType,
          id,
        },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'FinishGoodReceiveReport.pdf'
              : rptType === 'excel'
              ? `FinishGoodReceiveReport_${this.formatDateDMY(
                  new Date()
                ).replace(/\//g, '-')}.xlsx`
              : `FinishGoodReceiveReport_${this.formatDateDMY(
                  new Date()
                ).replace(/\//g, '-')}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintFGStock(report: any, rptType: 'pdf' | 'excel' | 'word', isView: any) {
    const url = `${this.baseUrl}${this.apiController}/FGStockReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http
      .get(url, {
        headers,
        params: {
          rptType,
        },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'FGStockReport.pdf'
              : rptType === 'excel'
              ? `FGStockReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `FGStockReport_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintFGSentAndReceiveReport(report: any, rptType: any, isView: any) {
    console.log(report);

    const InvoiceNo = report.applicationType ? report.InvoiceNo : '';
    const fromDate = report.fromDate ? this.formatDate(report.fromDate) : '';
    const toDate = report.toDate ? this.formatDate(report.toDate) : '';

    const url = `${this.baseUrl}${this.apiController}/FGSendAndReceiveReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: { rptType, fromDate, toDate },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? `FGSentReceive${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.pdf`
              : rptType === 'excel'
              ? `FGSentReceive${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `FGSentReceive${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintRequisitionPendingDetilsReport(
    report: any,
    rptType: 'pdf' | 'excel' | 'word',
    isView: any
  ) {
    const id = report.id ? report.id : '';

    const url = `${this.baseUrl}${this.apiController}/RMPendingDetailsReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http
      .get(url, {
        headers,
        params: {
          rptType,
          id,
        },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'RMPendingDetailsReport.pdf'
              : rptType === 'excel'
              ? `RMPendingDetailsReport${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `RMPendingDetailsReport${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }

  PrintRequisitionDetilsReport(
    report: any,
    rptType: 'pdf' | 'excel' | 'word',
    isView: any
  ) {
    const id = report.id ? report.id : '';

    const url = `${this.baseUrl}${this.apiController}/RMDetailsReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http
      .get(url, {
        headers,
        params: {
          rptType,
          id,
        },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'RMDetailsReport.pdf'
              : rptType === 'excel'
              ? `RMDetailsReport${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `RMDetailsReport${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }


  PrintTaskMonthlyDetailsReport(report: any, rptType: 'pdf' | 'excel' | 'word', isView: any) {
    const id = report.id ? report.id : '';

    const url = `${this.baseUrl}${this.apiController}/TaskMonthlyDetailsReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http
      .get(url, {
        headers,
        params: {
          rptType,
          id,
        },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'MonthlyTaskDetails.pdf'
              : rptType === 'excel'
              ? `MonthlyTaskDetails_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `MonthlyTaskDetails_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }


  PrintTaskMonthlyDetails(
    report: any,
    rptType: 'pdf' | 'excel' | 'word',
    isView: boolean
  ) {
    const fromDate = report.fromDate ? this.formatDate(report.fromDate) : '';
    const toDate = report.toDate ? this.formatDate(report.toDate) : '';

    const url = `${this.baseUrl}${this.apiController}/TaskMonthlyReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: { rptType, fromDate, toDate },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          const blobType =
          rptType === 'pdf'
            ? 'application/pdf'
            : rptType === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        const blob = new Blob([res], { type: blobType });

        // Choose base filename according to requested reportType
        const reportTypeKey = (rptType || '').toString();
        
        var baseFileName = 'MonthlyTaskReport';
        const fileName =
          rptType === 'pdf'
            ? `${baseFileName}_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.pdf`
            : rptType === 'excel'
            ? `${baseFileName}_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
            : `${baseFileName}_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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

  PrintClientVisitDetailsReport(report: any, rptType: 'pdf' | 'excel' | 'word', isView: any) {
    const id = report.id ? report.id : '';

    const url = `${this.baseUrl}${this.apiController}/TaskCustomerVisitDetailsReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http
      .get(url, {
        headers,
        params: {
          rptType,
          id,
        },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          if (res.size === 0) {
            Swal.fire(
              'No Data Found',
              'No records found for the selected criteria.',
              'info'
            );
            return;
          }
          const blobType =
            rptType === 'pdf'
              ? 'application/pdf'
              : rptType === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const blob = new Blob([res], { type: blobType });

          const fileName =
            rptType === 'pdf'
              ? 'ClientVisitDetails.pdf'
              : rptType === 'excel'
              ? `ClientVisitDetails${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
              : `ClientVisitDetails${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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
        },
        (err) => {
          Swal.fire('Error', 'Failed to generate report.', 'error');
        }
      );
  }


  PrintClinetVisit(
    report: any,
    rptType: 'pdf' | 'excel' | 'word',
    isView: boolean
  ) {
    const fromDate = report.fromDate ? this.formatDate(report.fromDate) : '';
    const toDate = report.toDate ? this.formatDate(report.toDate) : '';

    const url = `${this.baseUrl}${this.apiController}/TaskCustomerVisitReport`;
    const token = this.gs.getSessionData('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(url, {
        headers,
        params: { rptType, fromDate, toDate },
        responseType: 'blob',
      })
      .subscribe(
        (res: Blob) => {
          const blobType =
          rptType === 'pdf'
            ? 'application/pdf'
            : rptType === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        const blob = new Blob([res], { type: blobType });

        // Choose base filename according to requested reportType
        const reportTypeKey = (rptType || '').toString();
        
        var baseFileName = 'ClientVisitDetails';
        const fileName =
          rptType === 'pdf'
            ? `${baseFileName}_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.pdf`
            : rptType === 'excel'
            ? `${baseFileName}_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.xlsx`
            : `${baseFileName}_${this.formatDateDMY(new Date()).replace(
                  /\//g,
                  '-'
                )}.docx`;

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

  PrintDeliveryReport(report: any, rptType: any, isView: any) {
    const PI_Master_ID = report.PI_Master_ID ?? '';

    const url = `${this.baseUrl}${this.apiController}/DeliveryReport`;
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
        const blobType =
          rptType === 'pdf'
            ? 'application/pdf'
            : rptType === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        const blob = new Blob([res], { type: blobType });

        // Choose base filename according to requested reportType
        const reportTypeKey = (rptType || '').toString();
        
        var baseFileName = 'DeliveryReport';
        const fileName =
          rptType === 'pdf'
            ? `${baseFileName}.pdf`
            : rptType === 'excel'
            ? `${baseFileName}.xlsx`
            : `${baseFileName}.docx`;

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
}
