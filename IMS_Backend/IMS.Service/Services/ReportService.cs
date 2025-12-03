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
}