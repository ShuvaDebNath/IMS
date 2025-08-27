export class Units
{
	private UnitID: string | any;
	public get _UnitID(): string
	{
		return this.UnitID;
	}
	public set _UnitID(val: string)
	{
		this.UnitID = val;
	}

	private UnitName: string | any;
	public get _UnitName(): string
	{
		return this.UnitName;
	}
	public set _UnitName(val: string)
	{
		this.UnitName = val;
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


	constructor (UnitID_: any,UnitName_: any,Status_: any)
	{

		this._UnitID = UnitID_;
		this._UnitName = UnitName_;
		this._Status = Status_
	}
}
