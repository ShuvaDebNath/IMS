using Boilerplate.Contracts.Repositories;
using Boilerplate.Contracts.Services;
using IMS.Contracts.DTOs;

namespace Boilerplate.Service.Services;

public class BeneficiaryService : IBeneficiaryService
{
    private readonly IBeneficiaryRepository _repo;

    public BeneficiaryService(IBeneficiaryRepository repo) => _repo = repo;

    public Task<BeneficiaryDetailDto?> GetByIdAsync(int id)            => _repo.GetByIdAsync(id);
    public Task<int>                   SaveAsync(BeneficiaryFormDto m)  => _repo.SaveAsync(m);
    public Task<bool>                  UpdateAsync(BeneficiaryFormDto m) => _repo.UpdateAsync(m);
}
