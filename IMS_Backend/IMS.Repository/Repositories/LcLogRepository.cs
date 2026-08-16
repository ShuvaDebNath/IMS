using Boilerplate.Contracts.Repositories;
using Dapper;
using IMS.Contracts.DTOs;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;

namespace Boilerplate.Repository.Repositories;

public class LcLogRepository : GenericRepository<LcLog>, ILcLogRepository
{
    public LcLogRepository(IConfiguration configuration) : base(configuration) { }

    public async Task<List<LcLog>> GetByLcIdAsync(long lcId)
    {
        const string sql = @"
            SELECT l.[LogId], l.[LC_ID], l.[ActionType], l.[OldDataJson], l.[NewDataJson],
                   l.[ChangedBy], u.[UserName] AS [ChangedByName], l.[ChangedAt],
                   l.[IPAddress], l.[UserAgent]
            FROM   [dbo].[LC_Log] l
            LEFT JOIN [dbo].[tbl_users] u ON l.[ChangedBy] = u.[User_ID]
            WHERE  l.[LC_ID] = @LcId
            ORDER  BY l.[ChangedAt] ASC";

        using var con = new SqlConnection(_connectionStringUserDB);
        var rows = await con.QueryAsync<LcLog>(sql, new { LcId = lcId });
        return rows.ToList();
    }

    public async Task<(string LcNo, string ConsigneeName)> GetLcInfoAsync(long lcId)
    {
        try
        {
            const string sql = @"
                SELECT TOP 1
                    ISNULL([LC_No], '')          AS LcNo,
                    ISNULL([Consignee_Name], '') AS ConsigneeName
                FROM   [dbo].[tbl_lc]
                WHERE  [LC_ID] = @LcId";

            using var con = new SqlConnection(_connectionStringUserDB);
            var row = await con.QueryFirstOrDefaultAsync(sql, new { LcId = lcId });

            if (row is null) return (string.Empty, string.Empty);
            return ((string)(row.LcNo ?? ""), (string)(row.ConsigneeName ?? ""));
        }
        catch
        {
            return (string.Empty, string.Empty);
        }
    }

    /// <summary>
    /// One-time PI number lookup loaded into the audit cache (not per log row).
    /// </summary>
    public async Task<Dictionary<string, string>> GetPiNoLookupAsync()
    {
        const string sql = @"
            SELECT CAST([PI_Master_ID] AS NVARCHAR(20)) AS [Id],
                   ISNULL([PINo], CAST([PI_Master_ID] AS NVARCHAR(20))) AS [Display]
            FROM   [dbo].[tbl_pi_master]
            WHERE  [PI_Master_ID] IS NOT NULL";

        try
        {
            using var con = new SqlConnection(_connectionStringUserDB);
            var rows = await con.QueryAsync<(string Id, string Display)>(sql);

            return rows
                .Where(r => !string.IsNullOrWhiteSpace(r.Id))
                .ToDictionary(
                    r => r.Id.Trim(),
                    r => r.Display?.Trim() ?? r.Id.Trim(),
                    StringComparer.OrdinalIgnoreCase);
        }
        catch
        {
            return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        }
    }
}
