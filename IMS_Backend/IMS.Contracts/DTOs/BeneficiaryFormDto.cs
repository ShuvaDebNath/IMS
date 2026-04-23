namespace IMS.Contracts.DTOs;

/// <summary>
/// Response DTO returned by GET Beneficiary/GetById.
/// <c>LogoImageBase64</c> is null when no logo is stored; otherwise it is a
/// data-URI string (<c>data:image/...;base64,...</c>) ready for use in &lt;img src=""&gt;.
/// </summary>
public class BeneficiaryDetailDto
{
    public int      Beneficiary_Account_ID { get; set; }
    public string   CompanyName            { get; set; } = string.Empty;
    public int  BinNo                  { get; set; }
    public string?  Address                { get; set; }
    public string?  City                   { get; set; }
    public int      Country_ID             { get; set; }
    public string?  ETIN                   { get; set; }
    public string?  VATRegNo               { get; set; }
    public bool     IsAvailable            { get; set; }
    public int      PaymentTypeId          { get; set; }
    public string?  LogoImageBase64        { get; set; }  // null = no logo stored
}

/// <summary>
/// Flat DTO used by the dedicated Beneficiary endpoint.
/// <c>LogoImage</c> is the raw bytes converted from <c>IFormFile</c> in the controller.
/// All existing MasterEntry endpoints remain completely untouched.
/// </summary>
public class BeneficiaryFormDto
{
    public int?     Beneficiary_Account_ID { get; set; }   // null on create
    public string   CompanyName            { get; set; } = string.Empty;
    public string?  BinNo                  { get; set; }
    public string?  Address                { get; set; }
    public string?  City                   { get; set; }
    public int      Country_ID             { get; set; }
    public string?  ETIN                   { get; set; }
    public string?  VATRegNo               { get; set; }
    public int      IsAvailable            { get; set; }
    public int      PaymentTypeId          { get; set; }
    public string?  Sent_By                { get; set; }
    public string?  Received_By            { get; set; }
    public string?  Received_Date          { get; set; }
    public byte[]?  LogoImage              { get; set; }   // converted from IFormFile
}
