namespace Boilerplate.Contracts.Services;

public interface IPiLogService
{
    /// <summary>
    /// Persists a full-data snapshot for a PI CREATE or UPDATE operation.
    /// Failures are swallowed so logging never breaks the main PI flow.
    /// </summary>
    Task LogAsync(
        long    piId,
        string  actionType,   // "CREATE" | "UPDATE"
        object  data,
        long    changedBy,
        string? ipAddress,
        string? userAgent);
}
