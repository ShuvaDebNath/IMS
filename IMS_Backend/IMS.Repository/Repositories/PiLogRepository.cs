using Boilerplate.Contracts.Repositories;
using Dapper;
using IMS.Contracts.DTOs;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;

namespace Boilerplate.Repository.Repositories;

public class PiLogRepository : GenericRepository<PiLog>, IPiLogRepository
{
    public PiLogRepository(IConfiguration configuration) : base(configuration) { }

    // ── INSERT ────────────────────────────────────────────────────────────────

    public async Task AddAsync(PiLog log)
    {
        const string sql = @"
            INSERT INTO [dbo].[PI_Log]
                ([PI_Id], [ActionType], [MasterDataJson], [DetailsDataJson],
                 [ChangedBy], [ChangedByName], [ChangedAt], [IPAddress], [UserAgent])
            VALUES
                (@PI_Id, @ActionType, @MasterDataJson, @DetailsDataJson,
                 @ChangedBy, @ChangedByName, GETDATE(), @IPAddress, @UserAgent)";

        await ExecuteAsync(sql, new
        {
            log.PI_Id,
            log.ActionType,
            log.MasterDataJson,
            log.DetailsDataJson,
            log.ChangedBy,
            log.ChangedByName,
            log.IPAddress,
            log.UserAgent
        });
    }

    // ── QUERY all logs for one PI, oldest first ────────────────────────────────

    public async Task<List<PiLog>> GetByPiIdAsync(long piId)
    {
        const string sql = @"
            SELECT [LogId], [PI_Id], [ActionType], [MasterDataJson], [DetailsDataJson],
                   [ChangedBy], b.UserName [ChangedByName], [ChangedAt], [IPAddress], [UserAgent]
            FROM   [dbo].[PI_Log] a
            inner join tbl_users b on a.ChangedBy = b.User_ID
            WHERE  [PI_Id] = @PiId
            ORDER  BY [ChangedAt] ASC";

        using var con = new SqlConnection(_connectionStringUserDB);
        var rows = await con.QueryAsync<PiLog>(sql, new { PiId = piId });
        return rows.ToList();
    }

    // ── PI header info (PINo + ClientName) ────────────────────────────────────

    public async Task<(string PiNo, string ClientName)> GetPiInfoAsync(long piId)
    {
        try
        {
            const string sql = @"
                SELECT TOP 1
                    m.PINo,
                    ISNULL(c.CustomerName, '') AS CustomerName
                FROM   tbl_pi_master  m
                LEFT JOIN tbl_customer c ON c.Customer_ID = m.Customer_ID
                WHERE  m.PI_Master_ID = @PiId";

            using var con = new SqlConnection(_connectionStringUserDB);
            var row = await con.QueryFirstOrDefaultAsync(sql, new { PiId = piId });

            if (row is null) return (string.Empty, string.Empty);
            return ((string)(row.PINo ?? ""), (string)(row.CustomerName ?? ""));
        }
        catch
        {
            return (string.Empty, string.Empty);
        }
    }
}
