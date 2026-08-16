namespace Boilerplate.Service.Audit;

/// <summary>
/// FK and display-name mappings for LC audit log fields.
/// Reuses PI lookup tables from <c>usp_ProformaInvoice_GetInitialData</c>.
/// Register new LC FK fields here only.
/// </summary>
public static class LcAuditLookupRegistry
{
    public static IReadOnlyList<PiAuditLookupMapping> Mappings { get; } =
        BuildMappings();

    private static List<PiAuditLookupMapping> BuildMappings()
    {
        var mappings = new List<PiAuditLookupMapping>();
        mappings.AddRange(PiAuditLookupRegistry.Mappings);

        mappings.AddRange(new[]
        {
            new PiAuditLookupMapping
            {
                AuditColumn   = "Superior_ID",
                IdColumn      = "User_ID",
                DisplayColumn = "UserName",
                TableIndices  = [31],
                DisplayName   = "Marketing Concern"
            },
            new PiAuditLookupMapping
            {
                AuditColumn   = "Marketing_Concern_ID",
                IdColumn      = "User_ID",
                DisplayColumn = "UserName",
                TableIndices  = [31],
                DisplayName   = "Marketing Concern"
            },
            new PiAuditLookupMapping 
            { 
                AuditColumn = "Beneficiary_Account_ID",
                IdColumn = "Beneficiary_Account_ID",
                DisplayColumn = "CompanyName",
                TableIndices = [0, 30],
                DisplayName = "Shipper" 
            },
            new PiAuditLookupMapping 
            { 
                AuditColumn = "Beneficiary_Bank_ID",
                IdColumn = "Beneficiary_Bank_ID",
                DisplayColumn = "BankInfo",
                TableIndices = [1],
                DisplayName = "Beneficiary Bank"
            },
        });

        return mappings;
    }

    /// <summary>
    /// Mappings for <c>usp_LC_GetInitialData</c> (Tables1–4 on the Generate LC page).
    /// </summary>
    public static IReadOnlyList<PiAuditLookupMapping> LcInitialDataMappings { get; } =
        new List<PiAuditLookupMapping>
        {
            new()
            {
                AuditColumn   = "Beneficiary_Bank_ID",
                IdColumn      = "Beneficiary_Bank_ID",
                DisplayColumn = "BankName",
                TableIndices  = [0],
                DisplayName   = "Beneficiary Bank"
            },
            new()
            {
                AuditColumn   = "Payment_Term_ID",
                IdColumn      = "Payment_Term_ID",
                DisplayColumn = "Mode",
                TableIndices  = [1],
                DisplayName   = "Payment Terms"
            },
            new()
            {
                AuditColumn   = "Superior_ID",
                IdColumn      = "User_ID",
                DisplayColumn = "UserName",
                TableIndices  = [2],
                DisplayName   = "Marketing Concern"
            },
            new()
            {
                AuditColumn   = "Marketing_Concern_ID",
                IdColumn      = "User_ID",
                DisplayColumn = "UserName",
                TableIndices  = [2],
                DisplayName   = "Marketing Concern"
            },
            new()
            {
                AuditColumn   = "Beneficiary_Account_ID",
                IdColumn      = "Beneficiary_Account_ID",
                DisplayColumn = "CompanyName",
                TableIndices  = [3],
                DisplayName   = "Beneficiary Account"
            },
        };

    /// <summary>Custom column headings for LC fields.</summary>
    public static IReadOnlyDictionary<string, string> DisplayNames { get; } =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["Superior_ID"]                   = "Marketing Concern",
            ["Beneficiary_Account_ID"]        = "Beneficiary Account",
            ["Beneficiary_Bank_ID"]           = "Beneficiary Bank",
            ["Consignee_Name"]                = "Consignee Name",
            ["LC_Receiving_Date_By_Mail"]     = "LC Receiving Date By Mail",
            ["LC_Receiving_Date_By_Bank"]     = "LC Receiving Date By Bank",
            ["LC_No"]                         = "LC Number",
            ["LC_Value"]                      = "LC Value",
            ["Issue_Date"]                    = "Issue Date",
            ["Expiry_Date"]                   = "Expiry Date",
            ["Customer_Bank"]                 = "Customer Bank",
            ["Invoice_No"]                    = "Invoice No",
            ["Payment_Term_ID"]               = "Payment Terms",
            ["IP_Document_Sending_Date"]      = "IP Documents Sending Date",
            ["IP_Document_Receiving_Date"]    = "IP Documents Receiving Date",
            ["Presentation_To_Bank_Date"]     = "Documents Presentation To Bank Date",
            ["Maturity_Date"]                 = "Maturity Date",
            ["Export_LC_SC"]                  = "Export LC/SC",
            ["Actual_Payment_Receiving_Date"] = "Payment Receiving Date",
            ["FddTtReceiveDate"]              = "FDD/TT Receive Date",
            ["Export_LC_SC_Date"]             = "Export LC/SC Date",
            ["LCA_Form_No"]                   = "LCA Form No",
            ["Applicant_TIN"]                 = "Applicant TIN",
            ["Applicant_BIN_VAT"]             = "Applicant BIN/VAT",
            ["HS_Code"]                       = "HS Code",
            ["Bank_BIN_No"]                   = "Bank BIN No",
            ["Bank_TIN_No"]                   = "Bank TIN No",
            ["Remarks"]                       = "Remarks",
            ["IRC_No"]                        = "IRC No",
            ["PI_No"]                         = "PI List",
            ["Sailing_On_Or_About"]           = "Sailing On Or About",
            ["System_Created_Date"]           = "System Created Date",
            ["User_ID"]                       = "Changed By User",
        };
}
