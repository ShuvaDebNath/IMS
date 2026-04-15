using Boilerplate.Contracts.Repositories;
using Boilerplate.Contracts.Services;
using IMS.Contracts.DTOs;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Boilerplate.Service.Services;

public class PiLogService : IPiLogService
{
    private readonly IPiLogRepository             _repo;
    private readonly ILogger<PiLogService>        _logger;

    public PiLogService(IPiLogRepository repo, ILogger<PiLogService> logger)
    {
        _repo   = repo;
        _logger = logger;
    }

    public async Task LogAsync(
        long    piId,
        string  actionType,
        object  data,
        long    changedBy,
        string? ipAddress,
        string? userAgent)
    {
        try
        {
            var snapshot = JsonConvert.SerializeObject(data, Formatting.None);

            await _repo.AddAsync(new PiLog
            {
                PI_Id        = piId,
                ActionType   = actionType,
                DataSnapshot = snapshot,
                ChangedBy    = changedBy,
                ChangedAt    = DateTime.UtcNow,
                IPAddress    = ipAddress,
                UserAgent    = userAgent,
            });
        }
        catch (Exception ex)
        {
            // Audit logging must never interrupt the main business flow.
            _logger.LogError(ex,
                "PI audit log failed for PI_Id={PiId}, Action={Action}",
                piId, actionType);
        }
    }
}
