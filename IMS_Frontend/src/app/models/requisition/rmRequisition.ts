
export interface CreateRmRequisitionRequest {
  requisitionNumber: string | null;
  requisitionDate: string;    
  totalQty: number;
  sentBy: number | null;
  status: string | null;
  isSeen: boolean;
  remarks?: string | null;
  totalRoll: number;
  totalBag: number;
  actionApplied?: string | null;
  items: CreateRmRequisitionItem[];
}

export interface CreateRmRequisitionItem {
  rawMaterialId: number;
  description?: string | null;
  quantity: number;            
  rollBag: 'Rolls' | 'Bags';
  rollBagQuantity: number;  
  unitId?: number | null;
  RM_Requisition_MasterID?: number | null;

}

/** UPDATE (replace-all items, simplest & safest) */
export interface UpdateRmRequisitionRequest {
  status: string;
  id: number;                           // RM_Requisition_MasterID
  requisitionDate?: string;             // optional partial updates
  remarks?: string | null;
  items?: UpdateRmRequisitionItem[];    // send to fully replace items
}

export interface UpdateRmRequisitionItem {
  id?: number;                          // RawMaterialRequisitionDetailsID (existing) — omit for new
  rawMaterialId: number;
  description?: string | null;
  quantity: number;
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
