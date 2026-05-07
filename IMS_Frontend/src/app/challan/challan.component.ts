import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { GlobalServiceService } from '../services/Global-service.service';
import { GetDataService } from '../services/getData/getDataService.service';
import { ReportService } from '../services/reportService/report-service.service';
import Swal from 'sweetalert2';
import { DividerModule } from 'primeng/divider';
import { MasterEntryService } from '../services/masterEntry/masterEntry.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';
import { DateFormat } from 'src/app/shared/date-format';
import { jsPDF } from 'jspdf';
import * as QRCode from 'qrcode';

@Component({
  standalone: true,
  selector: 'app-challan',
  templateUrl: './challan.component.html',
  styleUrls: ['./challan.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    DividerModule,
    DialogModule,
    ButtonModule,
    CalendarModule,
  ],
})
export class ChallanComponent implements OnInit {
  // For date edit modal
  editDateMessageText: string = '';
  editDateMessageType: 'success' | 'error' | 'info' | 'warning' | '' = '';
  editDateConfirmVisible: boolean = false;
  editDateConfirmText: string = '';
  clearEditDateMessage(): void {
    this.editDateMessageText = '';
    this.editDateMessageType = '';
  }

  private setEditDateMessage(
    msg: string,
    type: 'success' | 'error' | 'info' | 'warning',
  ) {
    this.editDateMessageText = msg;
    this.editDateMessageType = type;
  }
  searchForm!: FormGroup;
  showTable = false;
  tableData: any[] = [];
  PageTitle: any;
  insertPermissions: any;
  updatePermissions: any;
  deletePermissions: any;
  printPermissions: any;
  datePipe = new DatePipe('en-US');

  constructor(
    private fb: FormBuilder,
    private gs: GlobalServiceService,
    private getDataService: GetDataService,
    private reportService: ReportService,
    private masterEntryService: MasterEntryService,
    private router: Router,
  ) {}

  isChallanDetailsVisible = false;
  challanDetails: any = null;

  challanTotalsRolls: number = 0;
  challanTotalsDelivered: number = 0;

  isEditChallanVisible = false;
  editOldChallan: string = '';
  editNewChallan: string = '';
  editChallanMessageText: string = '';
  editChallanMessageType: 'success' | 'error' | 'info' | 'warning' | '' = '';
  editConfirmVisible: boolean = false;
  editConfirmText: string = '';

  isEditingDate: boolean = false;
  editDate: string = '';

  ngOnInit(): void {
    this.PageTitle = 'Challan';
    var permissions = this.gs.CheckUserPermission(this.PageTitle);
    this.insertPermissions = permissions.insertPermissions;
    this.updatePermissions = permissions.updatePermissions;
    this.deletePermissions = permissions.deletePermissions;
    this.printPermissions = permissions.printPermissions;
    console.log(permissions);

    if (!this.printPermissions) {
      window.location.href = 'dashboard';
    }

    this.searchForm = this.fb.group({
      challanNo: [''],
      piNo: [''],
      fromDate: [''],
      toDate: [''],
    });

    this.showTable = false;
  }

