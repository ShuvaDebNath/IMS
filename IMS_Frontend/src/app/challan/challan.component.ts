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

@Component({
  standalone: true,
  selector: 'app-challan',
  templateUrl: './challan.component.html',
  styleUrls: ['./challan.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableModule,DividerModule, DialogModule, ButtonModule],
})
export class ChallanComponent implements OnInit {
  searchForm!: FormGroup;
  showTable = false;
  tableData: any[] = [];
  PageTitle: any;
  insertPermissions: any;
  updatePermissions: any;
  deletePermissions: any;
  printPermissions: any;
  datePipe = new DatePipe('en-US');

  constructor(private fb: FormBuilder, private gs: GlobalServiceService,private getDataService: GetDataService,
              private reportService: ReportService) {}

  isChallanDetailsVisible = false;
  challanDetails: any = null; 

  challanTotalsRolls: number = 0;
  challanTotalsDelivered: number = 0;

  isEditChallanVisible = false;
  editOldChallan: string = '';
  editNewChallan: string = '';

  isEditingDate: boolean = false;
  editDate: string = ''; 


  ngOnInit(): void {
    this.PageTitle = 'Challan'
    var permissions = this.gs.CheckUserPermission(this.PageTitle);
      this.insertPermissions = permissions.insertPermissions;
      this.updatePermissions = true; //permissions.updatePermissions;
      this.deletePermissions = true; //permissions.deletePermissions;
      this.printPermissions = true; //permissions.printPermissions;
    console.log(permissions);
    
      if (!this.printPermissions) {
        //window.location.href = 'dashboard';
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

      console.log(procedureData);
      

    // show loader while searching
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
        // close loader first
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
          // no data found or other error
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
    this.isEditChallanVisible = true;
  }

  saveEditChallan() {
    if (!this.editNewChallan) {
      Swal.fire('Validation', 'Please enter new Challan No', 'warning');
      return;
    }

    Swal.fire({
      title: 'Confirm',
      text: `Change challan no from ${this.editOldChallan} to ${this.editNewChallan}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it'
    }).then(result => {
      if (result.isConfirmed) {
        // First check whether the new challan no already exists
        const checkProc = {
          procedureName: 'usp_ChallanNoExistOrNot',
          parameters: { Chalan_No: this.editNewChallan }
        };

        this.getDataService.GetInitialData(checkProc).subscribe({
          next: (checkRes:any) => {
            if (checkRes.status) {
              // attempt to parse response and derive result defensively
              let exists = false;
              try {
                const ds = JSON.parse(checkRes.data || '{}');
                if (ds.Tables1 && ds.Tables1.length > 0) {
                  const firstRow = ds.Tables1[0];
                  const firstVal = firstRow[Object.keys(firstRow)[0]];
                  if (typeof firstVal === 'string' && firstVal.toLowerCase().includes('exist')) {
                    exists = firstVal.toLowerCase().includes('exist');
                  }
                } else if (typeof checkRes.data === 'string') {
                  // fallback: raw string contains 'Exists'
                  exists = checkRes.data.toLowerCase().includes('exist');
                }
              } catch (e) {
                // if parse fails, fallback to checking raw string
                exists = (checkRes.data || '').toString().toLowerCase().includes('exist');
              }

              if (exists) {
                Swal.fire('Info', 'Challan no already exist.', 'info');
                return;
              }

              // proceed to update since it doesn't exist
              const procedureData = {
                procedureName: 'usp_UpdateDeliveryChallanNo',
                parameters: {
                  OldChalanNo: this.editOldChallan,
                  NewChalanNo: this.editNewChallan
                }
              };

              this.getDataService.GetInitialData(procedureData).subscribe({
                next: (res:any) => {
                  if (res.status) {
                    Swal.fire('Success', 'Challan number updated', 'success');
                    this.isEditChallanVisible = false;
                    this.openChallanDetails(this.editNewChallan);
                  } else {
                    Swal.fire('Error', res.msg || 'Failed to update challan', 'error');
                  }
                },
                error: () => Swal.fire('Error', 'Failed to update challan', 'error')
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
    });
  }

    
    toggleEditDate(): void {
      this.isEditingDate = !this.isEditingDate;
      if (this.isEditingDate && this.challanDetails && this.challanDetails.master) {
        // prefer ISO yyyy-MM-dd if available
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
      }
    }

    saveDateChange(): void {
      if (!this.editDate) {
        Swal.fire('Validation', 'Please select a date', 'warning');
        return;
      }
      const old = this.challanDetails?.master?.Chalan_No || this.challanDetails?.master?.ChallanNo;
      if (!old) {
        Swal.fire('Error', 'Original challan number missing', 'error');
        return;
      }

      const procedureData = {
        procedureName: 'usp_UpdateDeliveryChallanDate',
        parameters: {
          Chalan_No: old,
          NewDate: this.editDate
        }
      };

      this.getDataService.GetInitialData(procedureData).subscribe({
        next: (res:any) => {
          if (res.status) {
            Swal.fire('Success', 'Date updated', 'success');
            if (this.challanDetails && this.challanDetails.master) {
              this.challanDetails.master.Date = this.editDate;
            }
            this.isEditingDate = false;
          } else if (res.msg === 'Invalid Token') {
            Swal.fire('Session Expired!', 'Please Login Again.', 'info');
            this.gs.Logout();
          } else {
            Swal.fire('Error', res.msg || 'Failed to update date', 'error');
          }
        },
        error: () => Swal.fire('Error', 'Failed to update date', 'error')
      });
    }

   
    deleteChallan(): void {
      const challanNo = this.challanDetails?.master?.Chalan_No || this.challanDetails?.master?.ChallanNo;
    if (!challanNo) { Swal.fire('Error', 'Challan no missing', 'error'); return; }

      Swal.fire({
        title: 'Delete Challan?',
        text: `Are you sure you want to delete challan ${challanNo}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete'
      }).then((r) => {
        if (r.isConfirmed) {
          const proc = { procedureName: 'usp_DeleteDeliveryChallan', parameters: { Chalan_No: challanNo } };
          this.getDataService.GetInitialData(proc).subscribe({
            next: (res:any) => {
              if (res.status) {
                Swal.fire('Deleted', 'Challan deleted', 'success');
                this.isChallanDetailsVisible = false;
                this.tableData = this.tableData.filter(t => (t.Chalan_No||t.challanNo||t.ChalanNo) !== challanNo);
              } else {
                Swal.fire('Error', res.msg || 'Failed to delete challan', 'error');
              }
            }, error: () => Swal.fire('Error', 'Failed to delete challan', 'error')
          });
        }
      });
    }

    printChallan(challanNo?: string): void {
      const no = challanNo || this.challanDetails?.master?.Chalan_No || this.challanDetails?.master?.ChallanNo;
      if (!no) { Swal.fire('Error', 'Challan no missing', 'error'); return; }
      const payload = { Chalan_No: no };
      this.reportService.PrintDeliveryChallanReport(payload, 'pdf', true);
    }

    
    onChallanClick(challanNo: string): void {
      if (!challanNo) return;
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
}
