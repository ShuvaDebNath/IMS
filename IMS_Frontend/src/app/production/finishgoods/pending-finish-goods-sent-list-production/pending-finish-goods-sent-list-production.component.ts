import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import swal from 'sweetalert2';
import { GlobalServiceService } from 'src/app/services/Global-service.service';
import { Router } from '@angular/router';
import { GetDataService } from 'src/app/services/getData/getDataService.service';
import { DoubleMasterEntryService } from 'src/app/services/doubleEntry/doubleEntryService.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'app-pending-finish-goods-sent-list-production',
  templateUrl: './pending-finish-goods-sent-list-production.component.html',
  styleUrls: ['./pending-finish-goods-sent-list-production.component.css'],
  imports: [FormsModule, CommonModule, TableModule, InputTextModule, DialogModule, ButtonModule],
})
export class PendingFinishGoodsSentListProductionComponent implements OnInit {
  pendingFinishGoodsSentList: any[] = [];
  StockLocationItems: any[] = [];
  detailsData: any = null;
  isDetailsVisible = false;
  isDetailsVisible_for_Receive = false;

  constructor(
    private getDataService: GetDataService,
    private gs: GlobalServiceService,
    private title: Title,
    private router: Router,
    private dme: DoubleMasterEntryService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Pending Finish Goods Send List');
    this.loadPendingFinishGoodsSendList();
  }

