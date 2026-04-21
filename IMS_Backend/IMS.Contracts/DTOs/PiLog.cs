namespace IMS.Contracts.DTOs;

public class PiLog
{
    public long     LogId           { get; set; }
    public long     PI_Id           { get; set; }
    public string   ActionType      { get; set; } = string.Empty;  // CREATE | UPDATE
    public string   MasterDataJson  { get; set; } = string.Empty;
    public string   DetailsDataJson { get; set; } = "[]";
    public long     ChangedBy       { get; set; }
    public string?  ChangedByName   { get; set; }                  // human-readable user name
    public DateTime ChangedAt       { get; set; }
    public string?  IPAddress       { get; set; }
    public string?  UserAgent       { get; set; }
}
