namespace Boilerplate.Contracts.DTOs;


public class PI_Ledger
{
    public int? PI_Ledger_ID { get; set; }
    public int? PI_Detail_ID { get; set; }
    public DateTime? Date { get; set; }
    public decimal? Ordered { get; set; }
    public decimal? Delivered { get; set; }
    public decimal? Roll { get; set; }
    public string? Remark { get; set; }
    public int? Chalan_No { get; set; }
    public int? User_ID { get; set; }
    public int? Item_ID { get; set; }
    public int? Stock_Location_ID { get; set; }
}
