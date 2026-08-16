using IMS.Contracts.DTOs;

namespace Boilerplate.Contracts.Repositories;

public interface ILcLogRepository
{
    Task<List<LcLog>> GetByLcIdAsync(long lcId);
    Task<(string LcNo, string ConsigneeName)> GetLcInfoAsync(long lcId);
    Task<Dictionary<string, string>> GetPiNoLookupAsync();
}
