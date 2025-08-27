import { IVoucherDetailsData } from "./voucherDetailsData";

export interface IVoucherSingleData {
     Voucher_Entry_Id: string; 
     Fiscal_Year_Id : string;
     V_Type_Id : string;
     FullVoucher_No: string; 
     ApprovedBy: string; 
     ApprovedDate? : Date
     Approve : string;
     SubmitBy : string;
     SubmitDate? : Date;
     MakeBy : string;
     MakeDate? : Date;
     UpdateBy: string;      
     UpdateDate? : Date;
     VoucherDate? : Date;
     Narration : string;
     InventoryType : string;
     PostingStatus : boolean;
     JVDate_AgainstDV? : Date;
     DOLNo : string;
     DO_Date? : Date
     DebitVoucherDate? : Date;
     CreditVoucherDate? : Date;
     JVDate_AgainstCV? : Date;
     PO_Purchase: string; 
     CurrencyShortName : string;
     SuppType : string;
     UserRoleID : string;     
     ChallanNo : string;
     ChallanDate? : Date;
     MRR_No : string;
     SuppliertItemTypes : string;
     CategoryId : string;
     Supplier_PO_No : string;
     PINumber : string;
     PIType : string;
     MushokChallanNo : string;
     ClientTypeStatus : string;
     ConvertionRate : number;
     LCNumber : string; 
     PI_Sales : string;
     PaymentType : string;
     TruckNo : string;
     UFDB : string;
     DeliveryChallanNo : string;
     CompanyId : string;
     ReceiveSerialNoForUpdate_GP? : string;
     JVVoucher_AgainstDV_SingleOrMultiple: string;
     JVDate_AgainstDV_SingleOrMultiple? : string;
     INVS_Type : string;
     ColorId: string;
     INVS_ProcessName: string;
  }
  