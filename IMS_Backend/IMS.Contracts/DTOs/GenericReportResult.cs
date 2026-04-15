using System.Data;

namespace IMS.Contracts.DTOs;

/// <summary>
/// Carries the rendered DataSet and all RDLC metadata back from
/// <see cref="Boilerplate.Contracts.Services.IReportService.RunGenericReportAsync"/>.
/// The controller uses this to render the RDLC file and stream the result.
/// </summary>
public class GenericReportResult
{
    public DataSet Data       { get; set; } = new();
    public string  RdlcPath   { get; set; } = string.Empty;
    public string  TableName  { get; set; } = string.Empty;
    public string  ReportName { get; set; } = string.Empty;
}
