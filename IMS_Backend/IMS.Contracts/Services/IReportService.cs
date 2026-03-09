

using AccountingBackEnd.DAL.DTOs;
using Boilerplate.Contracts.Responses;
using System.Data;

namespace Boilerplate.Contracts.Services;

public interface IReportService
{
    public Task<DataSet> SampleRequestReport(string fromDate, string toDate, string requestStatus,string UserID);
    public Task<DataSet> TaskDetailsReport(string fromDate, string toDate, string userId);
    public Task<DataSet> CustomerReport(CustomerReportParams customerReportParams);
    public Task<DataSet> BuyerReport(BuyerReportParams buyerReportParams);
    public Task<DataSet> ProformaInvoiceReport(int PI_Master_ID);
    public Task<DataSet> CommercialInvoiceReports(string commercialInvoiceNo, string reportType);
    public Task<DataSet> DeliveryChallanReport(string challanNo);
    public Task<DataSet> ApplicationReport(string fromDate, string toDate, string applicationType);
    public Task<DataSet> LCReport(string fromDate, string toDate, string LCNo);
    public Task<DataSet> CashReceiveReport(string fromDate, string toDate);
    public Task<DataSet> PIAmendmentReport(string id);
    public Task<DataSet> PIOtherReport(string id);
    public Task<DataSet> SalesContractReport(string id);
    public Task<DataSet> TaskReport(string id);
    public Task<DataSet> ExportReport(string id);
    public Task<DataSet> RawMaterialIssueInvoiceReport(string id);
    public Task<DataSet> RMStockReport();
    public Task<DataSet> FinishGoodSentReport(string id);
    public Task<DataSet> FGStockReport();
    public Task<DataSet> FGSendAndReceiveReport(string InvoiceNo,string fromDate, string toDate);
    public Task<DataSet> RMPendingDetailsReport(string id);
    public Task<DataSet> TaskMonthlyDetailsReport(string id);
    public Task<DataSet> TaskMonthlyReport(string fromDate, string toDate,string userId);
    public Task<DataSet> TaskCustomerVisitDetailsReport(string id);
    public Task<DataSet> TaskCustomerVisitReport(string fromDate, string toDate, string userId);
    public Task<DataSet> DeliveryReport(int PI_Master_ID);
    public Task<DataSet> UserReport(int RoleId, int pageLength, int pageNo, string searchParam);
    public Task<DataSet> PIReport(PIReportParams pIReportParams);
}
