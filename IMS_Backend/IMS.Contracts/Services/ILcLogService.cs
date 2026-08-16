using IMS.Contracts.DTOs;

namespace Boilerplate.Contracts.Services;

public interface ILcLogService
{
    Task<LcAuditLogResponse> GetLcAuditLogAsync(long lcId);
}
