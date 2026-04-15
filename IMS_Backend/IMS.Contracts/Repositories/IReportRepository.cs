using AccountingBackEnd.DAL.DTOs;
using IMS.Contracts.DTOs;
using System.Collections.Generic;
using System.Data;

namespace Boilerplate.Contracts.Repositories;
public interface IReportRepository
{
    Task<DataSet> SampleRequestReport(ReportsParams param);
    Task<DataSet> CustomerReport(CustomerReportParams customerReportParams);
    Task<DataSet> BuyerReport(BuyerReportParams buyerReportParams);
    Task<DataSet> ProformaInvoiceReport(ProformaInvoiceReportParams param);
    Task<DataSet> TaskDetailsReport(ReportsParams param);
    Task<DataSet> CommercialInvoiceReports(CommercialInvoiceReportParams param);
    Task<DataSet> DeliveryChallanReport(DeliveryChallanReportParams param);
    Task<DataSet> ApplicationReport(ApplicaitonParams param);
    Task<DataSet> LCReport(LCParams param);
    Task<DataSet> CashReceiveReport(LCParams param);
    Task<DataSet> PIAmendmentReport(string id);
    Task<DataSet> PIOtherReport(string id);
    Task<DataSet> SalesContractReport(string id);
    Task<DataSet> TaskReport(string id);
    Task<DataSet> ExportReport(string id);
    Task<DataSet> RawMaterialIssueInvoiceReport(string id);
    Task<DataSet> RMStockReport();
    Task<DataSet> FinishGoodSentReport(string id);
    Task<DataSet> FGStockReport();
    Task<DataSet> FGSendAndReceiveReport(FGSentReceiveParams param);
    Task<DataSet> RMPendingDetailsReport(string id);
    Task<DataSet> TaskMonthlyReport(string fromDate, string toDate, string userId);
    Task<DataSet> TaskMonthlyDetailsReport(string id);
    Task<DataSet> TaskCustomerVisitReport(string fromDate, string toDate,string userId);
    Task<DataSet> TaskCustomerVisitDetailsReport(string id);
    Task<DataSet> DeliveryReport(ProformaInvoiceReportParams param);
    Task<DataSet> UserReport(int RoleId, int pageLength, int pageNo, string searchParam);
    Task<DataSet> PIReport(PIReportParams param);
    Task<DataSet> DeliveryLogReport(DeliveryLogReportParams param);

    /// <summary>
    /// Looks up a single active row from the <c>ReportConfigs</c> table by its
    /// <paramref name="reportKey"/>. Returns <c>null</c> if no active config is found.
    /// </summary>
    Task<ReportConfig?> GetReportConfigAsync(string reportKey);

    /// <summary>
    /// Generic: executes any report stored procedure with a dynamic parameter bag.
    /// The key in <paramref name="parameters"/> must match the SP parameter name
    /// (without the leading @).
    /// </summary>
    Task<DataSet> ExecuteSpReportAsync(string spName, Dictionary<string, string> parameters);
}
