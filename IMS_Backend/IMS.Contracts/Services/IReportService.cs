

using Boilerplate.Contracts.Responses;
using System.Data;

namespace Boilerplate.Contracts.Services;

public interface IReportService
{
    public Task<DataSet> SampleRequestReport(string fromDate, string toDate, string requestStatus,string UserID);
    public Task<DataSet> ProformaInvoiceReport(int PI_Master_ID);
}
