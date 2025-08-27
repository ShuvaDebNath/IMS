export class ProjectsDetails
{
	private ProjectID: string | any;
	public get _ProjectID(): string
	{
		return this.ProjectID;
	}
	public set _ProjectID(val: string)
	{
		this.ProjectID = val;
	}

	private ProjectName: string | any;
	public get _ProjectName(): string
	{
		return this.ProjectName;
	}
	public set _ProjectName(val: string)
	{
		this.ProjectName = val;
	}

	private ProjectShortName: string | any;
	public get _ProjectShortName(): string
	{
		return this.ProjectShortName;
	}
	public set _ProjectShortName(val: string)
	{
		this.ProjectShortName = val;
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

	private CompanyID: boolean | any;
	public get _CompanyID(): boolean
	{
		return this.CompanyID;
	}
	public set _CompanyID(val: boolean)
	{
		this.CompanyID = val;
	}


	constructor (ProjectID_: any,ProjectName_: any,Status_: any,ProjectShortName_: any,CompanyID_: any)
	{

		this._ProjectID = ProjectID_;
		this._ProjectName = ProjectName_;
		this._ProjectShortName = ProjectShortName_;
		this._Status = Status_;
		this._CompanyID = CompanyID_;
	}
}
