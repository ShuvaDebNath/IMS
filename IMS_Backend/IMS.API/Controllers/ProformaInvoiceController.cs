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
                    piId:          newPiId,
                    actionType:    "CREATE",
                    masterData:    model.Data,
                    detailsData:   model.DetailsData,
                    changedBy:     ParseUserId(AuthUserId),
                    changedByName: AuthUserName,
                    ipAddress:     GetClientIp(),
                    userAgent:     GetUserAgent());
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

                string? strWhereParams = Convert.ToString(model.WhereParams);
                var whereParams = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(strWhereParams);
                object? pkValue = null;
                foreach (var item in (IEnumerable<dynamic>)whereParams)
                {
                    if (item.Name.ToLower() == model.ColumnNamePrimary?.ToLower())
                    {
                        pkValue = item.Value;
                        break;
                    }
                }

                long piId = 0;

                if (pkValue != null && long.TryParse(pkValue.ToString(), out var parsedId))
                {
                    piId = parsedId;
                }

                if (piId > 0)
                {
                    await _piLogService.LogAsync(
                        piId:          piId,
                        actionType:    "UPDATE",
                        masterData:    model.Data,
                        detailsData:   model.DetailsData,
                        changedBy:     ParseUserId(AuthUserId),
                        changedByName: AuthUserName,
                        ipAddress:     GetClientIp(),
                        userAgent:     GetUserAgent());
                }
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            throw new Exception(ex.ToString());
        }
    }

    // ── AUDIT LOG ─────────────────────────────────────────────────────────────

    [HttpGet("AuditLog/{piId:long}")]
    public async Task<IActionResult> GetAuditLog(long piId)
    {
        try
        {
            var result = await _piLogService.GetAuditLogAsync(piId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
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

    private static long ExtractPiId(DoubleMasterEntryModel model)
    {
        if (model == null) return 0;

        // 1. Try WhereParams first
        var id = GetValueFromObject(model.WhereParams);
        if (id > 0) return id;

        // 2. Fallback to Data
        id = GetValueFromObject(model.Data);
        return id;
    }

    private static long GetValueFromObject(object source)
    {
        if (source == null) return 0;

        try
        {
            var prop = source.GetType()
                .GetProperties()
                .FirstOrDefault(p =>
                    string.Equals(p.Name, "PI_Master_ID", StringComparison.OrdinalIgnoreCase));

            if (prop == null) return 0;

            var value = prop.GetValue(source);

            if (value == null) return 0;

            // Handle different types safely
            if (value is long l) return l;
            if (value is int i) return i;
            if (long.TryParse(value.ToString(), out var result))
                return result;
        }
        catch (Exception ex)
        {
            // 👉 For logging system, NEVER silently ignore
            // Add your logger here
            // _logger.LogError(ex, "Failed to extract PI_Master_ID");
        }

        return 0;
    }
}
