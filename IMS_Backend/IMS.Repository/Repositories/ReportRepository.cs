using AccountingBackEnd.DAL.DTOs;
using Boilerplate.Contracts;
using Boilerplate.Contracts.Repositories;
using Boilerplate.Contracts.Services;
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
                    param.Id,
                };

                string query = @"exec [prcRequisitionIndividualPDF] @reqid";
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