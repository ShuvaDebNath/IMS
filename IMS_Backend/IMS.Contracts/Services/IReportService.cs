

using AccountingBackEnd.DAL.DTOs;
using Boilerplate.Contracts.Responses;
using IMS.Contracts.DTOs;
using System.Collections.Generic;
using System.Data;

namespace Boilerplate.Contracts.Services;

public interface IReportService
{
    public Task<DataSet> SampleRequestReport(string fromDate, string toDate, string requestStatus,string UserID);
    public Task<DataSet> TaskDetailsReport(string fromDate, string toDate, string userId);
    public Task<DataSet> CustomerReport(string Superior_Id, string Customer_Id, string Status, string SentBy);
    public Task<DataSet> ProformaInvoiceReport(int PI_Master_ID);
    public Task<DataSet> CommercialInvoiceReports(string commercialInvoiceNo, string reportType);
    public Task<DataSet> DeliveryChallanReport(string challanNo);
    public Task<DataSet> ApplicationReport(string fromDate, string toDate, string applicationType);
    public Task<DataSet> LCReport(string fromDate, string toDate, string LCNo);
    public Task<DataSet> CashReceiveReport(string fromDate, string toDate);
    public Task<DataSet> PIAmendmentReport(string id);
    public Task<DataSet> PIOtherReport(string id);
    public Task<DataSet> SalesContractReport(string id);
    public Task<DataSet> BuyerReport(string fromDate, string toDate, string Superior_Id, string Customer_Id, string Status, string SentBy);
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
    public Task<DataSet> DeliveryLogReport(string fromDate, string toDate, string PI_Master_Id, string User_Id, string Client_Id);

    /// <summary>
    /// Generic: resolves <paramref name="reportKey"/> from the internal report registry,
    /// executes the mapped stored procedure with the supplied <paramref name="parameters"/>,
    /// and returns the DataSet together with all RDLC metadata needed by the controller.
    /// </summary>
    Task<GenericReportResult> RunGenericReportAsync(string reportKey, Dictionary<string, string> parameters);
}
