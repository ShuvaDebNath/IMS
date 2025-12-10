using Boilerplate.API.Controllers;
using Boilerplate.Contracts;
using Boilerplate.Contracts.Services;
using Boilerplate.Service.Services;
using Microsoft.AspNetCore.Mvc;
using QRCoder;
using System.Data;
using System.Drawing;
using System.Drawing.Imaging;

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
        public async Task<IActionResult> ProformaInvoiceReport(String rptType, int PI_Master_ID, bool IsMPI)
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

                if (IsMPI == true)
                    reportPath += "CashPI.rdlc";
                else
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

        [HttpGet]
        [Route("CommercialInvoiceReports")]
        public async Task<IActionResult> CommercialInvoiceReports(String rptType, string commercialInvoiceNo, string reportType)
        {
            try
            {
                var currentUser = HttpContext.User;
                var reportName = "";

                string reportPath = "V2\\";
                DataSet ds = await _reportService.CommercialInvoiceReports(commercialInvoiceNo, reportType);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                if (reportType == "CI")
                {
                    ds.Tables[0].TableName = "dtCommercialInvoice";

                    reportName = "Commercial Invoice Report";

                    reportPath += "CommercialInvoice.rdlc";
                }
                else if (reportType == "PL")
                {
                    ds.Tables[0].TableName = "dtCommercialInvoice";

                    reportName = "Packing List Report";

                    reportPath += "PackingList.rdlc";
                } 
                else if (reportType == "DC")
                {
                    ds.Tables[0].TableName = "dtCommercialInvoice";

                    reportName = "Delivery Challan Report";

                    reportPath += "DeliveryChallan.rdlc";
                }
                else if (reportType == "BOE")
                {
                    ds.Tables[0].TableName = "dtCommercialInvoice";

                    reportName = "Bill of Exchange Report";

                    reportPath += "BillOfExchange.rdlc";
                }
                else if (reportType == "IC")
                {
                    ds.Tables[0].TableName = "dtCommercialInvoice";

                    reportName = "Inspection Certificate Report";

                    reportPath += "InspectionCertificate.rdlc";
                }
                else if (reportType == "Origin")
                {
                    ds.Tables[0].TableName = "dtCommercialInvoice";

                    reportName = "Country of Origin Report";

                    reportPath += "CertificateOfOrigin.rdlc";
                }
                else if (reportType == "Beneficiary")
                {
                    ds.Tables[0].TableName = "dtCommercialInvoice";

                    reportName = "Baneficiary Certificate Report";

                    reportPath += "BeneficiaryCertificate.rdlc";
                }                   

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
        [Route("DeliveryChallanReport")]
        public async Task<IActionResult> DeliveryChallanReport(String rptType, string challanNo)
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\";
                DataSet ds = await _reportService.DeliveryChallanReport(challanNo);

                if (ds == null || ds.Tables.Count == 0 || ds.Tables[0].Rows.Count == 0)
                    return Ok(new { msg = "Data Not Found" });

                ds.Tables[0].TableName = "DCInfos";

                // Ensure column exists and is byte[]
                if (!ds.Tables[0].Columns.Contains("QRCode"))
                    ds.Tables[0].Columns.Add("QRCode", typeof(byte[]));

                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    string qrText = row["QRCodeText"]?.ToString()?.Trim() ?? "";
                    row["QRCode"] = GenerateQrCode(qrText);
                }

                reportPath += "Chalan.rdlc";
                string reportName = "DeliveryChallan";

                var renderedReport = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);

                if (rptType.ToLower() == "pdf")
                {
                    return File(renderedReport, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(renderedReport, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        private byte[] GenerateQrCode(string qrText)
        {
            if (string.IsNullOrWhiteSpace(qrText))
                return Array.Empty<byte>(); // Prevent null issues

            using var qrGenerator = new QRCodeGenerator();
            using var qrData = qrGenerator.CreateQrCode(qrText, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new QRCode(qrData);
            using var bitmap = qrCode.GetGraphic(20);
            using var stream = new MemoryStream();
            bitmap.Save(stream, System.Drawing.Imaging.ImageFormat.Png);
            return stream.ToArray();
        }



    }

}
