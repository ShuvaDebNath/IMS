import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
@Component({
  standalone: true,
  selector: 'app-challan',
  templateUrl: './challan.component.html',
  styleUrls: ['./challan.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableModule,DividerModule, DialogModule, ButtonModule],
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

    private setEditDateMessage(msg: string, type: 'success' | 'error' | 'info' | 'warning') {
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

  constructor(private fb: FormBuilder,
    private gs: GlobalServiceService,
    private getDataService: GetDataService,
    private reportService: ReportService,
    private masterEntryService: MasterEntryService,
    private router: Router) { }

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
    this.PageTitle = 'Challan'
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
            FromDate : fromDate || '',
            ToDate : toDate || '',
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
      parameters: { Chalan_No: challanNo }
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results:any) => {
        if (results.status) {
          const json = JSON.parse(results.data || '{}');
          const details = json.Tables1 || [];
          const master = (json.Tables2 && json.Tables2.length>0) ? json.Tables2[0] : (json.Tables1 && json.Tables1.length>0 ? json.Tables1[0] : null);
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
      error: (err:any) => {
        Swal.fire('Error', 'An error occurred while fetching challan info', 'error');
      }
    });
  }

  computeChallanTotals(details: any[]): void {
    this.challanTotalsRolls = 0;
    this.challanTotalsDelivered = 0;
    if (!details || !Array.isArray(details)) return;
    for (const r of details) {
      const roll = Number(r.Roll ?? r.Rolls ?? r.RollValue ?? r.RollBoxPcs) || 0;
      const delivered = Number(r.Delivered ?? r.DeliveredQty ?? r.Quantity ?? r.Deliverd_In_Meter) || 0;
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

  private setEditChallanMessage(msg: string, type: 'success' | 'error' | 'info' | 'warning') {
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
      parameters: { Chalan_No: this.editNewChallan }
    };

    this.getDataService.GetInitialData(checkProc).subscribe({
      next: (checkRes:any) => {
        if (checkRes.status) {
         
          let exists = false;
          try {
            const ds = JSON.parse(checkRes.data || '{}');
            if (ds.Tables1 && ds.Tables1.length > 0) {
              const firstRow = ds.Tables1[0];
              const firstValRaw = firstRow[Object.keys(firstRow)[0]];
              const firstVal = (firstValRaw ?? '').toString().trim().toLowerCase();
            
              if (firstVal === 'exists' || firstVal === 'exist' || firstVal === 'true' || firstVal === '1') {
                exists = true;
              } else if (firstVal === 'not exists' || firstVal === 'not exist' || firstVal === 'notexists' || firstVal === 'false' || firstVal === '0') {
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
              if (raw === 'exists' || raw === 'exist' || raw === 'true' || raw === '1') {
                exists = true;
              } else if (raw === 'not exists' || raw === 'not exist' || raw === 'false' || raw === '0') {
                exists = false;
              } else {
                if (raw.includes('not') && raw.includes('exist')) exists = false;
                else if (raw.includes('exist')) exists = true;
              }
            }
          } catch (e) {
           
            const raw = (checkRes.data || '').toString().trim().toLowerCase();
            if (raw === 'exists' || raw === 'exist' || raw === 'true' || raw === '1') {
              exists = true;
            } else if (raw === 'not exists' || raw === 'not exist' || raw === 'false' || raw === '0') {
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
          this.masterEntryService.UpdateData(updateParams, updateCondition, updateTable).subscribe({
            next: (res: any) => {
              let updateSuccess = false;
              if (res.status) {
                updateSuccess = true;
              } else {
              
                const msg = (res.msg || '').toString().toLowerCase();
                const data = (res.data || '').toString().toLowerCase();
                if (msg.includes('success') || msg.includes('updated') || msg.includes('done') || msg.includes('changed')) {
                  updateSuccess = true;
                } else if (data.includes('success') || data.includes('updated') || data.includes('done') || data.includes('changed')) {
                  updateSuccess = true;
                }
              }
              if (updateSuccess) {
                this.setEditChallanMessage('Challan number updated', 'success');
                setTimeout(() => {
                  this.isEditChallanVisible = false;
                  this.openChallanDetails(this.editNewChallan);
                  this.onSearch();
                  this.clearEditChallanMessage();
                }, 1200);
              } else {
                this.setEditChallanMessage(res.msg || 'Failed to update challan', 'error');
              }
            },
            error: () => this.setEditChallanMessage('Failed to update challan', 'error')
          });
        } else {
          if (checkRes.msg === 'Invalid Token') {
            Swal.fire('Session Expired!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {
            Swal.fire('Error', checkRes.msg || 'Failed to validate challan', 'error');
          }
        }
      },
      error: () => {
        Swal.fire('Error', 'Failed to validate challan', 'error');
      }
    });
  }

    
    toggleEditDate(): void {
      this.isEditingDate = !this.isEditingDate;
      if (this.isEditingDate && this.challanDetails && this.challanDetails.master) {
       
        const raw = this.challanDetails.master?.Date || this.challanDetails.master?.PIDate || this.challanDetails.master?.DeliveryDate;
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
      const updateCondition = { Chalan_No: this.challanDetails?.master?.Chalan_No };
      const updateTable = 'tbl_pi_ledger';
      this.masterEntryService.UpdateData(updateParams, updateCondition, updateTable).subscribe({
        next: (res: any) => {
          let updateSuccess = false;
          if (res.status) {
            updateSuccess = true;
          } else {
            const msg = (res.msg || '').toString().toLowerCase();
            const data = (res.data || '').toString().toLowerCase();
            if (msg.includes('success') || msg.includes('updated') || msg.includes('done') || msg.includes('changed')) {
              updateSuccess = true;
            } else if (data.includes('success') || data.includes('updated') || data.includes('done') || data.includes('changed')) {
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
            this.setEditDateMessage('Session Expired! Please Login Again.', 'info');
            this.gs.Logout();
          } else {
            this.setEditDateMessage(res.msg || 'Failed to update date', 'error');
          }
        },
        error: () => this.setEditDateMessage('Failed to update date', 'error')
      });
  }

  deleteChallan(): void {
    const challanNo = this.challanDetails?.master?.Chalan_No || this.challanDetails?.master?.ChallanNo;
    if (!challanNo) {
      Swal.fire('Error', 'Challan no missing', 'error');
      return;
    }
    Swal.fire({
      title: 'Delete Challan?',
      text: `Are you sure you want to delete challan ${challanNo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete'
    }).then((r) => {
      if (r.isConfirmed) {
       
        const model: any = {
          tableName: 'tbl_pi_ledger',
          whereParams: { Chalan_No: challanNo }
        };
        this.masterEntryService.DeleteData(model).subscribe({
          next: (res: any) => {
            if (res.status) {
              Swal.fire('Deleted', 'Challan deleted', 'success');
              this.isChallanDetailsVisible = false;
              this.tableData = this.tableData.filter(t => (t.Chalan_No||t.challanNo||t.ChalanNo) !== challanNo);
            } else {
              Swal.fire('Error', res.msg || 'Failed to delete challan', 'error');
            }
          },
          error: () => Swal.fire('Error', 'Failed to delete challan', 'error')
        });
      }
    });
  }

  printChallan(challanNo?: string): void {
    const no = challanNo || this.challanDetails?.master?.Chalan_No || this.challanDetails?.master?.ChallanNo;
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
    }).then(result => {
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

  generateQrCodes(item: any): void {    

    // Generate QR codes and display in a new window, 8 per row
    const challanNo = this.challanDetails?.master?.Chalan_No;
    const challanDate = this.challanDetails?.master?.Date;
    const itemId = item?.Article || item?.Article_No || item?.Description || '';
    const width = item?.Color || '';
    const color = item?.Width || '';
    const rollCount = Number(item?.Roll || item?.Rolls || item?.RollValue || item?.RollBoxPcs || 0);
    const totalRoll = rollCount; // Assuming totalRoll is equivalent to rollCount

    // Use CDN for QRCode generation
    const qrLibUrl = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
    let html = `<html><head><title>QR Codes</title>
      <style>
        body { font-family: Arial, sans-serif; }
        .qr-row { display: flex; justify-content: flex-start; margin-bottom: 24px; }
        .qr-block { text-align: center; margin: 8px; }
        .qr-label { margin-top: 8px; font-size: 15px; }
      </style>
      <script src='${qrLibUrl}'></script>
    </head><body>`;
    html += `<h2 style='text-align:center;'>QR Codes for Challan ${challanNo}</h2>`;
    html += `<div id='qr-container'></div>`;
    html += `<script>
      function makeQR(data, size) {
        var qr = new QRious({ value: data, size: size });
        return qr.toDataURL();
      }
      function renderQRCodes() {
        var container = document.getElementById('qr-container');
        var rollCount = ${rollCount};
        var challanNo = '${challanNo}';
        var challanDate = '${challanDate}';
        var itemId = '${itemId}';
        var width = '${width}';
        var color = '${color}';
        var totalRoll = '${totalRoll}';
        var perRow = 8;
        for (var i = 1; i <= rollCount; i++) {
          if ((i-1) % perRow === 0) {
            var rowDiv = document.createElement('div');
            rowDiv.className = 'qr-row';
            container.appendChild(rowDiv);
          }
          var qrData = ("Challan: " + challanNo + "\\n" +
              "Date: " + challanDate + "\\n" +
              "Article: " + itemId + "\\n" +
              "Width: " + width + "\\n" +
              "Color: " + color + "\\n" +
              "Roll: " + i);
              
          var qrImg = document.createElement('img');
          qrImg.src = makeQR(qrData, 140);
          qrImg.width = 140;
          qrImg.height = 140;
          var block = document.createElement('div');
          block.className = 'qr-block';
          var label = document.createElement('div');
          label.className = 'qr-label';
              label.innerHTML = challanNo + '<br>Roll ' + i + ' of ' + totalRoll;
          block.appendChild(qrImg);
          block.appendChild(label);
          container.lastChild.appendChild(block);
        }
      }
      window.onload = function() { renderQRCodes(); };
    </script>`;
    html += `</body></html>`;
    var win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    } else {
      alert('Unable to open new window. Please allow popups for this site.');
    }
  }
}
