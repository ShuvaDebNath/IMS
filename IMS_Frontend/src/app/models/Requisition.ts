export class Requisition
{
	private RequisitionId: string | any;
	public get _RequisitionId(): string
	{
		return this.RequisitionId;
	}
	public set _RequisitionId(val: string)
	{
		this.RequisitionId = val;
	}

	private RequisitionNo: string | any;
	public get _RequisitionNo(): string
	{
		return this.RequisitionNo;
	}
	public set _RequisitionNo(val: string)
	{
		this.RequisitionNo = val;
	}

  private RequisitionDate: string | any;
	public get _RequisitionDate(): string
	{
		return this.RequisitionDate;
	}
	public set _RequisitionDate(val: string)
	{
		this.RequisitionDate = val;
	}

  private TotalAppliedQty: string | any;
	public get _TotalAppliedQty(): string
	{
		return this.TotalAppliedQty;
	}
	public set _TotalAppliedQty(val: string)
	{
		this.TotalAppliedQty = val;
	}

  private TotalAppliedAmount: string | any;
	public get _TotalAppliedAmount(): string
	{
		return this.TotalAppliedAmount;
	}
	public set _TotalAppliedAmount(val: string)
	{
		this.TotalAppliedAmount = val;
	}

  private TotalApprovedQty: string | any;
	public get _TotalApprovedQty(): string
	{
		return this.TotalApprovedQty;
	}
	public set _TotalApprovedQty(val: string)
	{
		this.TotalApprovedQty = val;
	}


  private TotalApprovedAmount: string | any;
	public get _TotalApprovedAmount(): string
	{
		return this.TotalApprovedAmount;
	}
	public set _TotalApprovedAmount(val: string)
	{
		this.TotalApprovedAmount = val;
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

	private CompanyId: boolean | any;
	public get _CompanyId(): boolean
	{
		return this.CompanyId;
	}
	public set _CompanyId(val: boolean)
	{
		this.CompanyId = val;
	}

	constructor (RequisitionId_: any,RequisitionNo_: any,Status_: any,RequisitionDate_:any,TotalAppliedQty_:any,TotalApprovedQty_:any,TotalAppliedAmount_:any,TotalApprovedAmount_:any,CompanyId_:any)
	{

		this._RequisitionId = RequisitionId_;
		this._RequisitionNo = RequisitionNo_;
		this._Status = Status_;
		this._RequisitionDate = RequisitionDate_;
		this._TotalAppliedQty = TotalAppliedQty_;
		this._TotalAppliedAmount = TotalAppliedAmount_;
		this._TotalApprovedQty = TotalApprovedQty_;
		this._TotalApprovedAmount = TotalApprovedAmount_;
		this._CompanyId = CompanyId_;
	}
}
