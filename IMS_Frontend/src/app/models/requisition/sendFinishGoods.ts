
export interface CreateSendFinishGoodsRequest {
  exportNumber: string | null;
  exportDate: string;    
  note?: string | null;
  totalQty: number;
  status: string | null;
  sentBy: number | null;
  isSeen: boolean;
  totalRoll: number;
  totalBag: number;
  totalKG: number;
  totalPiece: number;
  totalNetWeight: number;
  actionApplied?: string | null;
  items: CreateSendFinishGoodsItem[];
}

export interface CreateSendFinishGoodsItem {
  Item_ID: number;
  Quantity: number;            
  Note?: string | null;
  FG_DeliveryMasterID?: number | null;
  Roll_Bag: string | null;
  Sent_RollBag_Quantity: number;  
  Gross_Weight: number;

}

/** UPDATE (replace-all items, simplest & safest) */
export interface UpdateSendFinishGoodsRequest {
  status: string;
  id: number;                           // FG_DeliveryMasterID
  requisitionDate?: string;             // optional partial updates
  remarks?: string | null;
  items?: UpdateSendFinishGoodsItem[];    // send to fully replace items
}

export interface UpdateSendFinishGoodsItem {
  id?: number;                          // FG_DeliveryDetailsID (existing) — omit for new
  Item_ID: number;
  Note?: string | null;
  Quantity: number;
  rollBag: 'Rolls' | 'Bags';
  rollBagQuantity: number;
  unitId?: number | null;
}

/** READ (what API returns to the UI) */
export interface RmRequisitionDto {
  id: number;                           // RM_Requisition_MasterID
  requisitionNumber: string;
  requisitionDate: string;
  remarks?: string | null;
  status: string;
  isSeen: number;
  totalQty: number;
  totalRoll: number;
  totalBag: number;
  actionApplied?: string | null;
  items: RmRequisitionItemDto[];
}

export interface RmRequisitionItemDto {
  id: number;                   
  rawMaterialId: number;
  description?: string | null;
  quantity: number;
  rollBag: 'Rolls' | 'Bags';
  rollBagQuantity: number;
  unitId?: number | null;
}
