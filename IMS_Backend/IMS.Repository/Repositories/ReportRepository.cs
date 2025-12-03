using AccountingBackEnd.DAL.DTOs;
using Boilerplate.Contracts;
using Boilerplate.Contracts.Repositories;
using Boilerplate.Contracts.Services;
using IMS.Contracts.DTOs;
using IMS.Contracts.Repositories;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

namespace Boilerplate.Repository.Repositories
{
    public class ReportRepository : GenericRepository<DoubleMasterEntryModel>, IReportRepository
    {
        private SqlConnection conn;
        private SqlCommand cmd;
        private readonly IDoubleMasterEntryPostInsertActionFactory _postInsertActionFactory;
        public ReportRepository(
            IConfiguration configuration,
            IDoubleMasterEntryPostInsertActionFactory postInsertActionFactory) : base(configuration)
        {
            _postInsertActionFactory = postInsertActionFactory;
        }


        public async Task<DataSet> SampleRequestReport(ReportsParams param)
        {
            try
            {
                var parametars = new
                {
                    param.fromDate,
                    param.toDate,
                    param.requestStatus,
                    param.Id
                };

                string query = @"exec [usp_SampleRequest_Report] @fromDate,@toDate,@requestStatus,@Id";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public async Task<DataSet> TaskDetailsReport(ReportsParams param)
        {
            try
            {
                var parametars = new
                {
                    param.fromDate,
                    param.toDate,
                };

                string query = @"exec [usp_Task_Details_Report] @fromDate,@toDate";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<DataSet> CommercialInvoiceReports(CommercialInvoiceReportParams param)
        {
            try
            {
                var parametars = new
                {
                    param.Commercial_Invoice_No
                };

                string query = @"exec [usp_CommercialInvoice_Report] @Commercial_Invoice_No";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<DataSet> DeliveryChallanReport(DeliveryChallanReportParams param)
        {
            try
            {
                var parametars = new
                {
                    param.ChallanNo
                };

                string query = @"exec [usp_GetDeliveryChallanInfoByChallanNo] @ChallanNo";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

    }
}