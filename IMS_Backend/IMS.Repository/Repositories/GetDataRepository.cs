using Boilerplate.Contracts;
using Boilerplate.Contracts.Repositories;
using IMS.Contracts.DTOs;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Text;

namespace Boilerplate.Repository.Repositories
{
    public class GetDataRepository : GenericRepository<GetDataModel>, IGetDataRepository
    {
        private List<SqlParameter> parameters = new List<SqlParameter>();
        private SqlConnection conn;
        private SqlCommand cmd;
        private SqlDataAdapter adapter;

        public GetDataRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public async Task<DataTable> GetAllData(GetDataModel model)
        {
            try
            {
                DataTable ds = new DataTable();
                StringBuilder executeQuery = new StringBuilder($"exec {model.ProcedureName} ");
                executeQuery.Append(GenerateParamsQuery(model, ref parameters));
                if (model.Parameters.ToString() == "{}")
                {
                    ds = await GetDataInDataTableAsync(query: executeQuery.ToString(), selector: model.Parameters);
                }
                else
                {
                    conn = new SqlConnection(_connectionStringUserDB);

                    if (conn.State != ConnectionState.Open)
                        conn.Open();
                    cmd = new SqlCommand();
                    cmd.Connection = conn;
                    cmd.Parameters.Clear();
                    cmd.CommandText = executeQuery.ToString();
                    cmd.Parameters.AddRange(parameters.ToArray());
                    adapter = new SqlDataAdapter(cmd);
                    adapter.Fill(ds);
                }
                return ds;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.ToString());
            }
        }

        public async Task<DataTable> GetDataById(GetDataModel model)
        {
            try
            {
                StringBuilder executeQuery = new StringBuilder($"exec {model.ProcedureName} ");
                executeQuery.Append(GenerateParamsQuery(model, ref parameters));
                conn = new SqlConnection(_connectionStringUserDB);

                if (conn.State != ConnectionState.Open)
                    conn.Open();
                cmd = new SqlCommand();
                cmd.Connection = conn;
                cmd.Parameters.Clear();
                cmd.CommandText = executeQuery.ToString();
                cmd.Parameters.AddRange(parameters.ToArray());
                DataTable dt = new DataTable();
                dt.Load(await cmd.ExecuteReaderAsync());
                return dt;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.ToString());
            }
            finally
            {
                conn.Close();
            }
        }

        public Task<List<DDLSearchResultModel>> GetDataById(DDLSearchModel model)
        {
            throw new NotImplementedException();
        }

        public async Task<DataSet> GetInitialData(GetDataModel model)
        {
            try
            {
                DataSet ds = new DataSet();
                StringBuilder executeQuery = new StringBuilder($"exec {model.ProcedureName} ");
                executeQuery.Append(GenerateParamsQuery(model, ref parameters));
                if (model.Parameters.ToString() == "{}")
                {
                    ds = await GetDataInDataSetAsync(query: executeQuery.ToString(), selector: model.Parameters);
                }
                else
                {
                    conn = new SqlConnection(_connectionStringUserDB);

                    if (conn.State != ConnectionState.Open)
                        conn.Open();
                    cmd = new SqlCommand();
                    cmd.Connection = conn;
                    cmd.Parameters.Clear();
                    cmd.CommandText = executeQuery.ToString();
                    cmd.Parameters.AddRange(parameters.ToArray());
                    adapter = new SqlDataAdapter(cmd);
                    adapter.Fill(ds);
                }
                return ds;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.ToString());
            }
        }

        private StringBuilder GenerateParamsQuery(GetDataModel model,ref List<SqlParameter> parameters)
        {
            if (model.Parameters != null)
            {
                StringBuilder allParams = new StringBuilder();
                string? strParams = Convert.ToString(model.Parameters);
                var param = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(strParams);
                var cnt = ((IEnumerable<dynamic>)param).Count();
                foreach (var item in (IEnumerable<dynamic>)param)
                {
                    cnt--;
                    if (cnt > 0)
                    {
                        allParams.Append("@" + item.Name + ",");
                    }
                    else
                    {
                        allParams.Append("@" + item.Name);
                    }
                    parameters.Add(new SqlParameter($"@{item.Name}", item.Value.ToString()));
                }
                return allParams;
            }
            return null;
        }
    }
}
