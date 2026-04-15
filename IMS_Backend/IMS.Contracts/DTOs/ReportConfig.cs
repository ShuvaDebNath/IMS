namespace IMS.Contracts.DTOs;

/// <summary>
/// Maps one row from the <c>ReportConfigs</c> database table.
/// Every column name is matched exactly so Dapper can map it automatically.
/// </summary>
public class ReportConfig
{
    public int    Id         { get; set; }
    public string ReportKey  { get; set; } = string.Empty;
    public string SpName     { get; set; } = string.Empty;
    public string RdlcPath   { get; set; } = string.Empty;
    public string TableName  { get; set; } = string.Empty;
    public string ReportName { get; set; } = string.Empty;
    public bool   IsActive   { get; set; }
}
