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
        string userName = null;
        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet]
        [Route("SampleRequestReport")]
        public async Task<IActionResult> SampleRequestReport(String rptType, string fromDate = "", string toDate = "", string requestStatus="" ,string UserID="")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "SampleRequestReport\\";
                DataSet ds = await _reportService.SampleRequestReport(fromDate, toDate, requestStatus, UserID);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {
                    
                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "SampleRequestReport";

                var reportName = "Sample Request Report";

                reportPath += "rptSampleRequestReport.rdlc";


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

        [HttpGet]
        [Route("ProformaInvoiceReport")]
        public async Task<IActionResult> ProformaInvoiceReport(String rptType, int PI_Master_ID)
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\";
                DataSet ds = await _reportService.ProformaInvoiceReport(PI_Master_ID);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "PIInfos";

                var reportName = "Proforma Invoice Report";

                reportPath += "PI.rdlc";


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
