

using Boilerplate.Contracts.Responses;
using System.Data;

namespace Boilerplate.Contracts.Services;

public interface IReportService
{
    public Task<DataSet> SampleRequestReport(string fromDate, string toDate, string requestStatus,string UserID);
    public Task<DataSet> TaskDetailsReport(string fromDate, string toDate);
    public Task<DataSet> ProformaInvoiceReport(int PI_Master_ID);
    public Task<DataSet> CommercialInvoiceReports(string commercialInvoiceNo, string reportType);
    public Task<DataSet> DeliveryChallanReport(string challanNo);
    public Task<DataSet> ApplicationReport(string fromDate, string toDate, string applicationType);
    public Task<DataSet> LCReport(string fromDate, string toDate, string LCNo);
    public Task<DataSet> CashReceiveReport(string fromDate, string toDate);
    public Task<DataSet> PIAmendmentReport(string id);
    public Task<DataSet> PIOtherReport(string id);
}
