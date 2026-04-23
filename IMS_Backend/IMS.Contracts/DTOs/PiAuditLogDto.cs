namespace IMS.Contracts.DTOs;

public class PiAuditLogResponse
{
    public string               PiNo       { get; set; } = string.Empty;
    public string               ClientName { get; set; } = string.Empty;
    public List<PiAuditLogEntry> Logs       { get; set; } = new();
}

public class PiAuditLogEntry
{
    public string   EventType     { get; set; } = string.Empty;  // "Insert" | "Modified"
    public string   ColumnName    { get; set; } = string.Empty;
    public string   OriginalValue { get; set; } = string.Empty;
    public string   NewValue      { get; set; } = string.Empty;
    public string   ChangedBy     { get; set; } = string.Empty;
    public DateTime ChangedDate   { get; set; }
}
