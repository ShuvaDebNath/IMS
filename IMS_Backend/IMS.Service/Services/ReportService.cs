using AccountingBackEnd.DAL.DTOs;
using Boilerplate.Contracts;
using Boilerplate.Contracts.Repositories;
using Boilerplate.Contracts.Responses;
using Boilerplate.Contracts.Services;
using Boilerplate.Repository.Repositories;
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
}