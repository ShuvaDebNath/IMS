using IMS.Contracts.DTOs;

namespace Boilerplate.Contracts.Repositories;

public interface IPiLogRepository
{
    Task AddAsync(PiLog log);
}
