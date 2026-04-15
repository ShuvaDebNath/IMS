using Boilerplate.Contracts;
using Boilerplate.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace Boilerplate.API.Controllers;

/// <summary>
/// PI-specific controller that wraps DoubleMasterEntryService and
/// adds audit logging on every CREATE and UPDATE.
/// The generic DoubleMasterEntryController remains untouched.
/// </summary>
[Route("api/[controller]")]
[ApiController]
public class ProformaInvoiceController : BaseApiController
{
    private readonly IDoubleMasterEntryService _masterEntryService;
    private readonly IPiLogService             _piLogService;

    public ProformaInvoiceController(
        IDoubleMasterEntryService masterEntryService,
        IPiLogService             piLogService)
    {
        _masterEntryService = masterEntryService;
        _piLogService       = piLogService;
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    [HttpPost(nameof(Save))]
    public async Task<IActionResult> Save([FromBody] DoubleMasterEntryModel model)
    {
        try
        {
            // InsertGetId returns the new PI_Master_Id (int > 0 on success).
            var newPiId = await _masterEntryService.InsertGetId(model, AuthUserName);

            if (newPiId > 0)
            {
                await _piLogService.LogAsync(
                    piId:       newPiId,
                    actionType: "CREATE",
                    data:       model,
                    changedBy:  ParseUserId(AuthUserId),
                    ipAddress:  GetClientIp(),
                    userAgent:  GetUserAgent());
            }

            return Ok(newPiId);
        }
        catch (Exception ex)
        {
            throw new Exception(ex.ToString());
        }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    [HttpPost(nameof(Update))]
    public async Task<IActionResult> Update([FromBody] DoubleMasterEntryModel model)
    {
        try
        {
            var result = await _masterEntryService.UpdateData(model, AuthUserName);

            if (result.Status)
            {
                var piId = ExtractPiId(model);
                if (piId > 0)
                {
                    await _piLogService.LogAsync(
                        piId:       piId,
                        actionType: "UPDATE",
                        data:       model,
                        changedBy:  ParseUserId(AuthUserId),
                        ipAddress:  GetClientIp(),
                        userAgent:  GetUserAgent());
                }
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            throw new Exception(ex.ToString());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private string? GetClientIp()
    {
        var forwarded = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        return string.IsNullOrWhiteSpace(forwarded)
            ? HttpContext.Connection.RemoteIpAddress?.ToString()
            : forwarded.Split(',')[0].Trim();
    }

    private string? GetUserAgent() =>
        HttpContext.Request.Headers["User-Agent"].FirstOrDefault();

    private static long ParseUserId(string? userId) =>
        long.TryParse(userId, out var id) ? id : 0;

    /// <summary>
    /// Extracts PI_Master_Id from the WhereParams or Data of the model.
    /// WhereParams is expected to be a JSON object with a "PI_Master_Id" field.
    /// </summary>
    private static long ExtractPiId(DoubleMasterEntryModel model)
    {
        try
        {
            if (model.WhereParams is null) return 0;

            var json = Newtonsoft.Json.JsonConvert.SerializeObject(model.WhereParams);
            var dict = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, object>>(json);

            if (dict != null && dict.TryGetValue("PI_Master_Id", out var val))
                return Convert.ToInt64(val);
        }
        catch { /* non-critical — log will simply be skipped */ }

        return 0;
    }
}
