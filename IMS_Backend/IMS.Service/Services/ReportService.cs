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
using System.Collections.Generic;
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

    public async Task<DataSet> CustomerReport(CustomerReportParams customerReportParams)
    {
        try
        {
            return await _reportRepository.CustomerReport(customerReportParams);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public async Task<DataSet> BuyerReport(BuyerReportParams buyerReportParams)
    {
        try
        {
            return await _reportRepository.BuyerReport(buyerReportParams);
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


    public async Task<DataSet> TaskDetailsReport(string fromDate, string toDate, string userId)
    {
        try
        {
            ReportsParams param = new ReportsParams
            {
                fromDate = fromDate,
                toDate = toDate,
                userId = userId

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

    public async Task<DataSet> TaskMonthlyReport(string fromDate, string toDate, string userId)
    {
        try
        {

            return await _reportRepository.TaskMonthlyReport(fromDate, toDate,userId);
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

    public async Task<DataSet> TaskCustomerVisitReport(string fromDate, string toDate, string userId)
    {
        try
        {

            return await _reportRepository.TaskCustomerVisitReport(fromDate, toDate,userId);
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



    public async Task<DataSet> DeliveryReport(int PI_Master_ID)
    {
        try
        {
            ProformaInvoiceReportParams param = new ProformaInvoiceReportParams
            {
                PI_Master_ID = PI_Master_ID

            };

            return await _reportRepository.DeliveryReport(param);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
    public async Task<DataSet> UserReport(int RoleId, int pageLength, int pageNo, string searchParam)
    {
        try
        {

            return await _reportRepository.UserReport(RoleId, pageLength, pageNo, searchParam);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
    public async Task<DataSet> PIReport(PIReportParams pIReportParams)
    {
        try
        {

            return await _reportRepository.PIReport(pIReportParams);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public async Task<DataSet> DeliveryLogReport(string fromDate, string toDate, string PI_Master_Id, string User_Id, string Client_Id)
    {
        try
        {
            DeliveryLogReportParams param = new DeliveryLogReportParams
            {
                FromDate = fromDate,
                ToDate = toDate,
                PIMasterId = PI_Master_Id,
                UserId = User_Id,
                ClientId = Client_Id

            };
            return await _reportRepository.DeliveryLogReport(param);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    // ── Generic Report Engine (Database-Driven) ───────────────────────────────

    /// <inheritdoc/>
    /// <remarks>
    /// Configuration is loaded at runtime from the <c>ReportConfigs</c> table
    /// (columns: ReportKey, SpName, RdlcPath, TableName, ReportName, isActive).
    /// To add a new report, insert one active row into that table — no code change required.
    /// </remarks>
    public async Task<GenericReportResult> RunGenericReportAsync(
        string reportKey,
        Dictionary<string, string> parameters)
    {
        var config = await _reportRepository.GetReportConfigAsync(reportKey);

        // Normalise: replace any null values with empty string so the SP
        // receives "" instead of NULL — prevents "no result" from SP null checks.
        var safeParams = parameters.ToDictionary(
            kvp => kvp.Key,
            kvp => kvp.Value ?? string.Empty);

        if (config is null)
            throw new KeyNotFoundException(
                $"No active report configuration found for key '{reportKey}'. " +
                $"Insert an active row into the ReportConfigs table.");

       

        var ds = await _reportRepository.ExecuteSpReportAsync(config.SpName, safeParams);

        return new GenericReportResult
        {
            Data       = ds,
            RdlcPath   = config.RdlcPath,
            TableName  = config.TableName,
            ReportName = config.ReportName,
        };
    }
}