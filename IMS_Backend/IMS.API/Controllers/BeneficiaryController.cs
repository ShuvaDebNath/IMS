using Boilerplate.Contracts.Services;
using IMS.Contracts.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Boilerplate.API.Controllers;

/// <summary>
/// Dedicated Beneficiary controller that handles logo (varbinary) upload via multipart/form-data.
/// All existing MasterEntry generic endpoints remain completely untouched.
/// </summary>
[Route("api/[controller]")]
[ApiController]
public class BeneficiaryController : BaseApiController
{
    private readonly IBeneficiaryService _beneficiaryService;

    private static readonly string[] _allowedMimeTypes =
        ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    private const long MaxFileSizeBytes = 2 * 1024 * 1024; // 2 MB

    public BeneficiaryController(IBeneficiaryService beneficiaryService)
    {
        _beneficiaryService = beneficiaryService;
    }

    // ── GET BY ID ─────────────────────────────────────────────────────────────

    [HttpGet("GetById/{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var data = await _beneficiaryService.GetByIdAsync(id);

            return data is not null
                ? Ok(new { status = true, data })
                : NotFound(new { status = false, message = "Beneficiary not found." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { status = false, message = ex.Message });
        }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    [HttpPost("Save")]
    public async Task<IActionResult> Save([FromForm] BeneficiaryFormDto model,
                                          IFormFile? logoImage)
    {
        try
        {
            model.LogoImage = await ReadLogoAsync(logoImage);

            var newId = await _beneficiaryService.SaveAsync(model);

            return newId > 0
                ? Ok(new { status = true, message = "Saved", data = newId })
                : Ok(new { status = false, message = "Save failed" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { status = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { status = false, message = ex.Message });
        }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    [HttpPut("Update")]
    public async Task<IActionResult> Update([FromForm] BeneficiaryFormDto model,
                                             IFormFile? logoImage)
    {
        try
        {
            if (model.Beneficiary_Account_ID is null or <= 0)
                return BadRequest(new { status = false, message = "Beneficiary_Account_ID is required for update." });

            model.LogoImage = await ReadLogoAsync(logoImage);

            var success = await _beneficiaryService.UpdateAsync(model);

            return Ok(new { status = success, message = success ? "Updated" : "Update failed" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { status = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { status = false, message = ex.Message });
        }
    }

    // ── HELPER ────────────────────────────────────────────────────────────────

    /// <summary>
    /// Validates file type + size then converts <see cref="IFormFile"/> → <c>byte[]</c>.
    /// Returns <c>null</c> when no file is provided (logo remains unchanged on update).
    /// </summary>
    private static async Task<byte[]?> ReadLogoAsync(IFormFile? file)
    {
        if (file is null || file.Length == 0) return null;

        if (!_allowedMimeTypes.Contains(file.ContentType.ToLower()))
            throw new ArgumentException("Only JPG, PNG, and WebP images are accepted.");

        if (file.Length > MaxFileSizeBytes)
            throw new ArgumentException("Logo image must be smaller than 2 MB.");

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        return ms.ToArray();
    }
}
