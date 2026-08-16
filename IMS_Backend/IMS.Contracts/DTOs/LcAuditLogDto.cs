namespace IMS.Contracts.DTOs;

public class LcAuditLogResponse
{
    public string               LcNo         { get; set; } = string.Empty;
    public string               ConsigneeName { get; set; } = string.Empty;
    public List<LcAuditLogEntry> Logs        { get; set; } = new();
}

public class LcAuditLogEntry
{
    public string   EventType     { get; set; } = string.Empty;  // Insert | Modified
    public string   ColumnName    { get; set; } = string.Empty;
    public string   OriginalValue { get; set; } = string.Empty;
    public string   NewValue      { get; set; } = string.Empty;
    public string   ChangedBy     { get; set; } = string.Empty;
    public DateTime ChangedDate   { get; set; }
}