  loadPendingFinishGoodsSendList(): void {
    const sentByStr = localStorage.getItem('userId');
    const sentBy = sentByStr ? Number(sentByStr) : null;

    const procedureData = {
      procedureName: 'usp_FinishGoods_Send_and_Receive_InitialData',
      parameters: { Type: 'Send' }
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          this.pendingFinishGoodsSentList = JSON.parse(results.data).Tables1;
          this.StockLocationItems = JSON.parse(results.data).Tables2;
        } else if (results.msg === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        }
      },
      error: () => {}
    });
  }

  onDelete(row: any) { 

     const id = String(row?.ExportMasterID ?? '');

    if (!id) {
      swal.fire('Missing Id', 'ExportMasterID not found.', 'info');
      return;
    }

    swal.fire({
      title: 'Are you sure?',
      text: `Delete finish goods send ${row?.ExportNumber || ''}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then(res => {
      if (!res.isConfirmed) return;

    const fd: any[] = [];                              // detailsData -> empty for delete
    const tableName = 'tbl_finished_goods_delivery_details';    // child table
    const fdMaster: any = {};                          // data -> empty for delete
    const tableNameMaster = 'tbl_finished_goods_delivery_master';
    const primaryColumnName = 'ExportMasterID';
    const columnNameForign  = 'ExportMasterID';
    const serialType = '';
    const columnNameSerialNo = '';
    const whereParams = { ExportMasterID: id };

    this.dme.DeleteDataMasterDetails(
      fd,
      tableName,
      fdMaster,
      tableNameMaster,
      primaryColumnName,
      columnNameForign,
      serialType,
      columnNameSerialNo,
      whereParams
    ).subscribe({
        next: () => {
          swal.fire('Deleted!', 'Send Goods deleted successfully.', 'success');
          this.loadPendingFinishGoodsSendList(); 
        },
        error: (err) => {
          console.error(err);
          swal.fire('Delete Failed', err?.error?.message || 'Something went wrong.', 'info');
        }
      });
    });
  
   }

  onDetails(row: any): void {
    const procedureData = {
      procedureName: 'usp_FinishGoods_Send_and_Receive_GetDataById',
      parameters: { ExportMasterID: row.ExportMasterID }
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          const items = JSON.parse(results.data).Tables1;
          this.detailsData = {
            ExportMasterID: row.ExportMasterID,
            ExportNumber: row.ExportNumber,
            Export_Date: row.Export_Date,
            Note: row.MasterNote,
            Total_Qty: row.Total_Qty,
            Total_Bag: row.Total_Bag,
            Total_Roll: row.Total_Roll,
            Total_Piece: row.Total_Piece,
            Total_KG: row.Total_KG,
            Net_Weight: row.Net_Weight,
            SendBy: row.SendBy,
            ReceiveBy: row.ReceiveBy,
            Items: items
          };
          this.isDetailsVisible = true; 
        } else if (results.msg === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
          swal.fire('Error!', 'Failed to load details.', 'info');
        }
      },
      error: () => swal.fire('Error!', 'An error occurred while fetching details.', 'info')
    });
  }

  onReceive(row: any): void {
   const procedureData = {
      procedureName: 'usp_FinishGoods_Send_and_Receive_GetDataById',
      parameters: { ExportMasterID: row.ExportMasterID }
    };

    this.getDataService.GetInitialData(procedureData).subscribe({
      next: (results) => {
        if (results.status) {
          const items = JSON.parse(results.data).Tables1;
          this.detailsData = {
            ExportMasterID: row.ExportMasterID,
            ExportNumber: row.ExportNumber,
            Export_Date: row.Export_Date,
            Note: row.MasterNote,
            Total_Qty: row.Total_Qty,
            Total_Bag: row.Total_Bag,
            Total_Roll: row.Total_Roll,
            Total_Piece: row.Total_Piece,
            Total_KG: row.Total_KG,
            Net_Weight: row.Net_Weight,
            SendBy: row.SendBy,
            ReceiveBy: row.ReceiveBy,
            Items: items
          };
          this.isDetailsVisible_for_Receive = true; 
        } else if (results.msg === 'Invalid Token') {
          swal.fire('Session Expired!', 'Please Login Again.', 'info');
          this.gs.Logout();
        } else {
          swal.fire('Error!', 'Failed to load details.', 'info');
        }
      },
      error: () => swal.fire('Error!', 'An error occurred while fetching details.', 'info')
    });
  }

   onReceiveFromWarehouse(data: any): void {
          const sentByStr = localStorage.getItem('userId');
              const sentBy = sentByStr ? Number(sentByStr) : null;

              let totalAcceptedQty = 0;
              let totalAcceptedRollBagQty = 0;

              let allReceived = true;
              for (const r of data.Items as any[]) {
                const acceptedQty = Number(r?.AcceptedQuantity ?? 0);
                const acceptedRollBagQty = Number(r?.AcceptedRollBag_Qty ?? 0);
                const qty = Number(r?.Quantity ?? 0);
                const sentRollBagQty = Number(r?.Sent_RollBag_Quantity ?? 0);

                totalAcceptedQty += acceptedQty;
                totalAcceptedRollBagQty += acceptedRollBagQty;

                if (acceptedQty !== qty || acceptedRollBagQty !== sentRollBagQty) {
                  allReceived = false;
                  break;
                }
              }
              const status = allReceived ? 'Received' : 'Partially Received';
          
              const masterRow = {
                ExportMasterID: data.ExportMasterID,
                ExportNumber: data.ExportNumber,
                ExportDate: data.Export_Date,
                Note: data.MasterNote ?? '',
                Received_By: sentBy,
                Received_Date: this.nowSql(),
                Status: status,
                TotalAcceptQty: totalAcceptedQty,
                TotalAcceptRollBagQty: totalAcceptedRollBagQty
              };
          
              const detailRows = (data.Items as any[]).map(r => ({
                FG_DeliveryMasterID: data.ExportMasterID,
                AcceptedQuantity: Number(r?.AcceptedQuantity ?? 0),
                AcceptedRollBag_Qty: Number(r?.AcceptedRollBag_Qty ?? 0),
                Note: r?.Note ?? '',
                Item_ID: r?.Item_ID,
                Quantity: r?.Quantity,
                Sent_RollBag_Quantity: r?.Sent_RollBag_Quantity,
                Roll_Bag: r?.Roll_Bag,
                Gross_Weight: r?.Gross_Weight,
              }));
          
              const detailRowsForStockUpdate = (data.Items as any[]).map(r => ({
                Stock_Location_ID: r?.Stock_Location_ID,
                Item_ID: r?.Item_ID,
                Stock_In: Number(r?.AcceptedQuantity ?? 0),
                Stock_Change_Date: this.nowSql(),
                Roll_In: r?.Roll_Bag.toLowerCase() === 'roll' ||  r?.Roll_Bag.toLowerCase() === 'yard' ? Number(r?.AcceptedRollBag_Qty ?? 0) : 0,
                Bag_In: r?.Roll_Bag.toLowerCase() === 'bag' ? Number(r?.AcceptedRollBag_Qty ?? 0) : 0,
                FG_DeliveryMasterID: data.ExportMasterID,
                Note: r?.Note ?? ''
              }));
          
              const whereParams = { ExportMasterID: data.ExportMasterID };
              // First update master/details, then update stock only if first succeeds
              this.dme.UpdateDataMasterDetails(
                detailRows,
                'tbl_finished_goods_delivery_details',
                masterRow,
                'tbl_finished_goods_delivery_master',
                'ExportMasterID',
                'FG_DeliveryMasterID',
                '',
                '',
                whereParams
              ).subscribe({
                next: () => {
                  // Now call SaveData for stock update
                  this.dme.SaveData(detailRowsForStockUpdate, 'tbl_stock').subscribe({
                    next: (res) => {
                      if (res.messageType === 'Success' && res.status) {
                        this.isDetailsVisible_for_Receive = false;
                        swal.fire('Congratulation', 'Data saved successfully.', 'success').then(() => {
                          this.loadPendingFinishGoodsSendList();
                        });
                      } else {
                        swal.fire('Stock Update Failed', res?.message || 'Stock update failed.', 'info');
                      }
                    },
                    error: (err) => {
                      console.error(err);
                      swal.fire('Stock Update Failed', err?.error?.message || 'Stock update failed.', 'info');
                    }
                  });
                },
                error: (err) => {
                  console.error(err);
                  swal.fire('Accept Failed', err?.error?.message || 'Something went wrong.', 'info');
                }
              });
      }

        private nowSql(d = new Date()): string {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} `
            + `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
}
