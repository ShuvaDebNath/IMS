using AccountingBackEnd.DAL.DTOs;
using Boilerplate.API.Controllers;
using Boilerplate.Contracts;
using Boilerplate.Contracts.Enum;
using Boilerplate.Contracts.Services;
using Boilerplate.Service.Services;
using Microsoft.AspNetCore.Mvc;
using QRCoder;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Drawing.Imaging;
using static System.Runtime.InteropServices.JavaScript.JSType;

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
        public async Task<IActionResult> SampleRequestReport(string rptType, string fromDate = "", string toDate = "", string requestStatus="" ,string UserID="")
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {               
                throw;
            }
        }


        
        [HttpGet]
        [Route("CustomerReport")]
        public async Task<IActionResult> CustomerReport([FromQuery] CustomerReportParams customerReportParams)
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "CustomerReport\\";
                DataSet ds = await _reportService.CustomerReport(customerReportParams);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "CustomerReport";

                var reportName = "Customer Report";

                reportPath += "rptCustomerReport.rdlc";


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, customerReportParams.RptType, ds);


                if (customerReportParams.RptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(customerReportParams.RptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(customerReportParams.RptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("BuyerReport")]
        public async Task<IActionResult> BuyerReport([FromQuery] BuyerReportParams buyerReportParams)
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\BuyerReport\\";
                DataSet ds = await _reportService.BuyerReport(buyerReportParams);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "BuyerReport";

                var reportName = "Buyer Report";

                reportPath += "rptBuyerReport.rdlc";


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, buyerReportParams.RptType, ds);


                if (buyerReportParams.RptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(buyerReportParams.RptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(buyerReportParams.RptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("ProformaInvoiceReport")]
        public async Task<IActionResult> ProformaInvoiceReport(string rptType, int PI_Master_ID, bool IsMPI)
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("CommercialInvoiceReports")]
        public async Task<IActionResult> CommercialInvoiceReports(string rptType, string commercialInvoiceNo, string reportType)
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

                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("DeliveryChallanReport")]
        public async Task<IActionResult> DeliveryChallanReport(string rptType, string challanNo)
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


                int shipperId = 0;

                if (ds.Tables[0].Columns.Contains("ShipperId") && ds.Tables[0].Rows.Count > 0)
                {
                    shipperId = Convert.ToInt32(ds.Tables[0].Rows[0]["ShipperId"]);
                }

                // Conditional report selection
                if (shipperId == 12 || shipperId == 5)
                {
                    reportPath += "ChallanSanxin.rdlc";
                }
                else
                {
                    reportPath += "Chalan.rdlc";
                }
                
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
        public async Task<IActionResult> ApplicationReport(string rptType, string fromDate,string toDate,string appType="")
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("LCReport")]
        public async Task<IActionResult> LCReport(string rptType, string fromDate, string toDate, string LCNo = "")
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("CashReceiveReport")]
        public async Task<IActionResult> CashReceiveReport(string rptType, string fromDate, string toDate)
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("PIAmendMentReport")]
        public async Task<IActionResult> PIAmendMentReport(string rptType, string id)
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }


        [HttpGet]
        [Route("PIOtherReport")]
        public async Task<IActionResult> PIOtherReport(string rptType, string id)
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }


        [HttpGet]
        [Route("SalesContractReport")]
        public async Task<IActionResult> SalesContractReport(string rptType, string id)
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

      
        


        [HttpGet]
        [Route("ExportReport")]
        public async Task<IActionResult> ExportReport(string rptType, string id = "")
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }


        [HttpGet]
        [Route("ExportReceiveReport")]
        public async Task<IActionResult> ExportReceiveReport(string rptType, string id = "")
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }


        [HttpGet]
        [Route("RawMaterialIssueInvoiceReport")]
        public async Task<IActionResult> RawMaterialIssueInvoiceReport(string rptType, string id = "")
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }


        [HttpGet]
        [Route("RMStockReport")]
        public async Task<IActionResult> RMStockReport(string rptType)
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }


        [HttpGet]
        [Route("FinishGoodSentReport")]
        public async Task<IActionResult> FinishGoodSentReport(string rptType, string id = "")
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("FinishGoodReceiveReport")]
        public async Task<IActionResult> FinishGoodReceiveReport(string rptType, string id = "")
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("FGStockReport")]
        public async Task<IActionResult> FGStockReport(string rptType)
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("FGSendAndReceiveReport")]
        public async Task<IActionResult> FGSendAndReceiveReport(string rptType, string fromDate, string toDate,string InvoiceNo = "" )
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }
        [HttpGet]
        [Route("RMPendingDetailsReport")]
        public async Task<IActionResult> RMPendingDetailsReport(string rptType, string id = "")
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("RMDetailsReport")]
        public async Task<IActionResult> RMDetailsReport(string rptType, string id = "")
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("TaskMonthlyDetailsReport")]
        public async Task<IActionResult> TaskMonthlyDetailsReport(string rptType, string id = "")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\TaskReport\\";
                DataSet ds = await _reportService.TaskMonthlyDetailsReport(id);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "MonthlyTaskReport";

                var reportName = "Task Details Monthly Report";

                reportPath += "rptTaskMonthlyDetailsReport.rdlc";


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("TaskMonthlyReport")]
        public async Task<IActionResult> TaskMonthlyReport(string rptType, string fromDate = "", string toDate = "",string userId="")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\TaskReport\\";
                DataSet ds = await _reportService.TaskMonthlyReport(fromDate, toDate,userId);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "MonthlyTaskReport";

                var reportName = "Task Monthly Report";

                reportPath += "rptTaskMonthlyReport.rdlc";


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("TaskCustomerVisitDetailsReport")]
        public async Task<IActionResult> TaskCustomerVisitDetailsReport(string rptType, string id = "")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\TaskReport\\";
                DataSet ds = await _reportService.TaskCustomerVisitDetailsReport(id);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "CustomerDetailsTaskReport";

                var reportName = "Customer Details Report";

                reportPath += "rptTaskCustomerDetailsReport.rdlc";


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("TaskCustomerVisitReport")]
        public async Task<IActionResult> TaskCustomerVisitReport(string rptType, string fromDate = "", string toDate = "",string userId="")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\TaskReport\\";
                DataSet ds = await _reportService.TaskCustomerVisitReport(fromDate, toDate, userId);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "CustomerDetailsTaskReport";

                var reportName = "Customer Details Report";

                reportPath += "rptTaskCustomerReport.rdlc";


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }


        [HttpGet]
        [Route("TaskReport")]
        public async Task<IActionResult> TaskReport(string rptType, string id = "")
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


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("TaskDetailsReport")]
        public async Task<IActionResult> TaskDetailsReport(string rptType, string fromDate = "", string toDate = "",string userId="")
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\TaskReport\\";
                DataSet ds = await _reportService.TaskDetailsReport(fromDate, toDate, userId);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "TaskDetails";

                var reportName = "Task Details Report";

                reportPath += "rptTaskDetailsReport.rdlc";


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("DeliveryReport")]
        public async Task<IActionResult> DeliveryReport(string rptType, int PI_Master_ID)
        {
            try
            {
                var currentUser = HttpContext.User;

                DataSet ds = await _reportService.DeliveryReport(PI_Master_ID);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                string reportPath = "V2\\DeliveryReport\\";

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "DeliveryReport";

                var reportName = "Delivery Report";

                reportPath += "rptDeliveryReport.rdlc";


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet]
        [Route("UserReport")]
        public async Task<IActionResult> UserReport(string rptType, int RoleId,int pageLength,int pageNo,string searchParam="")
        {
            try
            {
                var currentUser = HttpContext.User;

                DataSet ds = await _reportService.UserReport(RoleId, pageLength, pageNo, searchParam);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                string reportPath = "V2\\UserReport\\";

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "UserReport";

                var reportName = "user Report";

                reportPath += "rptUserReport.rdlc";


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }
        [HttpGet]
        [Route("PIReport")]
        public async Task<IActionResult> PIReport([FromQuery] PIReportParams pIReportParams)
        {
            try
            {
                var currentUser = HttpContext.User;

                DataSet ds = await _reportService.PIReport(pIReportParams);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                string reportPath = "V2\\PIReport\\";

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "PIReport";

                var reportName = "PI Report";

                reportPath += "rptPIReport.rdlc";


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, pIReportParams.RptType, ds);


                if (pIReportParams.RptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(pIReportParams.RptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(pIReportParams.RptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }

        // ── Generic Report Endpoint ───────────────────────────────────────────────

        /// <summary>
        /// Single generic endpoint aligned with the frontend <c>PrintReport()</c> function.
        ///
        /// Frontend calls:
        ///   PrintReport('GenericReport/{reportKey}', params, rptType, isView, baseFileName)
        ///   → GET api/Report/GenericReport/{reportKey}?rptType=excel&amp;Param1=val&amp;Param2=val&amp;...
        ///
        /// Response contract (mirrors what PrintReport expects):
        ///   • Data found   → returns a binary File blob  (res.size > 0  → downloaded/viewed)
        ///   • No data      → returns an empty byte[]     (res.size === 0 → "No Data Found" Swal)
        ///   • Bad reportKey → 400 Bad Request             (error callback → "Failed to generate report." Swal)
        ///
        /// To add a new report: insert one active row into the <c>ReportConfigs</c> DB table.
        /// No code change required.
        /// </summary>
        [HttpGet]
        [Route("GenericReport/{reportKey}")]
        public async Task<IActionResult> GenericReport(
            string reportKey,
            string rptType,
            [FromQuery] Dictionary<string, string> parameters)
        {
            try
            {
                // rptType arrives BOTH as an explicit route param AND inside the dictionary
                // (because [FromQuery] Dictionary captures every query-string key).
                // Strip it before forwarding to the SP — the SP must not receive rptType.
                parameters.Remove("rptType");

                var result = await _reportService.RunGenericReportAsync(reportKey, parameters);

                var ds = result.Data;

                // ── No data: return an EMPTY blob so the frontend res.size === 0 check
                //    triggers the "No Data Found" Swal — NOT a JSON body which would be
                //    received as a non-empty blob and silently downloaded as a corrupt file.
                if (ds == null || ds.Tables.Count == 0 || ds.Tables[0].Rows.Count == 0)
                    return File(Array.Empty<byte>(), System.Net.Mime.MediaTypeNames.Application.Octet);

                ds.Tables[0].TableName = result.TableName;

                var rendered = RDLCSimplified.RDLCSetup.GenerateReportAsync(result.RdlcPath, rptType, ds);

                // ── PDF: return inline so the frontend can open it in a new tab.
                // ── Excel / Word: return as an attachment download; the frontend builds
                //    the filename from baseFileName + today's date + extension.
                if (rptType.ToLower() == "pdf")
                    return File(rendered, RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));

                return File(
                    rendered,
                    System.Net.Mime.MediaTypeNames.Application.Octet,
                    result.ReportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
            }
            catch (KeyNotFoundException knfEx)
            {
                // 400 → Angular HTTP client fires the error() callback
                // → PrintReport's error handler shows "Failed to generate report." Swal.
                return BadRequest(new { msg = knfEx.Message });
            }
            catch (Exception)
            {
                throw;
            }
        }

        // ── Existing specific endpoints ───────────────────────────────────────────

        [HttpGet]
        [Route("ProformaInvoiceDeliveryLogReport")]
        public async Task<IActionResult> ProformaInvoiceDeliveryLogReport(
            string rptType, string fromDate, string toDate, string PI_Master_Id, string User_Id, string Client_Id)
        {
            try
            {
                var currentUser = HttpContext.User;

                string reportPath = "V2\\LCReport\\";
                DataSet ds = await _reportService.DeliveryLogReport(fromDate, toDate, PI_Master_Id, User_Id, Client_Id);

                if (ds != null && ds.Tables.Count <= 0 || ds.Tables[0].Rows.Count <= 0)
                {

                    return Ok(new { msg = "Data Not Found" });
                }

                ds.Tables[0].TableName = "LCReport";

                var reportName = "LC Report";

                reportPath += "rptLCReport.rdlc";


                var returnstring = RDLCSimplified.RDLCSetup.GenerateReportAsync(reportPath, rptType, ds);


                if (rptType.ToLower() == "pdf")
                {
                    return File(returnstring, contentType: RDLCSimplified.RDLCSetup.GetContentType(rptType.ToLower()));
                }
                else
                {
                    return File(returnstring, System.Net.Mime.MediaTypeNames.Application.Octet, reportName + "." + RDLCSimplified.RDLCSetup.GetExtension(rptType.ToLower()));
                }

            }
            catch (Exception ex)
            {
                throw;
            }
        }



    }

}
