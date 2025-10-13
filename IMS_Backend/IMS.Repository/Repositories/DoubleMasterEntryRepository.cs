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
    public class DoubleMasterEntryRepository : GenericRepository<DoubleMasterEntryModel>, IDoubleMasterEntryRepository
    {
        private SqlConnection conn;
        private SqlCommand cmd;
        private readonly IDoubleMasterEntryPostInsertActionFactory _postInsertActionFactory;
        public DoubleMasterEntryRepository(
            IConfiguration configuration,
            IDoubleMasterEntryPostInsertActionFactory postInsertActionFactory) : base(configuration)
        {
            _postInsertActionFactory = postInsertActionFactory;
        }

        public async Task<int> DeleteData(DoubleMasterEntryModel model)
        {
            string? strWhereParams = Convert.ToString(model.WhereParams);
            var WhereParams = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(strWhereParams);

            int cnt = ((IEnumerable<dynamic>)WhereParams).Count();
            var deleteMasterSQL = new StringBuilder($"DELETE FROM {model.TableNameMaster} WHERE ");
            var deleteChildSQL = new StringBuilder($"DELETE FROM {model.TableNameChild} WHERE ");

            var strWhereClouse = new StringBuilder();
            List<SqlParameter> deleteParam = new List<SqlParameter>();
            foreach (var item in (IEnumerable<dynamic>)WhereParams)
            {
                cnt--;
                if (cnt == 0)
                {
                    strWhereClouse.Append(item.Name + " = @" + item.Name);
                    deleteParam.Add(new SqlParameter($"@{item.Name}", item.Value.ToString()));
                    continue;
                }
                strWhereClouse.Append(item.Name + " = @" + item.Name + " AND ");
                deleteParam.Add(new SqlParameter($"@{item.Name}", item.Value.ToString()));
            }
            deleteMasterSQL.Append(strWhereClouse);
            deleteChildSQL.Append(strWhereClouse);

            int rowAffect = 0;
            conn = new SqlConnection(_connectionStringUserDB);

            if (conn.State != ConnectionState.Open)
                conn.Open();
            var trn = conn.BeginTransaction();
            cmd = new SqlCommand();
            cmd.Connection = conn;
            cmd.Transaction = trn;
            cmd.Parameters.Clear();
            try
            {
                cmd.CommandText = deleteChildSQL.ToString();
                cmd.Parameters.AddRange(deleteParam.ToArray());
                rowAffect = await cmd.ExecuteNonQueryAsync();

                cmd.CommandText = "";
                cmd.CommandText = deleteMasterSQL.ToString();
                rowAffect += await cmd.ExecuteNonQueryAsync();

                await cmd.Transaction.CommitAsync();
            }
            catch (Exception)
            {
                await cmd.Transaction.RollbackAsync();
                throw;
            }
            finally
            {
                await conn.CloseAsync();
            }
            return rowAffect > 0 ? 1 : 0;
        }

        public async Task<int> SaveData(DoubleMasterEntryModel model, string authUserName)
        {
            int rowAffect = 0;
            conn = new SqlConnection(_connectionStringUserDB);

            if (conn.State != ConnectionState.Open)
                conn.Open();
            var trn = conn.BeginTransaction();
            cmd = new SqlCommand();
            cmd.Connection = conn;
            cmd.Transaction = trn;
            try
            {
                string primeryKey = Guid.NewGuid().ToString();

                int serialNo = string.IsNullOrEmpty(model.ColumnNameSerialNo) ? 0 : await GenSerialNumberAsync(model.SerialType);

                rowAffect = await MasterTabelInsert(model, primeryKey, cmd, authUserName, serialNo);

                if (rowAffect > 0)
                {
                    rowAffect += await DetailsTabelInsert(model, primeryKey, cmd);
                }

                await cmd.Transaction.CommitAsync();
            }
            catch (Exception)
            {
                await cmd.Transaction.RollbackAsync();
                throw;
            }
            finally
            {
                await conn.CloseAsync();
            }
            return rowAffect;

        }

        public async Task<int> SaveListData(DoubleMasterEntryModel model, string authUserName)
        {
            int rowAffect = 0;
            conn = new SqlConnection(_connectionStringUserDB);

            if (conn.State != ConnectionState.Open)
                conn.Open();
            var trn = conn.BeginTransaction();
            cmd = new SqlCommand();
            cmd.Connection = conn;
            cmd.Transaction = trn;
            try
            {
                string commonKey = Guid.NewGuid().ToString();

                rowAffect += await MasterTabelListInsert(model, commonKey, cmd, authUserName);

                await cmd.Transaction.CommitAsync();
            }
            catch (Exception)
            {
                await cmd.Transaction.RollbackAsync();
                throw;
            }
            finally
            {
                await conn.CloseAsync();
            }
            return rowAffect;
        }

        public async Task<int> UpdateData(DoubleMasterEntryModel model, string authUserName)
        {
            int rowAffect = 0;
            conn = new SqlConnection(_connectionStringUserDB);

            if (conn.State != ConnectionState.Open)
                conn.Open();
            var trn = conn.BeginTransaction();
            cmd = new SqlCommand();
            cmd.Connection = conn;
            cmd.Transaction = trn;
            try
            {
                rowAffect = await MasterTabelUpdate(model, cmd, authUserName);

                await cmd.Transaction.CommitAsync();
            }
            catch (Exception)
            {
                await cmd.Transaction.RollbackAsync();
                throw;
            }
            finally
            {
                await conn.CloseAsync();
            }
            return rowAffect;
        }
        private async Task<int> MasterTabelInsert(DoubleMasterEntryModel model, string primeryKey, SqlCommand cmd, string authUserName, int serialNo)
        {
            string? masterTablename = model.TableNameMaster;
            var sqlMaster = new StringBuilder($"insert into {masterTablename} (");
            var values = new StringBuilder(" values (");

            string? strdata = Convert.ToString(model.Data);

            var data = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(strdata);
            var cnt = ((IEnumerable<dynamic>)data).Count();
            cmd.Parameters.Clear();
            List<SqlParameter> param = new List<SqlParameter>();
            foreach (var item in (IEnumerable<dynamic>)data)
            {
                cnt--;
                if (cnt > 0)
                {
                    sqlMaster.Append(item.Name + ",");
                    values.Append("@" + item.Name + ",");
                }
                else
                {
                    sqlMaster.Append(item.Name);
                    values.Append("@" + item.Name);
                }
                if (item.Name.ToLower() == model.ColumnNamePrimary.ToLower())
                {
                    param.Add(new SqlParameter($"@{item.Name}", primeryKey));
                }
                else if (item.Name.ToLower() == model.ColumnNameSerialNo.ToLower())
                {
                    if (serialNo > 0)
                    {
                        param.Add(new SqlParameter($"@{item.Name}", item.Value.ToString() + "" + serialNo.ToString()));
                    }
                    else
                    {
                        param.Add(new SqlParameter($"@{item.Name}", item.Value.ToString()));
                    }
                }
                else
                {
                    param.Add(new SqlParameter($"@{item.Name}", item.Value.ToString()));
                }
            }
            sqlMaster.Append(", MakeDate, MakeBy, InsertTime)");
            values.Append(", getdate(), @authUserName , getdate())");
            param.Add(new SqlParameter("@authUserName", authUserName));
            sqlMaster.Append(values.ToString());
            cmd.CommandText = sqlMaster.ToString();
            cmd.Parameters.AddRange(param.ToArray());
            return await cmd.ExecuteNonQueryAsync();
        }
        private async Task<int> MasterTabelUpdate(DoubleMasterEntryModel model, SqlCommand cmd, string authUserName)
        {
            string? masterTablename = model.TableNameMaster;
            string primeryKey = "";
            cmd.Parameters.Clear();
            List<SqlParameter> param = new List<SqlParameter>();

            string? strdata = Convert.ToString(model.Data);
            var data = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(strdata);

            string? strWhereParams = Convert.ToString(model.WhereParams);
            var WhereParams = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(strWhereParams);

            var sqlMaster = new StringBuilder($"UPDATE {masterTablename} SET ");
            foreach (var item in (IEnumerable<dynamic>)data)
            {
                if (item.Name.ToLower() != model.ColumnNamePrimary.ToLower())
                {
                    sqlMaster.Append(item.Name + " = @" + item.Name + ",");
                    param.Add(new SqlParameter($"@{item.Name}", item.Value.ToString()));
                }

            }
            sqlMaster.Append("UpdateDate = getdate(), UpdateBy = @authUserName,UpdateTime=getdate() WHERE ");
            param.Add(new SqlParameter("@authUserName", authUserName));
            int cnt = ((IEnumerable<dynamic>)WhereParams).Count();
            var deleteSQL = new StringBuilder($"DELETE FROM {model.TableNameChild} WHERE ");
            var strWhereClouse = new StringBuilder();
            List<SqlParameter> whereParam = new List<SqlParameter>();

            foreach (var item in (IEnumerable<dynamic>)WhereParams)
            {
                primeryKey = item.Name.ToString().ToLower() == model.ColumnNamePrimary.ToLower() ? item.Value.ToString() : primeryKey;
                cnt--;
                if (cnt == 0)
                {
                    strWhereClouse.Append(item.Name + " = @" + item.Name);
                    whereParam.Add(new SqlParameter($"@{item.Name}", item.Value.ToString()));
                    continue;
                }
                strWhereClouse.Append(item.Name + " = @" + item.Name + " AND ");
                whereParam.Add(new SqlParameter($"@{item.Name}", item.Value.ToString()));
            }
            sqlMaster.Append(strWhereClouse.ToString());
            deleteSQL.Append(strWhereClouse.ToString());
            cmd.CommandText = sqlMaster.ToString();
            cmd.Parameters.AddRange(param.ToArray());
            cmd.Parameters.AddRange(whereParam.ToArray());
            int rowAffect = await cmd.ExecuteNonQueryAsync();

            if (rowAffect > 0)
            {
                cmd.CommandText = "";
                cmd.CommandText = deleteSQL.ToString();
                cmd.Parameters.Clear();
                cmd.Parameters.AddRange(whereParam.ToArray());
                rowAffect += await cmd.ExecuteNonQueryAsync();

                rowAffect += await DetailsTabelInsert(model, primeryKey, cmd);
            }

            return rowAffect > 0 ? 1 : 0;

        }
        private async Task<int> DetailsTabelInsert(DoubleMasterEntryModel model, string primeryKey, SqlCommand cmd)
        {
            int rowAffect = 0;
            string? childTablename = model.TableNameChild;

            string? strdata = Convert.ToString(model.DetailsData);
            var details = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(strdata);


            foreach (var citem in (IEnumerable<dynamic>)details)
            {
                var cData = citem;
                int cnt = ((IEnumerable<dynamic>)cData).Count();

                var sqlChiled = new StringBuilder($" insert into {childTablename} (");
                var values = new StringBuilder("values (");
                cmd.Parameters.Clear();
                List<SqlParameter> parameters = new List<SqlParameter>();
                foreach (var j in (IEnumerable<dynamic>)cData)
                {
                    cnt--;

                    if (cnt > 0)
                    {
                        sqlChiled.Append(j.Name + ",");
                        if (j.Value.ToString().ToLower() == "newid()")
                            values.Append(j.Value.ToString() + ",");
                        else
                            values.Append("@" + j.Name + ",");
                    }
                    else
                    {
                        sqlChiled.Append(j.Name);
                        if (j.Value.ToString().ToLower() == "newid()")
                            values.Append("'" + j.Value.ToString() + "'");
                        else
                            values.Append("@" + j.Name);
                    }
                    if (j.Value.ToString().ToLower() != "newid()")
                    {
                        if (j.Name.ToLower() == model.ColumnNamePrimary.ToLower())
                        {
                            parameters.Add(new SqlParameter("@" + j.Name, primeryKey));
                        }
                        else
                        {
                            parameters.Add(new SqlParameter("@" + j.Name, j.Value.ToString()));
                        }
                    }
                }
                sqlChiled.Append(") ");
                values.Append(") ");
                sqlChiled.Append(values.ToString());
                cmd.CommandText = sqlChiled.ToString();
                cmd.Parameters.AddRange(parameters.ToArray());
                rowAffect += await cmd.ExecuteNonQueryAsync();
            }
            return rowAffect > 0 ? 1 : 0;
        }
        private async Task<int> MasterTabelListInsert(DoubleMasterEntryModel model, string commonKey, SqlCommand cmd, string authUserName)
        {
            int rowAffect = 0;
            string? childTablename = model.TableNameChild;

            string? strdata = Convert.ToString(model.DetailsData);
            var details = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(strdata);

            foreach (var citem in (IEnumerable<dynamic>)details)
            {
                var cData = citem;
                int cnt = ((IEnumerable<dynamic>)cData).Count();

                var sqlChiled = new StringBuilder($" insert into {childTablename} (");
                var values = new StringBuilder("values (");
                cmd.Parameters.Clear();
                List<SqlParameter> parameters = new List<SqlParameter>();
                foreach (var j in (IEnumerable<dynamic>)cData)
                {
                    cnt--;

                    if (cnt > 0)
                    {
                        sqlChiled.Append(j.Name + ",");
                        if (j.Value.ToString().ToLower() == "newid()")
                            values.Append(j.Value.ToString() + ",");
                        else
                            values.Append("@" + j.Name + ",");
                    }
                    else
                    {
                        sqlChiled.Append(j.Name);
                        if (j.Value.ToString().ToLower() == "newid()")
                            values.Append(j.Value.ToString());
                        else
                            values.Append("@" + j.Name);
                    }
                    if (j.Value.ToString().ToLower() != "newid()")
                    {
                        parameters.Add(new SqlParameter("@" + j.Name, j.Value.ToString()));
                    }
                }
                sqlChiled.Append(", MakeDate, MakeBy, InsertTime)");
                values.Append(", getdate(), @authUserName , getdate())");
                parameters.Add(new SqlParameter("@authUserName", authUserName));
                sqlChiled.Append(values.ToString());
                cmd.CommandText = sqlChiled.ToString();
                cmd.Parameters.AddRange(parameters.ToArray());
                rowAffect += await cmd.ExecuteNonQueryAsync();
            }
            return rowAffect > 0 ? 1 : 0;
        }

        #region Save with Identity

        public async Task<int> SaveDataWithIdentity(DoubleMasterEntryModel model, string authUserName)
        {
            int rowAffect = 0;
            conn = new SqlConnection(_connectionStringUserDB);
            if (conn.State != ConnectionState.Open)
                await conn.OpenAsync();
            var trn = conn.BeginTransaction();
            cmd = new SqlCommand();
            cmd.Connection = conn;
            cmd.Transaction = trn;
            try
            {
                int serialNo = 0;

                if (!string.IsNullOrWhiteSpace(model.SerialType) &&
                    !string.IsNullOrWhiteSpace(model.ColumnNameSerialNo))
                {
                    serialNo = await GenSerialNumberAsync(model.SerialType);
                }

                int newPrimaryKey = await MasterTableInsertWithIdentity(model, cmd, authUserName, 0);
                if (newPrimaryKey > 0)
                {
                    rowAffect = await DetailsTableInsertWithIdentity(model, newPrimaryKey, cmd);

                    if (rowAffect > 0)
                    {
                        JObject obj = JObject.Parse(model.Data.ToString());

                        obj["PrimaryKey"] = newPrimaryKey;
                        model.Data = obj;

                        var actions = _postInsertActionFactory.GetActions(model);
                        foreach (var action in actions)
                        {
                            await action.ExecuteAsync(model, authUserName);
                        }
                    }
                }
                await cmd.Transaction.CommitAsync();
                rowAffect = newPrimaryKey;
            }
            catch (Exception)
            {
                await cmd.Transaction.RollbackAsync();
                throw;
            }
            finally
            {
                await conn.CloseAsync();
            }
            return rowAffect;
        }

        private async Task<int> MasterTableInsertWithIdentity(DoubleMasterEntryModel model, SqlCommand cmd, string authUserName, int serialNo)
        {

            string? masterTablename = model.TableNameMaster;
            var masterColumns = new StringBuilder();
            var masterValues = new StringBuilder();
            string? strdata = Convert.ToString(model.Data);
            var data = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(strdata);
            int cnt = ((IEnumerable<dynamic>)data).Count();
            List<SqlParameter> param = new List<SqlParameter>();
            int nonPkColumnCount = 0;
            foreach (var item in (IEnumerable<dynamic>)data)
            {
                cnt--;
                if (item.Name.ToLower() == model.ColumnNamePrimary?.ToLower())
                    continue; // skip PK column for identity
                nonPkColumnCount++;
                masterColumns.Append(item.Name + (cnt > 0 ? "," : ""));
                masterValues.Append("@" + item.Name + (cnt > 0 ? "," : ""));
                if (item.Name.ToLower() == model.ColumnNameSerialNo?.ToLower())
                {
                    if (serialNo > 0)
                        param.Add(new SqlParameter("@" + item.Name, item.Value.ToString() + serialNo.ToString()));
                    else
                        param.Add(new SqlParameter("@" + item.Name, item.Value.ToString()));
                }
                else
                {
                    param.Add(new SqlParameter("@" + item.Name, item.Value.ToString()));
                }
            }
            if (nonPkColumnCount == 0)
            {
                throw new InvalidOperationException($"No columns to insert for table '{masterTablename}'. At least one non-primary-key column is required.");
            }
            masterColumns.Append(", MakeDate, MakeBy, InsertTime");
            masterValues.Append(", getdate(), @authUserName , getdate()");
            param.Add(new SqlParameter("@authUserName", authUserName));
            cmd.CommandText = $"INSERT INTO {masterTablename} ({masterColumns}) VALUES ({masterValues}); SELECT CAST(SCOPE_IDENTITY() AS int);";
            cmd.Parameters.Clear();
            cmd.Parameters.AddRange(param.ToArray());
            var newPrimaryKey = (int)await cmd.ExecuteScalarAsync();
            return newPrimaryKey;
        }

        private async Task<int> DetailsTableInsertWithIdentity(DoubleMasterEntryModel model, int primeryKey, SqlCommand cmd)
        {
            int rowAffect = 0;
            string? childTablename = model.TableNameChild;
            string? strdata = Convert.ToString(model.DetailsData);
            var details = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(strdata);
            foreach (var citem in (IEnumerable<dynamic>)details)
            {
                var cData = citem;
                int cnt = ((IEnumerable<dynamic>)cData).Count();
                var childColumns = new StringBuilder();
                var childValues = new StringBuilder();
                List<SqlParameter> parameters = new List<SqlParameter>();
                foreach (var j in (IEnumerable<dynamic>)cData)
                {
                    cnt--;
                    childColumns.Append(j.Name + (cnt > 0 ? "," : ""));
                    childValues.Append("@" + j.Name + (cnt > 0 ? "," : ""));
                    if (j.Name.ToLower() == model.ColumnNameForign?.ToLower())
                        parameters.Add(new SqlParameter("@" + j.Name, primeryKey));
                    else
                        parameters.Add(new SqlParameter("@" + j.Name, j.Value.ToString()));
                }
                parameters.Add(new SqlParameter("@authUserName", cmd.Parameters["@authUserName"].Value));
                cmd.CommandText = $"INSERT INTO {childTablename} ({childColumns}) VALUES ({childValues})";
                cmd.Parameters.Clear();
                cmd.Parameters.AddRange(parameters.ToArray());
                rowAffect += await cmd.ExecuteNonQueryAsync();
            }
            return rowAffect > 0 ? 1 : 0;
        }

        #endregion

        #region Update with Identity

        public async Task<int> UpdateDataWithIdentity(DoubleMasterEntryModel model, string authUserName)
        {
            int rowAffect = 0;
            conn = new SqlConnection(_connectionStringUserDB);
            if (conn.State != ConnectionState.Open)
                await conn.OpenAsync();
            var trn = conn.BeginTransaction();
            cmd = new SqlCommand();
            cmd.Connection = conn;
            cmd.Transaction = trn;
            try
            {
                // Get PK value from WhereParams
                string? strWhereParams = Convert.ToString(model.WhereParams);
                var whereParams = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(strWhereParams);
                object? pkValue = null;
                foreach (var item in (IEnumerable<dynamic>)whereParams)
                {
                    if (item.Name.ToLower() == model.ColumnNamePrimary?.ToLower())
                    {
                        pkValue = item.Value;
                        break;
                    }
                }
                if (pkValue == null)
                    throw new InvalidOperationException($"Primary key value not found in WhereParams for table '{model.TableNameMaster}'.");

                rowAffect = await UpdateMasterWithIdentity(model, authUserName, pkValue, cmd);
                if (rowAffect > 0)
                {
                    await UpdateDetailsWithIdentity(model, authUserName, pkValue, cmd);
                }
                await cmd.Transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await cmd.Transaction.RollbackAsync();
                throw;
            }
            finally
            {
                await conn.CloseAsync();
            }
            return rowAffect;
        }
        
        #region Master Update Helpers


        private async Task<int> UpdateMasterWithIdentity(
            DoubleMasterEntryModel model,
            string authUserName,
            object pkValue,
            SqlCommand cmd,
            CancellationToken ct = default)
        {
            if (cmd == null) throw new ArgumentNullException(nameof(cmd));
            if (model == null) throw new ArgumentNullException(nameof(model));
            if (string.IsNullOrWhiteSpace(model.TableNameMaster)) throw new ArgumentException("TableNameMaster is required.", nameof(model));
            if (string.IsNullOrWhiteSpace(model.ColumnNamePrimary)) throw new ArgumentException("ColumnNamePrimary is required.", nameof(model));

            // Normalize incoming data (and drill into the 'data' object if present)
            var root = AsJObject(model.Data);
            var obj = root["data"] as JObject ?? root; // ensures we use the JSON you showed

            // Columns you typically should NOT update
            var skip = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        model.ColumnNamePrimary, // PK
        "InsertDate","InsertTime","MakeBy","MakeDate"
    };

            var sets = new List<string>();
            var parameters = new List<SqlParameter>();

            foreach (var prop in obj.Properties())
            {
                var col = prop.Name;
                if (skip.Contains(col)) continue;

                var paramName = "@p_" + col;
                sets.Add($"[{col}] = {paramName}");
                parameters.Add(new SqlParameter(paramName, ToDbValue(prop.Value)));
            }

            // Audit fields (match your schema)
            sets.Add("[UpdateBy]   = @p_UpdateBy");
            sets.Add("[UpdateDate] = CAST(getdate() AS date)");
            sets.Add("[UpdateTime] = getdate()");
            parameters.Add(new SqlParameter("@p_UpdateBy", (object?)authUserName ?? DBNull.Value));

            // WHERE PK = @p_pk (guard against JsonElement/JValue)
            parameters.Add(new SqlParameter("@p_pk", ToDbValue(pkValue)));

            var sql = $"UPDATE [{model.TableNameMaster}] SET {string.Join(", ", sets)} WHERE [{model.ColumnNamePrimary}] = @p_pk;";

            cmd.Parameters.Clear();
            cmd.CommandType = CommandType.Text;
            cmd.CommandText = sql;
            cmd.Parameters.AddRange(parameters.ToArray());

            return await cmd.ExecuteNonQueryAsync(ct);
        }

        #endregion

        #region Helpers
        private static JObject AsJObject(object data)
        {
            if (data is null) return new JObject();
            if (data is JObject jo) return jo;
            if (data is string s)
            {
                s = s.Trim();
                return string.IsNullOrEmpty(s) ? new JObject() : JObject.Parse(s);
            }
            if (data is JToken jt) return jt as JObject ?? JObject.Parse(jt.ToString());
            if (data is JsonElement je) return JObject.Parse(je.GetRawText());
            if (data is JsonDocument jd) return JObject.Parse(jd.RootElement.GetRawText());
            if (data is JsonObject no) return JObject.Parse(no.ToJsonString());
            // fallback: serialize with Newtonsoft
            return JObject.Parse(JsonConvert.SerializeObject(data));
        }

        private static JArray AsJArray(object data)
        {
            if (data == null) return new JArray();
            if (data is JArray ja) return ja;
            if (data is string s) return string.IsNullOrWhiteSpace(s) ? new JArray() : JArray.Parse(s);
            if (data is JToken jt) return jt as JArray ?? new JArray(jt);
            if (data is JsonElement je) return JArray.Parse(je.GetRawText());
            if (data is JsonDocument jd) return JArray.Parse(jd.RootElement.GetRawText());
            return JArray.Parse(Newtonsoft.Json.JsonConvert.SerializeObject(data));
        }

        private static object ToDbValue(JToken token)
        {
            if (token == null || token.Type == JTokenType.Null) return DBNull.Value;

            switch (token.Type)
            {
                case JTokenType.Integer: return token.ToObject<long>();
                case JTokenType.Float: return token.ToObject<decimal>();
                case JTokenType.Boolean: return token.ToObject<bool>();
                case JTokenType.Date: return token.ToObject<DateTime>();
                case JTokenType.String:
                    {
                        var s = token.ToObject<string>()?.Trim();
                        if (string.IsNullOrEmpty(s)) return DBNull.Value;

                        if (bool.TryParse(s, out var b)) return b;
                        if (DateTime.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out var dt)) return dt;
                        if (decimal.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out var dec)) return dec;
                        if (long.TryParse(s, NumberStyles.Integer, CultureInfo.InvariantCulture, out var l)) return l;
                        return s;
                    }
                default:
                    return token.ToString(Newtonsoft.Json.Formatting.None);
            }
        }

        private static object ToDbValue(object value)
        {
            if (value is null) return DBNull.Value;
            if (value is JToken jt) return ToDbValue(jt);
            if (value is JsonElement je)
            {
                switch (je.ValueKind)
                {
                    case JsonValueKind.Null: return DBNull.Value;
                    case JsonValueKind.True: return true;
                    case JsonValueKind.False: return false;
                    case JsonValueKind.Number:
                        if (je.TryGetInt64(out var l)) return l;
                        if (je.TryGetDecimal(out var d)) return d;
                        return Convert.ToDecimal(je.GetDouble(), CultureInfo.InvariantCulture);
                    case JsonValueKind.String:
                        var s = je.GetString();
                        if (string.IsNullOrWhiteSpace(s)) return DBNull.Value;
                        if (bool.TryParse(s, out var b)) return b;
                        if (DateTime.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out var dt)) return dt;
                        if (decimal.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out var dec)) return dec;
                        if (long.TryParse(s, NumberStyles.Integer, CultureInfo.InvariantCulture, out var li)) return li;
                        return s;
                    default:
                        return je.GetRawText();
                }
            }
            return value;
        }

        private static (string schema, string table) SplitSchema(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Table name required.");
            var parts = name.Split('.', 2);
            return parts.Length == 2 ? (parts[0], parts[1]) : ("dbo", parts[0]);
        }

        private static async Task<string?> GetChildPkNameAsync(
            SqlConnection? conn, SqlTransaction? tx, string schema, string table, CancellationToken ct)
        {
            if (conn == null) return null;

            // Prefer PRIMARY KEY
            using (var cmd = new SqlCommand(@"
        SELECT TOP(1) kcu.COLUMN_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
          ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
         AND kcu.TABLE_SCHEMA = tc.TABLE_SCHEMA
         AND kcu.TABLE_NAME  = tc.TABLE_NAME
        WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
          AND tc.TABLE_SCHEMA = @schema AND tc.TABLE_NAME = @table
        ORDER BY kcu.ORDINAL_POSITION;", conn, tx))
            {
                cmd.Parameters.AddWithValue("@schema", schema);
                cmd.Parameters.AddWithValue("@table", table);
                var o = await cmd.ExecuteScalarAsync(ct);
                if (o != null && o != DBNull.Value) return Convert.ToString(o, CultureInfo.InvariantCulture);
            }

            // Fallback: identity column
            using (var cmd = new SqlCommand(@"
        SELECT TOP(1) c.[name]
        FROM sys.identity_columns c
        WHERE c.[object_id] = OBJECT_ID(QUOTENAME(@schema)+'.'+QUOTENAME(@table));", conn, tx))
            {
                cmd.Parameters.AddWithValue("@schema", schema);
                cmd.Parameters.AddWithValue("@table", table);
                var o = await cmd.ExecuteScalarAsync(ct);
                return o == null || o == DBNull.Value ? null : Convert.ToString(o, CultureInfo.InvariantCulture);
            }
        }

        private static object ToTypedId(string s)
        {
            if (long.TryParse(s, NumberStyles.Integer, CultureInfo.InvariantCulture, out var l)) return l;
            if (Guid.TryParse(s, out var g)) return g;
            return s;
        }

        #endregion

        #region Details Update Helpers

        private async Task UpdateDetailsWithIdentity(
    DoubleMasterEntryModel model,
    string authUserName,
    object pkValue,
    SqlCommand cmd,
    CancellationToken ct = default)
        {
            if (cmd == null) throw new ArgumentNullException(nameof(cmd));
            if (model == null) throw new ArgumentNullException(nameof(model));

            var childFull = model.TableNameChild ?? throw new ArgumentException("TableNameChild is required.", nameof(model));
            var fkCol = model.ColumnNameForign ?? throw new ArgumentException("ColumnNameForign is required.", nameof(model));
            var (schema, table) = SplitSchema(childFull);

            var rows = AsJArray(model.DetailsData);

            // 1) Find child PK column name from DB (no heuristic)
            var childPkName = await GetChildPkNameAsync(cmd.Connection, cmd.Transaction, schema, table, ct);
            if (string.IsNullOrWhiteSpace(childPkName))
                throw new InvalidOperationException($"Could not determine child PK column for [{schema}].[{table}].");

            // 2) Load existing PKs for this master
            var existing = new List<string>();
            cmd.Parameters.Clear();
            cmd.CommandType = CommandType.Text;
            cmd.CommandText = $"SELECT [{childPkName}] FROM [{schema}].[{table}] WHERE [{fkCol}] = @p_fk;";
            cmd.Parameters.Add(new SqlParameter("@p_fk", ToDbValue(pkValue)));

            using (var rdr = await cmd.ExecuteReaderAsync(ct))
            {
                while (await rdr.ReadAsync(ct))
                {
                    var v = rdr.GetValue(0);
                    if (v != DBNull.Value)
                        existing.Add(Convert.ToString(v, CultureInfo.InvariantCulture) ?? "");
                }
            }

            // 3) Upsert payload rows; record PKs we keep
            var keep = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var token in rows)
            {
                if (token is not JObject row) continue;

                // Extract child PK (if present in payload)
                JToken? pkTok;
                var hasPk = row.TryGetValue(childPkName, StringComparison.OrdinalIgnoreCase, out pkTok) &&
                            pkTok != null && pkTok.Type != JTokenType.Null &&
                            !string.IsNullOrWhiteSpace(pkTok.ToString());

                if (hasPk) keep.Add(pkTok!.ToString());

                // ---------- UPDATE path ----------
                if (hasPk)
                {
                    var sets = new List<string>();
                    var upParams = new List<SqlParameter>();

                    foreach (var prop in row.Properties())
                    {
                        var col = prop.Name;

                        // Never update PK or FK; skip insert-only audit columns
                        //if (col.Equals(childPkName, StringComparison.OrdinalIgnoreCase)) continue;
                        if (col.Equals(fkCol, StringComparison.OrdinalIgnoreCase)) continue;                          

                        var pName = "@p_" + col;
                        if(col!= childPkName)
                        {
                            pName = "@" + col;
                            sets.Add($"[{col}] = {pName}");
                            upParams.Add(new SqlParameter(pName, ToDbValue(prop.Value)));
                        }
                        
                    }

                    // Keys
                    upParams.Add(new SqlParameter("@p_fk", ToDbValue(pkValue)));
                    upParams.Add(new SqlParameter("@p_childPk", ToDbValue(pkTok!)));

                    cmd.Parameters.Clear();
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandText =
                        $"UPDATE [{schema}].[{table}] SET {string.Join(", ", sets)} " +
                        $"WHERE [{childPkName}] = @p_childPk AND [{fkCol}] = @p_fk;";
                    cmd.Parameters.AddRange(upParams.ToArray());
                    var affected = await cmd.ExecuteNonQueryAsync(ct);
                    if (affected > 0) continue; // updated; skip insert fallback
                }

                // ---------- INSERT path ----------
                var cols = new List<string>();
                var vals = new List<string>();
                var insParams = new List<SqlParameter>();

                // Always set FK from master, not from payload
                cols.Add($"[{fkCol}]"); vals.Add("@p_fk");
                insParams.Add(new SqlParameter("@p_fk", ToDbValue(pkValue)));

                foreach (var prop in row.Properties())
                {
                    var col = prop.Name;

                    // Skip PK on insert (assume identity or default)
                    if (col.Equals(childPkName, StringComparison.OrdinalIgnoreCase)) continue;
                    if (col.Equals(fkCol, StringComparison.OrdinalIgnoreCase)) continue;

                    var pName = "@p_" + col;
                    cols.Add($"[{col}]");
                    vals.Add(pName);
                    insParams.Add(new SqlParameter(pName, ToDbValue(prop.Value)));
                }

                // Audit on insert
                insParams.Add(new SqlParameter("@p_MakeBy", (object?)authUserName ?? DBNull.Value));

                cmd.Parameters.Clear();
                cmd.CommandType = CommandType.Text;
                cmd.CommandText = $"INSERT INTO [{schema}].[{table}] ({string.Join(", ", cols)}) VALUES ({string.Join(", ", vals)});";
                cmd.Parameters.AddRange(insParams.ToArray());
                await cmd.ExecuteNonQueryAsync(ct);
            }

            // 4) DELETE any DB rows not in payload
            var toDelete = existing.Where(s => !keep.Contains(s)).ToList();
            if (toDelete.Count > 0)
            {
                var names = new List<string>();
                cmd.Parameters.Clear();
                cmd.CommandType = CommandType.Text;
                cmd.Parameters.Add(new SqlParameter("@p_fk", ToDbValue(pkValue)));

                for (int i = 0; i < toDelete.Count; i++)
                {
                    var pName = "@d" + i;
                    names.Add(pName);
                    cmd.Parameters.Add(new SqlParameter(pName, ToTypedId(toDelete[i])));
                }

                cmd.CommandText =
                    $"DELETE FROM [{schema}].[{table}] " +
                    $"WHERE [{fkCol}] = @p_fk AND [{childPkName}] IN ({string.Join(", ", names)});";

                await cmd.ExecuteNonQueryAsync(ct);
            }
        }

        #endregion


        #endregion
    }
}