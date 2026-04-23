using IMS.Contracts.DTOs;

namespace Boilerplate.Contracts.Services;

public interface IPiLogService
{
    /// <summary>
    /// Persists a structured audit log for a PI CREATE or UPDATE operation.
    /// Failures are swallowed so logging never interrupts the main PI flow.
    /// </summary>
    Task LogAsync(
        long    piId,
        string  actionType,
        object? masterData,
        object? detailsData,
        long    changedBy,
        string? changedByName,
        string? ipAddress,
        string? userAgent);

    /// <summary>
    /// Returns a field-level diff audit trail for a given PI.
    /// </summary>
    Task<PiAuditLogResponse> GetAuditLogAsync(long piId);
}