  onSearch() {
    const { challanNo, piNo, fromDate, toDate } = this.searchForm.value;

    if (!challanNo && !piNo && !fromDate && !toDate) {
      this.showTable = false;
      return;
    }

    const procedureData = {
      procedureName: 'usp_DeliveryDetailsInfos_MasterData',
      parameters: {
        ChallanNo: challanNo || '',
        PINo: piNo || '',
        FromDate: DateFormat.toApiDate(fromDate) || '',
        ToDate: DateFormat.toApiDate(toDate) || '',
      },
    };
    Swal.fire({
      title: 'Searching...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        Swal.close();
        if (results.status) {
          this.tableData = JSON.parse(results.data).Tables1;
          console.log(this.tableData);
          this.showTable = true;
        } else if (results.msg == 'Invalid Token') {
          Swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
          this.showTable = false;
        } else {
          this.showTable = false;
        }
      },
      error: (err) => {
        Swal.close();
        this.showTable = false;
        Swal.fire('Error', 'Failed to fetch challan data.', 'error');
      },
    });
  }

  openChallanDetails(challanNo: string) {
    if (!challanNo) return;

    const procedureData = {
      procedureName: 'usp_GetDeliveryChallanInfoByChallanNo',
      parameters: { Chalan_No: challanNo },
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results: any) => {
        if (results.status) {
          const json = JSON.parse(results.data || '{}');
          const details = json.Tables1 || [];
          const master =
            json.Tables2 && json.Tables2.length > 0
              ? json.Tables2[0]
              : json.Tables1 && json.Tables1.length > 0
                ? json.Tables1[0]
                : null;
          this.challanDetails = { master: master, details: details };
          this.computeChallanTotals(details);
          this.isChallanDetailsVisible = true;
        } else if (results.msg === 'Invalid Token') {
          Swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
          Swal.fire('Error', 'Unable to load challan info', 'error');
        }
      },
      error: (err: any) => {
        Swal.fire(
          'Error',
          'An error occurred while fetching challan info',
          'error',
        );
      },
    });
  }

  computeChallanTotals(details: any[]): void {
    this.challanTotalsRolls = 0;
    this.challanTotalsDelivered = 0;
    if (!details || !Array.isArray(details)) return;
    for (const r of details) {
      const roll =
        Number(r.Roll ?? r.Rolls ?? r.RollValue ?? r.RollBoxPcs) || 0;
      const delivered =
        Number(
          r.Delivered ?? r.DeliveredQty ?? r.Quantity ?? r.Deliverd_In_Meter,
        ) || 0;
      this.challanTotalsRolls += roll;
      this.challanTotalsDelivered += delivered;
    }
  }

  openEditChallanModal(oldChallan: string) {
    this.editOldChallan = oldChallan || '';
    this.editNewChallan = '';
    this.clearEditChallanMessage();
    this.editConfirmVisible = false;
    this.editConfirmText = '';
    this.isEditChallanVisible = true;
  }

  clearEditChallanMessage(): void {
    this.editChallanMessageText = '';
    this.editChallanMessageType = '';
  }

  private setEditChallanMessage(
    msg: string,
    type: 'success' | 'error' | 'info' | 'warning',
  ) {
    this.editChallanMessageText = msg;
    this.editChallanMessageType = type;
  }

  saveEditChallan() {
    if (!this.editNewChallan) {
      this.setEditChallanMessage('Please enter new Challan No', 'warning');
      return;
    }
    this.clearEditChallanMessage();

    this.editConfirmText = `Change challan no from ${this.editOldChallan} to ${this.editNewChallan}?`;
    this.editConfirmVisible = true;
  }

  performSaveEditChallanConfirmed(): void {
    this.editConfirmVisible = false;
    this.editConfirmText = '';

    const checkProc = {
      procedureName: 'usp_ChallanNoExistOrNot',
      parameters: { Chalan_No: this.editNewChallan },
    };

    this.getDataService.GetInitialData(checkProc).subscribe({
      next: (checkRes: any) => {
        if (checkRes.status) {
          let exists = false;
          try {
            const ds = JSON.parse(checkRes.data || '{}');
            if (ds.Tables1 && ds.Tables1.length > 0) {
              const firstRow = ds.Tables1[0];
              const firstValRaw = firstRow[Object.keys(firstRow)[0]];
              const firstVal = (firstValRaw ?? '')
                .toString()
                .trim()
                .toLowerCase();

              if (
                firstVal === 'exists' ||
                firstVal === 'exist' ||
                firstVal === 'true' ||
                firstVal === '1'
              ) {
                exists = true;
              } else if (
                firstVal === 'not exists' ||
                firstVal === 'not exist' ||
                firstVal === 'notexists' ||
                firstVal === 'false' ||
                firstVal === '0'
              ) {
                exists = false;
              } else {
                if (firstVal.includes('not') && firstVal.includes('exist')) {
                  exists = false;
                } else if (firstVal.includes('exist')) {
                  exists = true;
                }
              }
            } else if (typeof checkRes.data === 'string') {
              const raw = (checkRes.data || '').toString().trim().toLowerCase();
              if (
                raw === 'exists' ||
                raw === 'exist' ||
                raw === 'true' ||
                raw === '1'
              ) {
                exists = true;
              } else if (
                raw === 'not exists' ||
                raw === 'not exist' ||
                raw === 'false' ||
                raw === '0'
              ) {
                exists = false;
              } else {
                if (raw.includes('not') && raw.includes('exist'))
                  exists = false;
                else if (raw.includes('exist')) exists = true;
              }
            }
          } catch (e) {
            const raw = (checkRes.data || '').toString().trim().toLowerCase();
            if (
              raw === 'exists' ||
              raw === 'exist' ||
              raw === 'true' ||
              raw === '1'
            ) {
              exists = true;
            } else if (
              raw === 'not exists' ||
              raw === 'not exist' ||
              raw === 'false' ||
              raw === '0'
            ) {
              exists = false;
            } else {
              if (raw.includes('not') && raw.includes('exist')) exists = false;
              else if (raw.includes('exist')) exists = true;
            }
          }

          if (exists) {
            this.setEditChallanMessage('Challan no already exist.', 'info');
            return;
          }

          const updateParams = { Chalan_No: this.editNewChallan };
          const updateCondition = { Chalan_No: this.editOldChallan };
          const updateTable = 'tbl_pi_ledger';
          this.masterEntryService
            .UpdateData(updateParams, updateCondition, updateTable)
            .subscribe({
              next: (res: any) => {
                let updateSuccess = false;
                if (res.status) {
                  updateSuccess = true;
                } else {
                  const msg = (res.msg || '').toString().toLowerCase();
                  const data = (res.data || '').toString().toLowerCase();
                  if (
                    msg.includes('success') ||
                    msg.includes('updated') ||
                    msg.includes('done') ||
                    msg.includes('changed')
                  ) {
                    updateSuccess = true;
                  } else if (
                    data.includes('success') ||
                    data.includes('updated') ||
                    data.includes('done') ||
                    data.includes('changed')
                  ) {
                    updateSuccess = true;
                  }
                }
                if (updateSuccess) {
                  this.setEditChallanMessage(
                    'Challan number updated',
                    'success',
                  );
                  setTimeout(() => {
                    this.isEditChallanVisible = false;
                    this.openChallanDetails(this.editNewChallan);
                    this.onSearch();
                    this.clearEditChallanMessage();
                  }, 1200);
                } else {
                  this.setEditChallanMessage(
                    res.msg || 'Failed to update challan',
                    'error',
                  );
                }
              },
              error: () =>
                this.setEditChallanMessage('Failed to update challan', 'error'),
            });
        } else {
          if (checkRes.msg === 'Invalid Token') {
            Swal.fire('Session Expired!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {
            Swal.fire(
              'Error',
              checkRes.msg || 'Failed to validate challan',
              'error',
            );
          }
        }
      },
      error: () => {
        Swal.fire('Error', 'Failed to validate challan', 'error');
      },
    });
  }

  toggleEditDate(): void {
    this.isEditingDate = !this.isEditingDate;
    if (
      this.isEditingDate &&
      this.challanDetails &&
      this.challanDetails.master
    ) {
      const raw =
        this.challanDetails.master?.Date ||
        this.challanDetails.master?.PIDate ||
        this.challanDetails.master?.DeliveryDate;
      if (raw) {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          this.editDate = `${yyyy}-${mm}-${dd}`;
        } else {
          this.editDate = '';
        }
      }
      this.clearEditDateMessage();
      this.editDateConfirmVisible = false;
      this.editDateConfirmText = '';
    }
  }

  saveDateChange(): void {
    if (!this.editDate) {
      this.setEditDateMessage('Please select a date', 'warning');
      return;
    }
    const old = this.challanDetails?.master?.Chalan_No;
    if (!old) {
      this.setEditDateMessage('Original challan number missing', 'error');
      return;
    }

    this.clearEditDateMessage();

    this.editDateConfirmText = `Change challan date from ${this.challanDetails.master?.Date} to ${this.editDate}?`;
    this.editDateConfirmVisible = true;
  }

  performSaveDateChangeConfirmed(): void {
    this.editDateConfirmVisible = false;
    this.editDateConfirmText = '';

    let dateWithTime = this.editDate;
    if (/^\d{4}-\d{2}-\d{2}$/.test(this.editDate)) {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const sec = String(now.getSeconds()).padStart(2, '0');
      dateWithTime = `${this.editDate}T${hh}:${min}:${sec}`;
    }
    const updateParams = { Date: dateWithTime };
    const updateCondition = {
      Chalan_No: this.challanDetails?.master?.Chalan_No,
    };
    const updateTable = 'tbl_pi_ledger';
    this.masterEntryService
      .UpdateData(updateParams, updateCondition, updateTable)
      .subscribe({
        next: (res: any) => {
          let updateSuccess = false;
          if (res.status) {
            updateSuccess = true;
          } else {
            const msg = (res.msg || '').toString().toLowerCase();
            const data = (res.data || '').toString().toLowerCase();
            if (
              msg.includes('success') ||
              msg.includes('updated') ||
              msg.includes('done') ||
              msg.includes('changed')
            ) {
              updateSuccess = true;
            } else if (
              data.includes('success') ||
              data.includes('updated') ||
              data.includes('done') ||
              data.includes('changed')
            ) {
              updateSuccess = true;
            }
          }
          if (updateSuccess) {
            this.setEditDateMessage('Date updated', 'success');
            if (this.challanDetails && this.challanDetails.master) {
              this.challanDetails.master.Date = this.editDate;
            }
            setTimeout(() => {
              this.isEditingDate = false;
              this.clearEditDateMessage();
              this.onSearch();
            }, 1200);
          } else if (res.msg === 'Invalid Token') {
            this.setEditDateMessage(
              'Session Expired! Please Login Again.',
              'info',
            );
            this.gs.Logout();
          } else {
            this.setEditDateMessage(
              res.msg || 'Failed to update date',
              'error',
            );
          }
        },
        error: () => this.setEditDateMessage('Failed to update date', 'error'),
      });
  }

  deleteChallan(): void {
    const challanNo =
      this.challanDetails?.master?.Chalan_No ||
      this.challanDetails?.master?.ChallanNo;
    if (!challanNo) {
      Swal.fire('Error', 'Challan no missing', 'error');
      return;
    }
    Swal.fire({
      title: 'Delete Challan?',
      text: `Are you sure you want to delete challan ${challanNo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
    }).then((r) => {
      if (r.isConfirmed) {
        const model: any = {
          tableName: 'tbl_pi_ledger',
          whereParams: { Chalan_No: challanNo },
        };
        this.masterEntryService.DeleteData(model).subscribe({
          next: (res: any) => {
            if (res.status) {
              Swal.fire('Deleted', 'Challan deleted', 'success');
              this.isChallanDetailsVisible = false;
              this.tableData = this.tableData.filter(
                (t) => (t.Chalan_No || t.challanNo || t.ChalanNo) !== challanNo,
              );
            } else {
              Swal.fire(
                'Error',
                res.msg || 'Failed to delete challan',
                'error',
              );
            }
          },
          error: () => Swal.fire('Error', 'Failed to delete challan', 'error'),
        });
      }
    });
  }

  printChallan(challanNo?: string): void {
    const no =
      challanNo ||
      this.challanDetails?.master?.Chalan_No ||
      this.challanDetails?.master?.ChallanNo;
    if (!no) {
      Swal.fire('Error', 'Challan no missing', 'error');
      return;
    }
    const payload = { Chalan_No: no };
    this.reportService.PrintDeliveryChallanReport(payload, 'pdf', true);
  }

  onChallanClick(challanNo: string): void {
    if (!challanNo) {
      return;
    }
    Swal.fire({
      title: 'Choose action',
      text: `Challan: ${challanNo}`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Print',
      denyButtonText: 'Edit',
    }).then((result) => {
      if (result.isConfirmed) {
        this.printChallan(challanNo);
      } else if (result.isDenied) {
        this.openChallanDetails(challanNo);
      }
    });
  }

  clear() {
    this.searchForm.reset();
    this.showTable = false;
    this.tableData = [];
  }

  //   generateQrCodes(item: any): void {
  //     const challanNo = this.challanDetails?.master?.Chalan_No ?? '';
  //     const challanDate = this.challanDetails?.master?.Date ?? '';

  //     const itemId = item?.Article || item?.Article_No || item?.Description || '';

  //     // Your old code had width/color swapped
  //     const color = item?.Color ?? '';
  //     const width = item?.Width ?? '';

  //     const rollCount = Number(
  //       item?.Roll || item?.Rolls || item?.RollValue || item?.RollBoxPcs || 0,
  //     );

  //     if (!rollCount || rollCount <= 0) {
  //       alert('Roll count not found.');
  //       return;
  //     }

  //     const totalRoll = rollCount;

  //     const qrLibUrl =
  //       'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';

  //     const safe = (value: any) =>
  //       String(value ?? '')
  //         .replace(/\\/g, '\\\\')
  //         .replace(/'/g, "\\'")
  //         .replace(/\n/g, '\\n')
  //         .replace(/\r/g, '');

  //     const html = `
  // <!DOCTYPE html>
  // <html>
  // <head>
  //   <title>QR Stickers</title>

  //   <style>
  //     * {
  //       box-sizing: border-box;
  //     }

  //     html,
  //     body {
  //       margin: 0;
  //       padding: 0;
  //       font-family: Arial, sans-serif;
  //       background: white;
  //     }

  //     .print-page {
  //       width: 210mm;
  //       height: 297mm;
  //       padding: 7mm 5mm;
  //       display: grid;
  //       grid-template-columns: repeat(5, 1fr);
  //       grid-template-rows: repeat(5, 1fr);
  //       page-break-after: always;
  //       break-after: page;
  //       overflow: hidden;
  //     }

  //     .print-page:last-child {
  //       page-break-after: auto;
  //       break-after: auto;
  //     }

  //     .qr-block {
  //       width: 100%;
  //       height: 100%;
  //       overflow: hidden;

  //       display: flex;
  //       flex-direction: column;
  //       align-items: center;
  //       justify-content: center;

  //       text-align: center;
  //       padding: 1mm;
  //     }

  //     .qr-challan {
  //       font-size: 10px;
  //       font-weight: 700;
  //       line-height: 1.1;
  //       margin-bottom: 1mm;
  //     }

  //     .qr-img {
  //       width: 31mm;
  //       height: 31mm;
  //       display: block;
  //       object-fit: contain;
  //     }

  //     .qr-label {
  //       font-size: 10px;
  //       font-weight: 700;
  //       line-height: 1.1;
  //       margin-top: 1mm;
  //       white-space: nowrap;
  //     }

  //     .qr-date {
  //       font-size: 8px;
  //       font-weight: 600;
  //       line-height: 1.1;
  //       margin-top: 0.5mm;
  //       white-space: nowrap;
  //     }

  //     @page {
  //       size: A4 portrait;
  //       margin: 0;
  //     }

  //     @media print {
  //       html,
  //       body {
  //         width: 210mm;
  //         height: 297mm;
  //         margin: 0;
  //         padding: 0;
  //       }

  //       .print-page {
  //         margin: 0;
  //         box-shadow: none;
  //       }
  //     }
  //   </style>

  //   <script src="${qrLibUrl}"></script>
  // </head>

  // <body>
  //   <div id="qr-container"></div>

  //   <script>
  //     function makeQR(data, size) {
  //       var qr = new QRious({
  //         value: data,
  //         size: size,
  //         level: 'M',
  //         padding: 5
  //       });

  //       return qr.toDataURL();
  //     }

  //     function renderQRCodes() {
  //       var container = document.getElementById('qr-container');

  //       var rollCount = ${rollCount};
  //       var challanNo = '${safe(challanNo)}';
  //       var challanDate = '${safe(challanDate)}';
  //       var itemId = '${safe(itemId)}';
  //       var width = '${safe(width)}';
  //       var color = '${safe(color)}';
  //       var totalRoll = ${totalRoll};

  //       var stickersPerPage = 25;
  //       var currentPage = null;

  //       for (var i = 1; i <= rollCount; i++) {
  //         if ((i - 1) % stickersPerPage === 0) {
  //           currentPage = document.createElement('div');
  //           currentPage.className = 'print-page';
  //           container.appendChild(currentPage);
  //         }

  //         var qrData =
  //           'Challan: ' + challanNo + '\\n' +
  //           'Date: ' + challanDate + '\\n' +
  //           'Article: ' + itemId + '\\n' +
  //           'Width: ' + width + '\\n' +
  //           'Color: ' + color + '\\n' +
  //           'Roll: ' + i + ' of ' + totalRoll;

  //         var block = document.createElement('div');
  //         block.className = 'qr-block';

  //         var challan = document.createElement('div');
  //         challan.className = 'qr-challan';
  //         challan.innerText = challanNo;

  //         var qrImg = document.createElement('img');
  //         qrImg.className = 'qr-img';
  //         qrImg.src = makeQR(qrData, 220);

  //         var label = document.createElement('div');
  //         label.className = 'qr-label';
  //         label.innerText = 'Roll ' + i + ' of ' + totalRoll;

  //         var date = document.createElement('div');
  //         date.className = 'qr-date';
  //         date.innerText = challanDate;

  //         block.appendChild(challan);
  //         block.appendChild(qrImg);
  //         block.appendChild(label);
  //         block.appendChild(date);

  //         currentPage.appendChild(block);
  //       }
  //     }

  //     window.onload = function () {
  //       renderQRCodes();

  //       setTimeout(function () {
  //         window.print();
  //       }, 500);
  //     };
  //   </script>
  // </body>
  // </html>
  // `;

  //     const win = window.open('', '_blank');

  //     if (win) {
  //       win.document.open();
  //       win.document.write(html);
  //       win.document.close();
  //     } else {
  //       alert('Unable to open new window. Please allow popups for this site.');
  //     }
  //   }

  async generateQrCodesPdf(item: any): Promise<void> {
    const challanNo = this.challanDetails?.master?.Chalan_No ?? '';
    const challanDate = this.challanDetails?.master?.Date ?? '';

    const itemId = item?.Article || item?.Article_No || item?.Description || '';

    // Correct mapping
    const color = item?.Color ?? '';
    const width = item?.Width ?? '';

    const rollCount = Number(
      item?.Roll || item?.Rolls || item?.RollValue || item?.RollBoxPcs || 0,
    );

    if (!rollCount || rollCount <= 0) {
      alert('Roll count not found.');
      return;
    }

    const totalRoll = rollCount;

    // A4 portrait in mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    /**
     * Calibration:
     * If client print is slightly shifted,
     * adjust only these values.
     */
    const offsetX = 0; // + means move right, - means move left
    const offsetY = 0; // + means move down, - means move up

    /**
     * Sticker positions from your marked sheet idea.
     * 5 columns x 5 rows = 25 stickers per page.
     * You can fine-tune these numbers after one test print.
     */
    const stickerBoxes = [
      { left: 11.3, top: 8.7, width: 37.1, height: 51.8 },
      { left: 48.4, top: 8.7, width: 37.9, height: 51.8 },
      { left: 86.3, top: 8.7, width: 37.1, height: 51.8 },
      { left: 123.4, top: 8.7, width: 37.0, height: 51.8 },
      { left: 160.4, top: 8.7, width: 38.3, height: 51.8 },

      { left: 11.3, top: 60.5, width: 37.1, height: 51.6 },
      { left: 48.4, top: 60.5, width: 37.9, height: 51.6 },
      { left: 86.3, top: 60.5, width: 37.1, height: 51.6 },
      { left: 123.4, top: 60.5, width: 37.0, height: 51.6 },
      { left: 160.4, top: 60.5, width: 38.3, height: 51.6 },

      { left: 11.3, top: 112.1, width: 37.1, height: 51.1 },
      { left: 48.4, top: 112.1, width: 37.9, height: 51.1 },
      { left: 86.3, top: 112.1, width: 37.1, height: 51.1 },
      { left: 123.4, top: 112.1, width: 37.0, height: 51.1 },
      { left: 160.4, top: 112.1, width: 38.3, height: 51.1 },

      { left: 11.3, top: 163.2, width: 37.1, height: 50.3 },
      { left: 48.4, top: 163.2, width: 37.9, height: 50.3 },
      { left: 86.3, top: 163.2, width: 37.1, height: 50.3 },
      { left: 123.4, top: 163.2, width: 37.0, height: 50.3 },
      { left: 160.4, top: 163.2, width: 38.3, height: 50.3 },

      { left: 11.3, top: 213.5, width: 37.1, height: 51.3 },
      { left: 48.4, top: 213.5, width: 37.9, height: 51.3 },
      { left: 86.3, top: 213.5, width: 37.1, height: 51.3 },
      { left: 123.4, top: 213.5, width: 37.0, height: 51.3 },
      { left: 160.4, top: 213.5, width: 38.3, height: 51.3 },
    ];

    const stickersPerPage = 25;

    for (let i = 1; i <= rollCount; i++) {
      const indexInPage = (i - 1) % stickersPerPage;

      if (i > 1 && indexInPage === 0) {
        pdf.addPage('a4', 'portrait');
      }

      const box = stickerBoxes[indexInPage];

      const qrData =
        `Challan: ${challanNo}\n` +
        `Date: ${challanDate}\n` +
        `Article: ${itemId}\n` +
        `Width: ${width}\n` +
        `Color: ${color}\n` +
        `Roll: ${i} of ${totalRoll}`;

      const qrImage = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 300,
      });

      const x = box.left + offsetX;
      const y = box.top + offsetY;

      const centerX = x + box.width / 2;

      const qrSize = 31.5;

      // Challan no
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text(String(challanNo), centerX, y + 5, {
        align: 'center',
      });

      // QR image
      pdf.addImage(qrImage, 'PNG', centerX - qrSize / 2, y + 7, qrSize, qrSize);

      // Roll label
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.text(`Roll ${i} of ${totalRoll}`, centerX, y + 42, {
        align: 'center',
      });

      // Optional date
      // pdf.setFont('helvetica', 'normal');
      // pdf.setFontSize(7);
      // pdf.text(String(challanDate), centerX, y + 46, {
      //   align: 'center'
      // });
    }

    this.printPdfBlob(pdf);
  }

  private printPdfBlob(pdf: jsPDF): void {
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');

    iframe.style.position = 'fixed';
    iframe.style.left = '0';
    iframe.style.top = '0';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.opacity = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-1';

    document.body.appendChild(iframe);

    iframe.onload = () => {
      // Give browser PDF viewer enough time to render
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 1500);
    };

    iframe.src = blobUrl;

    // Do NOT remove iframe quickly.
    // If user changes print settings, browser may need the PDF again.
    const cleanUp = () => {
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }

        URL.revokeObjectURL(blobUrl);
        window.removeEventListener('focus', cleanUp);
      }, 30000);
    };

    // Runs after print dialog closes in many browsers
    window.addEventListener('focus', cleanUp);
  }
}
