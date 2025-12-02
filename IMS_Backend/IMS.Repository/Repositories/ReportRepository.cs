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

                string query = @"exec [usp_SampleRequest_Messenger_Report] @fromDate,@toDate,@requestStatus,@Id";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<DataSet> CustomerReport(CustomerParams param)
        {
            try
            {
                var parametars = new
                {
                    param.Superior_Id,
                    param.Customer_Id,
                    param.Status,
                    param.SentBy
                };

                string query = @"exec [usp_Customer_GetCustomerData] @Superior_Id,@Customer_Id,@Status,@SentBy";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<DataSet> ProformaInvoiceReport(ProformaInvoiceReportParams param)
        {
            try
            {
                var parametars = new
                {
                    param.PI_Master_ID
                };

                string query = @"exec [usp_ProformaInvoice_GetDataById] @PI_Master_ID";
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