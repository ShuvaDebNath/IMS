namespace IMS.Contracts.DTOs;

public class LcLog
{
    public long     LogId       { get; set; }
    public long     LC_ID       { get; set; }
    public string   ActionType  { get; set; } = string.Empty;  // CREATE | UPDATE
    public string?  OldDataJson { get; set; }
    public string   NewDataJson { get; set; } = string.Empty;
    public long     ChangedBy   { get; set; }
    public string?  ChangedByName { get; set; }
    public DateTime ChangedAt   { get; set; }
    public string?  IPAddress   { get; set; }
    public string?  UserAgent   { get; set; }
}
