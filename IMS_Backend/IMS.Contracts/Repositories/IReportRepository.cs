using AccountingBackEnd.DAL.DTOs;
using System.Data;

namespace Boilerplate.Contracts.Repositories;
public interface IReportRepository
{
    Task<DataSet> SampleRequestReport(ReportsParams param);
}
