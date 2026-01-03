using AccountingBackEnd.DAL.DTOs;
using IMS.Contracts.DTOs;
using System.Data;

namespace Boilerplate.Contracts.Repositories;
public interface IReportRepository
{
    Task<DataSet> SampleRequestReport(ReportsParams param);
    Task<DataSet> CustomerReport(CustomerParams param);
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
    Task<DataSet> BuyerReport(BuyerParams param);
    Task<DataSet> TaskReport(string id);
    Task<DataSet> ExportReport(string id);
    Task<DataSet> RawMaterialIssueInvoiceReport(string id);
    Task<DataSet> RMStockReport();
    Task<DataSet> FinishGoodSentReport(string id);
    Task<DataSet> FGStockReport();
    Task<DataSet> FGSendAndReceiveReport(FGSentReceiveParams param);
    Task<DataSet> RMPendingDetailsReport(string id);
    Task<DataSet> TaskMonthlyReport(string fromDate, string toDate);
    Task<DataSet> TaskMonthlyDetailsReport(string id);
}
