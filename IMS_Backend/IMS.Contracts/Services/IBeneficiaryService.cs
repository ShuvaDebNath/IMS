using IMS.Contracts.DTOs;

namespace Boilerplate.Contracts.Services;

public interface IBeneficiaryService
{
    Task<BeneficiaryDetailDto?> GetByIdAsync(int id);
    Task<int>                   SaveAsync(BeneficiaryFormDto model);
    Task<bool>                  UpdateAsync(BeneficiaryFormDto model);
}
