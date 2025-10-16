using Boilerplate.API.Controllers;
using Boilerplate.Contracts;
using Boilerplate.Contracts.Services;
using Boilerplate.Service.Services;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace IMS.API.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : BaseApiController
    {
        public readonly IReportService _reportService;
        private readonly ILogger<ReportController> _logger;
        string userName = null;
        public ReportController(ILogger<ReportController> logger, IReportService reportService)
        {
            _logger = logger;
            _reportService = reportService;
        }

        [HttpGet]
        [Route("RequisitionIndividualReport")]
        public async Task<IActionResult> SampleRequestReport(String rptType, string Id)
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "SampleRequestReport\\";
                DataSet ds = await _reportService.SampleRequestReport(Id);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {
                    
                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "DataSet1";

                var reportName = "Sample Request Report";

                reportPath += "RequisitionIndividual.rdlc";


                var returnString = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnString, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnString, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {               
                throw;
            }
        }
    }

}
