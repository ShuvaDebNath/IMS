export interface IVoucherDetailsData{
    Voucher_Details_Id: string;
    Voucher_Entry_Id : string;
    TransactionType: string;
    ledger_id: string;
    PaymentTitle: string;
    TotalAmount: number;
    Particular: string;
    OriginalRate: number;
    Rate: number;
    Qty: number;
    ChequeNo: string;
    ChequeDate?: Date;
    InstrumentType: string;
    PvcContent: number;
    POUnitPrice: number;
    Incentive: number;
    Deduction: number;
    FGS_Id: string;
    PIFGS_Id: string;
  }