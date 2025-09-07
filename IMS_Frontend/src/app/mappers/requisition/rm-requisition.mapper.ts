import { CreateRmRequisitionRequest, UpdateRmRequisitionRequest } from "src/app/models/requisition/rmRequisition";


type MasterDetailsPayload = {
  tableNameMaster: string;
  tableNameChild: string;
  columnNamePrimary: string;
  columnNameForign: string;
  columnNameSerialNo: string;
  serialType: string;
  data: any;
  detailsData: any[];
  whereParams?: Record<string, string>;
};

function computeTotals(items: { quantity: number; rollBag: 'Rolls'|'Bags'; rollBagQuantity: number }[]) {
  let qty = 0, rolls = 0, bags = 0;
  for (const r of items || []) {
    qty += Number(r.quantity) || 0;
    if (r.rollBag === 'Rolls') rolls += Number(r.rollBagQuantity) || 0;
    else bags += Number(r.rollBagQuantity) || 0;
  }
  return { qty, rolls, bags };
}

export function mapCreateToGeneric(req: CreateRmRequisitionRequest): MasterDetailsPayload {
  const t = computeTotals(req.items);

  return {
    tableNameMaster: 'tbl_rm_requisition_master',
    tableNameChild: 'tbl_rm_requisition_details',
    columnNamePrimary: 'RM_Requisition_MasterID',
    columnNameForign: 'RM_Requisition_MasterID',
    columnNameSerialNo: '',
    serialType: '',
    data: {
      RequisitionNumber: req.requisitionNumber ?? null,
      RequisitionDate: req.requisitionDate,
      Remarks: req.remarks ?? '',
      Total_Qty: req.totalQty ?? t.qty,
      Total_bag: req.totalBag ?? t.bags,
      Total_Roll: req.totalRoll ?? t.rolls,
      Sent_By: String(req.sentBy),
      Status: req.status ?? 'Pending',
      IsSeen: Boolean(req.isSeen ?? false)
    },
    detailsData: req.items.map(r => ({
      RawMaterial_ID: String(r.rawMaterialId),
      Quantity: Number(r.quantity) || 0,
      RM_Requisition_MasterID: '',                  // backend fills on insert
      Description: r.description ?? '',
      Unit: '',
      Roll_Bag: r.rollBag,                          // 'Rolls' | 'Bags'
      RollBag_Quantity: Number(r.rollBagQuantity) || 0,
      Unit_ID: r.unitId == null ? '' : String(r.unitId)
    }))
  };
}

export function mapUpdateToGeneric(req: UpdateRmRequisitionRequest): MasterDetailsPayload {
  const t = computeTotals(req.items || []);

  return {
    tableNameMaster: 'tbl_rm_requisition_master',
    tableNameChild: 'tbl_rm_requisition_details',
    columnNamePrimary: 'RM_Requisition_MasterID',
    columnNameForign: 'RM_Requisition_MasterID',
    columnNameSerialNo: '',
    serialType: '',
    data: {
      RequisitionDate: req.requisitionDate,
      Remarks: req.remarks ?? '',
      Total_Qty: t.qty,
      Total_bag: t.bags,
      Total_Roll: t.rolls,
      Status: req.status ?? 'Pending',
      IsSeen: false
    },
    detailsData: (req.items || []).map(r => ({
      RawMaterial_ID: String(r.rawMaterialId),
      Quantity: Number(r.quantity) || 0,
      RM_Requisition_MasterID: String(req.id),
      Description: r.description ?? '',
      Unit: '',
      Roll_Bag: r.rollBag,
      RollBag_Quantity: Number(r.rollBagQuantity) || 0,
      Unit_ID: r.unitId == null ? '' : String(r.unitId),
      RM_Requisition_DetailsID: r.id == null ? undefined : String(r.id)
    })),
    whereParams: { RM_Requisition_MasterID: String(req.id) }
  };
}
