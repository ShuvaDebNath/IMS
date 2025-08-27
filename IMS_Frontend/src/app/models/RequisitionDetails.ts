export class RequisitionDetails
{
	private RequisitionDetailsId: string | any;
	public get _RequisitionDetailsId(): string
	{
		return this.RequisitionDetailsId;
	}
	public set _RequisitionDetailsId(val: string)
	{
		this.RequisitionDetailsId = val;
	}

	private RequisitionId: string | any;
	public get _RequisitionId(): string
	{
		return this.RequisitionId;
	}
	public set _RequisitionId(val: string)
	{
		this.RequisitionId = val;
	}



  private ProjectId: string | any;
	public get _ProjectId(): string
	{
		return this.ProjectId;
	}
	public set _ProjectId(val: string)
	{
		this.ProjectId = val;
	}

  private LedgerId: string | any;
	public get _LedgerId(): string
	{
		return this.LedgerId;
	}
	public set _LedgerId(val: string)
	{
		this.LedgerId = val;
	}


  private Description: string | any;
	public get _Description(): string
	{
		return this.Description;
	}
	public set _Description(val: string)
	{
		this.Description = val;
	}


  private UnitId: string | any;
	public get _UnitId(): string
	{
		return this.UnitId;
	}
	public set _UnitId(val: string)
	{
		this.UnitId = val;
	}


  private AppliedQty: string | any;
	public get _AppliedQty(): string
	{
		return this.AppliedQty;
	}
	public set _AppliedQty(val: string)
	{
		this.AppliedQty = val;
	}


  private Rate: string | any;
	public get _Rate(): string
	{
		return this.Rate;
	}
	public set _Rate(val: string)
	{
		this.Rate = val;
	}


  private Amount: string | any;
	public get _Amount(): string
	{
		return this.Amount;
	}
	public set _Amount(val: string)
	{
		this.Amount = val;
	}



	private Status: boolean | any;
	public get _Status(): boolean
	{
		return this.Status;
	}
	public set _Status(val: boolean)
	{
		this.Status = val;
	}


  private ApproveQty: string | any;
	public get _ApproveQty(): string
	{
		return this.ApproveQty;
	}
	public set _ApproveQty(val: string)
	{
		this.ApproveQty = val;
	}


  private ApproveRate: string | any;
	public get _ApproveRate(): string
	{
		return this.ApproveRate;
	}
	public set _ApproveRate(val: string)
	{
		this.ApproveRate = val;
	}


  private ApproveAmount: string | any;
	public get _ApproveAmount(): string
	{
		return this.ApproveAmount;
	}
	public set _ApproveAmount(val: string)
	{
		this.ApproveAmount = val;
	}


  private ApproveId: string | any;
	public get _ApproveId(): string
	{
		return this.ApproveId;
	}
	public set _ApproveId(val: string)
	{
		this.ApproveId = val;
	}


  private ApproveBy: string | any;
	public get _ApproveBy(): string
	{
		return this.ApproveBy;
	}
	public set _ApproveBy(val: string)
	{
		this.ApproveBy = val;
	}


  private ApproveDate: string | any;
	public get _ApproveDate(): string
	{
		return this.ApproveDate;
	}
	public set _ApproveDate(val: string)
	{
		this.ApproveDate = val;
	}


  private PayFromHOA: string | any;
	public get _PayFromHOA(): string
	{
		return this.PayFromHOA;
	}
	public set _PayFromHOA(val: string)
	{
		this.PayFromHOA = val;
	}


  private TranscationType: string | any;
	public get _TranscationType(): string
	{
		return this.TranscationType;
	}
	public set _TranscationType(val: string)
	{
		this.TranscationType = val;
	}


  private InstrumentType: string | any;
	public get _InstrumentType(): string
	{
		return this.InstrumentType;
	}
	public set _InstrumentType(val: string)
	{
		this.InstrumentType = val;
	}

  private ChequeNo: string | any;
	public get _ChequeNo(): string
	{
		return this.ChequeNo;
	}
	public set _ChequeNo(val: string)
	{
		this.ChequeNo = val;
	}

  private ChequeDate: string | any;
	public get _ChequeDate(): string
	{
		return this.ChequeDate;
	}
	public set _ChequeDate(val: string)
	{
		this.ChequeDate = val;
	}

  private PaymentType: string | any;
	public get _PaymentType(): string
	{
		return this.PaymentType;
	}
	public set _PaymentType(val: string)
	{
		this.PaymentType = val;
	}


  private DetailsTrackId: string | any;
	public get _DetailsTrackId(): string
	{
		return this.DetailsTrackId;
	}
	public set _DetailsTrackId(val: string)
	{
		this.DetailsTrackId = val;
	}


  private Voucher_Entry_Id: string | any;
	public get _Voucher_Entry_Id(): string
	{
		return this.Voucher_Entry_Id;
	}
	public set _Voucher_Entry_Id(val: string)
	{
		this.Voucher_Entry_Id = val;
	}


  private reference: string | any;
	public get _reference(): string
	{
		return this.reference;
	}
	public set _reference(val: string)
	{
		this.reference = val;
	}




	constructor (RequisitionDetailsId_: any,RequisitionId_: any,Status_: any,ProjectId_:any,LedgerId_:any,Description_:any,UnitId_:any,AppliedQty_:any,Rate_:any,Amount_:any,ApproveAppliedQty_:any,ApproveRate_:any,ApproveAmount_:any,ApproveId_:any,ApproveBy_:any,ApproveDate_:any,PayFromHOA_:any,TranscationType_:any,InstrumentType_:any,ChequeNo_:any,ChequeDate_:any,PaymentType_:any,DetailsTrackId_:any,VoucherEntryId_:any,reference_:any)
	{

		this._RequisitionDetailsId = RequisitionDetailsId_;
    this._DetailsTrackId = DetailsTrackId_;
		this._RequisitionId = RequisitionId_;
		this._Status = Status_;
		this._ProjectId = ProjectId_;
		this._LedgerId = LedgerId_;
		this._Description = Description_;
		this._UnitId = UnitId_;
		this._AppliedQty = AppliedQty_;
		this._Rate = Rate_;
		this._Amount = Amount_;
		this._ApproveQty = ApproveAppliedQty_;
		this._ApproveRate = ApproveRate_;
		this._ApproveAmount = ApproveAmount_;
		this._ApproveId = ApproveId_;
		this._ApproveBy = ApproveBy_;
		this._ApproveDate = ApproveDate_;
		this._PayFromHOA = PayFromHOA_;
		this._TranscationType = TranscationType_;
		this._InstrumentType = InstrumentType_;
		this._ChequeNo = ChequeNo_;
		this._ChequeDate = ChequeDate_;
    this._PaymentType = PaymentType_;
    this._Voucher_Entry_Id = VoucherEntryId_;
    this._reference = reference_;
	}
}
