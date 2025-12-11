using Boilerplate.API.Controllers;
using Boilerplate.Contracts;
using Boilerplate.Contracts.Enum;
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

                string reportPath = "V2\\SampleRequestReport\\";
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
        [Route("TaskDetailsReport")]
        public async Task<IActionResult> TaskDetailsReport(String rptType, string fromDate = "", string toDate = "")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\TaskReport\\";
                DataSet ds = await _reportService.TaskDetailsReport(fromDate, toDate);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "TaskDetails";

                var reportName = "Task Details Report";

                reportPath += "rptTaskDetailsReport.rdlc";


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
        [Route("CustomerReport")]
        public async Task<IActionResult> CustomerReport(String rptType, string Superior_Id = "", string Customer_Id = "", string Status = "", string SentBy = "")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "CustomerReport\\";
                DataSet ds = await _reportService.CustomerReport(Superior_Id, Customer_Id, Status, SentBy);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "CustomerReport";

                var reportName = "Customer Report";

                reportPath += "rptCustomerReport.rdlc";


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

        [HttpGet]
        [Route("ApplicationReport")]
        public async Task<IActionResult> ApplicationReport(String rptType, string fromDate,string toDate,string appType="")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\ApplicationReport\\";
                DataSet ds = await _reportService.ApplicationReport(fromDate, toDate, appType);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "ApplicationReport";

                var reportName = "Application Report";

                reportPath += "rptApplicationReport.rdlc";


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
        [Route("LCReport")]
        public async Task<IActionResult> LCReport(String rptType, string fromDate, string toDate, string LCNo = "")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\LCReport\\";
                DataSet ds = await _reportService.LCReport(fromDate, toDate, LCNo);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "LCReport";

                var reportName = "LC Report";

                reportPath += "rptLCReport.rdlc";


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
        [Route("CashReceiveReport")]
        public async Task<IActionResult> CashReceiveReport(String rptType, string fromDate, string toDate)
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\CashReceiveReport\\";
                DataSet ds = await _reportService.CashReceiveReport(fromDate, toDate);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "CashReceiveReport";

                var reportName = "Cash Receive Report";

                reportPath += "rptCashReceiveReport.rdlc";


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
        [Route("PIAmendMentReport")]
        public async Task<IActionResult> PIAmendMentReport(String rptType, string id)
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\ApplicationReport\\";
                DataSet ds = await _reportService.PIAmendmentReport(id);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }


                var reportName = "PI Amendment Application Report";

                reportPath += "rptApplicationPIAmendmentReport.rdlc";


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
        [Route("PIOtherReport")]
        public async Task<IActionResult> PIOtherReport(String rptType, string id)
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\ApplicationReport\\";
                DataSet ds = await _reportService.PIOtherReport(id);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                var reportName = "PI Other Application Report";

                reportPath += "rptApplicationOtherReport.rdlc";


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
        [Route("SalesContractReport")]
        public async Task<IActionResult> SalesContractReport(String rptType, string id)
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\SalesContract\\";
                DataSet ds = await _reportService.SalesContractReport(id);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "SalesContract";

                var reportName = "Sales Contract Report";

                reportPath += "rptSalesContract.rdlc";


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
        [Route("BuyerReport")]
        public async Task<IActionResult> BuyerReport(String rptType, string fromDate = "", string toDate = "",string SuperioId = "", string BuyerId = "", string Status = "", string sentBy = "")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\BuyerReport\\";
                DataSet ds = await _reportService.BuyerReport(fromDate, toDate, SuperioId, BuyerId, Status, sentBy);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "BuyerReport";

                var reportName = "Buyer Report";

                reportPath += "rptBuyerReport.rdlc";


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
        [Route("TaskReport")]
        public async Task<IActionResult> TaskReport(String rptType, string id = "")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\TaskReport\\";
                DataSet ds = await _reportService.TaskReport(id);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "TaskReport";

                var reportName = "Task Report";

                reportPath += "rptTaskReport.rdlc";


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
        [Route("ExportReport")]
        public async Task<IActionResult> ExportReport(String rptType, string id = "")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\ExportReport\\";
                DataSet ds = await _reportService.ExportReport(id);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "ExportDetails";

                var reportName = "Export Report";

                reportPath += "rptExportDetailsReport.rdlc";


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
        [Route("ExportReceiveReport")]
        public async Task<IActionResult> ExportReceiveReport(String rptType, string id = "")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\ExportReport\\";
                DataSet ds = await _reportService.ExportReport(id);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "ExportDetails";

                var reportName = "Export Receive Report";

                reportPath += "rptExportReceiveReport.rdlc";


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
        [Route("RawMaterialIssueInvoiceReport")]
        public async Task<IActionResult> RawMaterialIssueInvoiceReport(String rptType, string id = "")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\RawMaterial\\";
                DataSet ds = await _reportService.RawMaterialIssueInvoiceReport(id);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "RawMaterialIssueInvoice";

                var reportName = "Raw Material Issue Invoice Report";

                reportPath += "rptRawMaterialIssueInvoiceReport.rdlc";


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
        [Route("RMStockReport")]
        public async Task<IActionResult> RMStockReport(String rptType)
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\RawMaterial\\";
                DataSet ds = await _reportService.RMStockReport();

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "RMStock";

                var reportName = "Raw Material Stock Report";

                reportPath += "rptRMStockReport.rdlc";


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
        [Route("FinishGoodSentReport")]
        public async Task<IActionResult> FinishGoodSentReport(String rptType, string id = "")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\FinishGood\\";
                DataSet ds = await _reportService.FinishGoodSentReport(id);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "FinishGoodSent";

                var reportName = "Finish Good Sent Report";

                reportPath += "rptFinishGoodSentReport.rdlc";


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
        [Route("FinishGoodReceiveReport")]
        public async Task<IActionResult> FinishGoodReceiveReport(String rptType, string id = "")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\FinishGood\\";
                DataSet ds = await _reportService.FinishGoodSentReport(id);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "FinishGoodSent";

                var reportName = "Finish Good Receive Report";

                reportPath += "rptFinishGoodReceiveReport.rdlc";


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
        [Route("FGStockReport")]
        public async Task<IActionResult> FGStockReport(String rptType)
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\FinishGood\\";
                DataSet ds = await _reportService.FGStockReport();

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "FGStock";

                var reportName = "Finish Good Stock Report";

                reportPath += "rptFinishGoodStockReport.rdlc";


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
        [Route("FGSendAndReceiveReport")]
        public async Task<IActionResult> FGSendAndReceiveReport(String rptType, string fromDate, string toDate,string InvoiceNo = "" )
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\FinishGood\\";
                DataSet ds = await _reportService.FGSendAndReceiveReport(InvoiceNo, fromDate, toDate);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "FinishGoodSent";

                var reportName = "Finish Good Send and Receive Report";

                reportPath += "rptFinishGoodReceiveAndSentReport.rdlc";


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
        [Route("RMPendingDetailsReport")]
        public async Task<IActionResult> RMPendingDetailsReport(String rptType, string id = "")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\RawMaterial\\";
                DataSet ds = await _reportService.RMPendingDetailsReport(id);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "RawMaterialPending";

                var reportName = "Raw Material Pending Details Report";

                reportPath += "rptRMReceivePendingDetailsReport.rdlc";


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
        [Route("RMDetailsReport")]
        public async Task<IActionResult> RMDetailsReport(String rptType, string id = "")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\RawMaterial\\";
                DataSet ds = await _reportService.RMPendingDetailsReport(id);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "RawMaterialPending";

                var reportName = "Raw Material Details Report";

                reportPath += "rptRMReceivePendingDetailsReport.rdlc";


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
