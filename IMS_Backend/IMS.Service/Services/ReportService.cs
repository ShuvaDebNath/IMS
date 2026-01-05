using AccountingBackEnd.DAL.DTOs;
using Boilerplate.Contracts;
using Boilerplate.Contracts.Repositories;
using Boilerplate.Contracts.Responses;
using Boilerplate.Contracts.Services;
using Boilerplate.Repository.Repositories;
using IMS.Contracts.DTOs;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Data;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Boilerplate.Service.Services;

public class ReportService : IReportService
{
    readonly IReportRepository _reportRepository;
    private readonly ILogger<ReportService> _logger;
    public ReportService(IReportRepository reportRepository,
        ILogger<ReportService> logger)
    {
        _reportRepository = reportRepository;
        _logger = logger;
    }

    public async Task<DataSet> SampleRequestReport(string fromDate, string toDate, string requestStatus, string UserID)
    {
        try
        {
            ReportsParams param = new ReportsParams
            {
                fromDate = fromDate,
                toDate = toDate,
                requestStatus = requestStatus,
                Id = UserID,

            };
            return await _reportRepository.SampleRequestReport(param);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public async Task<DataSet> CustomerReport(string Superior_Id, string Customer_Id, string Status, string SentBy)
    {
        try
        {
            CustomerParams param = new CustomerParams
            {
                Superior_Id = Superior_Id,
                Customer_Id = Customer_Id,
                Status = Status,
                SentBy = SentBy,

            };
            return await _reportRepository.CustomerReport(param);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public async Task<DataSet> ProformaInvoiceReport(int PI_Master_ID)
    {
        try
        {
            ProformaInvoiceReportParams param = new ProformaInvoiceReportParams
            {
                PI_Master_ID = PI_Master_ID

            };

            return await _reportRepository.ProformaInvoiceReport(param);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }


    public async Task<DataSet> TaskDetailsReport(string fromDate, string toDate)
    {
        try
        {
            ReportsParams param = new ReportsParams
            {
                fromDate = fromDate,
                toDate = toDate

            };

            return await _reportRepository.TaskDetailsReport(param);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public async Task<DataSet> CommercialInvoiceReports(string commercialInvoiceNo, string reportType)
    {
        try
        {
            CommercialInvoiceReportParams param = new CommercialInvoiceReportParams
            {
                Commercial_Invoice_No = commercialInvoiceNo,
                ReportType = reportType

            };
            return await _reportRepository.CommercialInvoiceReports(param);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public async Task<DataSet> DeliveryChallanReport(string challanNo)
    {
        try
        {
            DeliveryChallanReportParams param = new DeliveryChallanReportParams
            {
                ChallanNo = challanNo

            };

            return await _reportRepository.DeliveryChallanReport(param);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public async Task<DataSet> ApplicationReport(string fromDate, string toDate, string applicaitonType)
    {
        try
        {
            ApplicaitonParams param = new ApplicaitonParams
            {
                fromDate = fromDate,
                toDate = toDate,
                applicationType = applicaitonType,

            };
            return await _reportRepository.ApplicationReport(param);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public async Task<DataSet> LCReport(string fromDate, string toDate, string LCNo)
    {
        try
        {
            LCParams param = new LCParams
            {
                fromDate = fromDate,
                toDate = toDate,
                LCNo = LCNo,

            };
            return await _reportRepository.LCReport(param);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
    public async Task<DataSet> CashReceiveReport(string fromDate, string toDate)
    {
        try
        {
            LCParams param = new LCParams
            {
                fromDate = fromDate,
                toDate = toDate,

            };
            return await _reportRepository.CashReceiveReport(param);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public async Task<DataSet> PIAmendmentReport(string id)
    {
        try
        {
            
            return await _reportRepository.PIAmendmentReport(id);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
    public async Task<DataSet> PIOtherReport(string id)
    {
        try
        {

            return await _reportRepository.PIOtherReport(id);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
    public async Task<DataSet> SalesContractReport(string id)
    {
        try
        {

            return await _reportRepository.SalesContractReport(id);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
     public async Task<DataSet> BuyerReport(string fromDate, string toDate, string Superior_Id, string Customer_Id, string Status, string SentBy)
    {
        try
        {
            BuyerParams param = new BuyerParams
            {
                FromDate = fromDate,
                ToDate = toDate,
                Superior_Id = Superior_Id,
                Customer_Id = Customer_Id,
                Status = Status,
                SentBy = SentBy,

            };
            return await _reportRepository.BuyerReport(param);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
    public async Task<DataSet> TaskReport(string id)
    {
        try
        {

            return await _reportRepository.TaskReport(id);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
    public async Task<DataSet> ExportReport(string id)
    {
        try
        {

            return await _reportRepository.ExportReport(id);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
    public async Task<DataSet> RawMaterialIssueInvoiceReport(string id)
    {
        try
        {

            return await _reportRepository.RawMaterialIssueInvoiceReport(id);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
    public async Task<DataSet> RMStockReport()
    {
        try
        {

            return await _reportRepository.RMStockReport();
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
    public async Task<DataSet> FinishGoodSentReport(string id)
    {
        try
        {

            return await _reportRepository.FinishGoodSentReport(id);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
    public async Task<DataSet> FGStockReport()
    {
        try
        {

            return await _reportRepository.FGStockReport();
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public async Task<DataSet> FGSendAndReceiveReport(string InvoiceNo, string fromDate, string toDate)
    {
        try
        {
            FGSentReceiveParams param = new FGSentReceiveParams
            {
                InvoiceNo = InvoiceNo,
                fromDate = fromDate,
                toDate = toDate,

            };
            return await _reportRepository.FGSendAndReceiveReport(param);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
    public async Task<DataSet> RMPendingDetailsReport(string id)
    {
        try
        {

            return await _reportRepository.RMPendingDetailsReport(id);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public async Task<DataSet> TaskMonthlyReport(string fromDate, string toDate)
    {
        try
        {

            return await _reportRepository.TaskMonthlyReport(fromDate, toDate);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public async Task<DataSet> TaskMonthlyDetailsReport(string id)
    {
        try
        {

            return await _reportRepository.TaskMonthlyDetailsReport(id);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public async Task<DataSet> TaskCustomerVisitReport(string fromDate, string toDate)
    {
        try
        {

            return await _reportRepository.TaskCustomerVisitReport(fromDate, toDate);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public async Task<DataSet> TaskCustomerVisitDetailsReport(string id)
    {
        try
        {

            return await _reportRepository.TaskCustomerVisitDetailsReport(id);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
}