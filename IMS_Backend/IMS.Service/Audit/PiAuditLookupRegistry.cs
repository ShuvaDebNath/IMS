namespace Boilerplate.Service.Audit;

/// <summary>
/// Central registry of FK → lookup-table mappings for PI audit display.
/// Table indices match <c>DataSet.Tables[n]</c> (frontend Tables{n+1}).
/// </summary>
public static class PiAuditLookupRegistry
{
    public static IReadOnlyList<PiAuditLookupMapping> Mappings { get; } =
        new List<PiAuditLookupMapping>
        {
            new() { AuditColumn = "Beneficiary_Account_ID", IdColumn = "Beneficiary_Account_ID", DisplayColumn = "CompanyName",       TableIndices = [0, 30], DisplayName = "Shipper" },
            new() { AuditColumn = "Beneficiary_Bank_ID",    IdColumn = "Beneficiary_Bank_ID",    DisplayColumn = "BankInfo",          TableIndices = [1],     DisplayName = "Beneficiary Bank" },
            new() { AuditColumn = "Country_Of_Origin_ID",   IdColumn = "Country_ID",             DisplayColumn = "Country",           TableIndices = [2],     DisplayName = "Country Of Origin" },
            new() { AuditColumn = "Country_Of_Orgin_ID",   IdColumn = "Country_ID",             DisplayColumn = "Country",           TableIndices = [2],     DisplayName = "Country Of Origin" },
            new() { AuditColumn = "Packing_ID",             IdColumn = "Packing_ID",             DisplayColumn = "Mode",              TableIndices = [3],     DisplayName = "Packing" },
            new() { AuditColumn = "Loading_Mode_ID",        IdColumn = "Loading_Mode_ID",        DisplayColumn = "Details",           TableIndices = [4],     DisplayName = "Loading Mode" },
            new() { AuditColumn = "Payment_Term_ID",        IdColumn = "Payment_Term_ID",        DisplayColumn = "Mode",              TableIndices = [5],     DisplayName = "Payment Term" },
            new() { AuditColumn = "Customer_ID",            IdColumn = "Customer_ID",            DisplayColumn = "CustomerName",      TableIndices = [6],     DisplayName = "Customer" },
            new() { AuditColumn = "Customer_Bank_ID",       IdColumn = "Applicant_Bank_ID",      DisplayColumn = "CustomerBankDetails", TableIndices = [7],   DisplayName = "Applicant Bank" },
            new() { AuditColumn = "Buyer_ID",               IdColumn = "Id",                     DisplayColumn = "Buyer_Name",        TableIndices = [8],     DisplayName = "Buyer" },
            new() { AuditColumn = "Terms_of_Delivery_ID",   IdColumn = "Id",                     DisplayColumn = "Details",           TableIndices = [9],     DisplayName = "Terms Of Delivery" },
            new() { AuditColumn = "Width_ID",               IdColumn = "Width_ID",               DisplayColumn = "Measurement",       TableIndices = [11],    DisplayName = "Width" },
            new() { AuditColumn = "Color_ID",               IdColumn = "Color_ID",               DisplayColumn = "Color",             TableIndices = [12],    DisplayName = "Color" },
            new() { AuditColumn = "Packaging_ID",           IdColumn = "Packaging_ID",           DisplayColumn = "Packaging",         TableIndices = [13],    DisplayName = "Packaging" },
            new() { AuditColumn = "Unit_ID",                IdColumn = "Unit_ID",                DisplayColumn = "Unit",              TableIndices = [14],    DisplayName = "Unit" },
            new() { AuditColumn = "Delivery_Condition_ID",  IdColumn = "Delivery_Condition_ID",  DisplayColumn = "Details",           TableIndices = [16],    DisplayName = "Delivery Condition" },
            new() { AuditColumn = "Shipment_Condition_ID",  IdColumn = "Shipment_Condition_ID",  DisplayColumn = "ShipmentConditions", TableIndices = [17],   DisplayName = "Partial Shipment" },
            new() { AuditColumn = "Price_Term_ID",          IdColumn = "Price_Term_ID",          DisplayColumn = "PriceTerm",         TableIndices = [18],    DisplayName = "Price Term" },
            new() { AuditColumn = "Force_Majeure_ID",       IdColumn = "Force_Majeure_ID",       DisplayColumn = "Force",             TableIndices = [19],    DisplayName = "Force Majeure" },
            new() { AuditColumn = "Arbitration_ID",         IdColumn = "Arbitration_ID",         DisplayColumn = "Detail",            TableIndices = [20],    DisplayName = "Arbitration" },
            new() { AuditColumn = "Currency_ID",            IdColumn = "Currency_ID",            DisplayColumn = "CurrencyCode",      TableIndices = [21],    DisplayName = "Currency" },
            new() { AuditColumn = "Item_ID",                IdColumn = "Item_ID",                DisplayColumn = "Article_No",        TableIndices = [27],    DisplayName = "A. A." },
        };
}
