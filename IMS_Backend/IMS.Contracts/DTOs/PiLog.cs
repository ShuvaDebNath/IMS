namespace IMS.Contracts.DTOs;

public class PiLog
{
    public long     LogId        { get; set; }
    public long     PI_Id        { get; set; }
    public string   ActionType   { get; set; } = string.Empty;   // CREATE | UPDATE
    public string   DataSnapshot { get; set; } = string.Empty;   // Full JSON snapshot
    public long     ChangedBy    { get; set; }
    public DateTime ChangedAt    { get; set; }
    public string?  IPAddress    { get; set; }
    public string?  UserAgent    { get; set; }
}
