using AccountingBackEnd.DAL.DTOs;
using IMS.Contracts.DTOs;
using System.Data;

namespace Boilerplate.Contracts.Repositories;
public interface IReportRepository
{
    Task<DataSet> SampleRequestReport(ReportsParams param);
    Task<DataSet> ProformaInvoiceReport(ProformaInvoiceReportParams param);
    Task<DataSet> TaskDetailsReport(ReportsParams param);
    Task<DataSet> CommercialInvoiceReports(CommercialInvoiceReportParams param);
    Task<DataSet> DeliveryChallanReport(DeliveryChallanReportParams param);
}
