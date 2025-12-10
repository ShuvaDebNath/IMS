using AccountingBackEnd.DAL.DTOs;
using Boilerplate.Contracts;
using Boilerplate.Contracts.Enum;
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
using System.Security.AccessControl;
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
        public async Task<DataSet> ApplicationReport(ApplicaitonParams param)
        {
            try
            {
                var parametars = new
                {
                    param.fromDate,
                    param.toDate,
                    param.applicationType
                };

                string query = @"exec [usp_Application_Report] @fromDate,@toDate,@applicationType";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<DataSet> LCReport(LCParams param)
        {
            try
            {
                var parametars = new
                {
                    param.fromDate,
                    param.toDate,
                    param.LCNo
                };

                string query = @"exec [usp_LC_Report] @fromDate,@toDate,@LCNo";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<DataSet> CashReceiveReport(LCParams param)
        {
            try
            {
                var parametars = new
                {
                    param.fromDate,
                    param.toDate,
                };

                string query = @"exec [usp_CashReceive_Report] @fromDate,@toDate";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<DataSet> PIAmendmentReport(string id)
        {
            try
            {
                var parametars = new
                {
                    id
                };

                var piAmendmentDataset = new DataSet();

                string query = @"exec [usp_Application_PIInfo_PIAmendementReport] @id";
                var dt = await GetDataInDataTableAsync(query, parametars);
                dt.TableName = "PIAmendmentReport";

                piAmendmentDataset.Tables.Add(dt.Copy());

                query = @"exec [usp_Application_PIReviseInfo_PIAmendementReport] @id";

                var dt2 = await GetDataInDataTableAsync(query, parametars);
                dt2.TableName = "PIAmendmentReviseReport";

                piAmendmentDataset.Tables.Add(dt2.Copy());

                return piAmendmentDataset;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<DataSet> PIOtherReport(string id)
        {
            try
            {
                var parametars = new
                {
                    id
                };

                var piAmendmentDataset = new DataSet();

                string query = @"exec [usp_Application_PIReviseInfo_PIAmendementReport] @id";

                var dt2 = await GetDataInDataTableAsync(query, parametars);
                dt2.TableName = "PIAmendmentReviseReport";

                piAmendmentDataset.Tables.Add(dt2.Copy());

                return piAmendmentDataset;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<DataSet> SalesContractReport(String id)
        {
            try
            {
                var parametars = new
                {
                    id
                };

                string query = @"exec [usp_SC_Report] @id";
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
                    param.SentBy,
                };

                string query = @"exec [usp_Customer_Report] @Superior_Id,@Customer_Id,@Status,@SentBy";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public async Task<DataSet> BuyerReport(BuyerParams param)
        {
            try
            {
                var parametars = new
                {   
                    param.FromDate,
                    param.ToDate,
                    param.Superior_Id,
                    param.Customer_Id,
                    param.Status,
                    param.SentBy,
                };

                string query = @"exec [usp_Buyer_Report] @FromDate,@ToDate,@Superior_Id,@Customer_Id,@Status,@SentBy";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<DataSet> TaskReport(String id)
        {
            try
            {
                var parametars = new
                {
                    id
                };

                string query = @"exec [usp_Task_Report] @id";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<DataSet> ExportReport(String id)
        {
            try
            {
                var parametars = new
                {
                    id
                };

                string query = @"exec [usp_ExportRM_Details_Report] @id";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<DataSet> RawMaterialIssueInvoiceReport(String id)
        {
            try
            {
                var parametars = new
                {
                    id
                };

                string query = @"exec [usp_Rawmaterial_Issue_Details_Report] @id";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<DataSet> RMStockReport()
        {
            try
            {
                var parametars = new
                {
                };

                string query = @"exec [usp_RawmaterialInfos_With_Stock_report]";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<DataSet> FinishGoodSentReport(String id)
        {
            try
            {
                var parametars = new
                {
                    id
                };

                string query = @"exec [usp_FinishGood_Sent_Report] @id";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<DataSet> FGStockReport()
        {
            try
            {
                var parametars = new
                {
                };

                string query = @"exec [usp_Finishgoodsinfos_with_Stock_Report]";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<DataSet> FGSendAndReceiveReport(FGSentReceiveParams param)
        {
            try
            {
                var parametars = new
                {
                    param.InvoiceNo,
                    param.fromDate,
                    param.toDate,
                };

                string query = @"exec [usp_FinishGoods_Send_and_Receive_Print_Report] @InvoiceNo,@fromDate,@toDate";
                var ds = await GetDataInDataSetAsync(query, parametars);

                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<DataSet> RMPendingDetailsReport(String id)
        {
            try
            {
                var parametars = new
                {
                    id
                };

                string query = @"exec [usp_Rawmaterial_GetDataById_Report] @id";
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