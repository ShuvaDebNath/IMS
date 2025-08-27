export class Roles
{
	private ID: string | any;
	public get _ID(): string
	{
		return this.ID;
	}
	public set _ID(val: string)
	{
		this.ID = val;
	}

	private Roles: string | any;
	public get _Roles(): string
	{
		return this.Roles;
	}
	public set _Roles(val: string)
	{
		this.Roles = val;
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

	private totallen: string | any;
	public get _totallen(): string
	{
		return this.totallen;
	}
	public set _totallen(val: string)
	{
		this.totallen = val;
	}

	constructor (ID_: any,Roles_: any,Status_: any,totallen_: any)
	{

		this._ID = ID_;
		this._Roles = Roles_;
		this._Status = Status_;
		this._totallen = totallen_;
	}
}
