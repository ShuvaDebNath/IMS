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

    public async Task<DataSet> SampleRequestReport(string Id)
    {
        try
        {
            ReportsParams param = new ReportsParams
            {
                Id = Id,

            };
            return await _reportRepository.SampleRequestReport(param);
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
}