
namespace IMS.Contracts.DTOs;

public class DeliveryLogReportParams
{
    public string FromDate { get; set; }
    public string ToDate { get; set; }
    public string PIMasterId { get; set; }
    public string UserId { get; set; }
    public string ClientId { get; set; }
}
