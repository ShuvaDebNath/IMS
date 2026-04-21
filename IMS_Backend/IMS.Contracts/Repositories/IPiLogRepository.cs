using IMS.Contracts.DTOs;

namespace Boilerplate.Contracts.Repositories;

public interface IPiLogRepository
{
    Task AddAsync(PiLog log);
    Task<List<PiLog>> GetByPiIdAsync(long piId);
    Task<(string PiNo, string ClientName)> GetPiInfoAsync(long piId);
}
