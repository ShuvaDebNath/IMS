using Boilerplate.Contracts.Services;
using IMS.Contracts.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace IMS.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class LcAuditController : ControllerBase
{
    private readonly ILcLogService _lcLogService;

    public LcAuditController(ILcLogService lcLogService)
    {
        _lcLogService = lcLogService;
    }

    [HttpGet("AuditLog/{lcId:long}")]
    public async Task<IActionResult> GetAuditLog(long lcId)
    {
        try
        {
            var result = await _lcLogService.GetLcAuditLogAsync(lcId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
