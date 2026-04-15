using Boilerplate.Contracts.Repositories;
using IMS.Contracts.DTOs;
using Microsoft.Extensions.Configuration;

namespace Boilerplate.Repository.Repositories;

public class PiLogRepository : GenericRepository<PiLog>, IPiLogRepository
{
    public PiLogRepository(IConfiguration configuration) : base(configuration) { }

    public async Task AddAsync(PiLog log)
    {
        const string sql = @"
            INSERT INTO [dbo].[PI_Log]
                ([PI_Id], [ActionType], [DataSnapshot], [ChangedBy], [ChangedAt], [IPAddress], [UserAgent])
            VALUES
                (@PI_Id, @ActionType, @DataSnapshot, @ChangedBy, GETDATE(), @IPAddress, @UserAgent)";

        await ExecuteAsync(sql, new
        {
            log.PI_Id,
            log.ActionType,
            log.DataSnapshot,
            log.ChangedBy,
            log.IPAddress,
            log.UserAgent
        });
    }
}
