using IMS.Contracts.DTOs;

namespace Boilerplate.Contracts.Repositories;

public interface IBeneficiaryRepository
{
    /// <summary>Returns a single beneficiary with logo (as Base64 data-URI) or null if not found.</summary>
    Task<BeneficiaryDetailDto?> GetByIdAsync(int id);

    /// <summary>Inserts a new beneficiary record (with optional logo) and returns the new PK.</summary>
    Task<int> SaveAsync(BeneficiaryFormDto model);

    /// <summary>Updates an existing beneficiary record (text fields + optional logo).</summary>
    Task<bool> UpdateAsync(BeneficiaryFormDto model);
}
