using Boilerplate.Contracts.Repositories;
using Boilerplate.Contracts.Services;
using IMS.Contracts.DTOs;
using System.Text.Json;

namespace Boilerplate.Service.Services;

public class PiLogService : IPiLogService
{
    private readonly IPiLogRepository _repo;

    // Master fields that add no human-readable diff value
    private static readonly HashSet<string> _skipMasterFields =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "PI_Master_ID", "IsMPI", "LC_ID", "CR_ID", "SalesContractId",
            "Marketing_Concern_ID", "GrandTotalAmount_LC", "GrandTotalAmount_Cash",
            "GrandTotalAmount_Both", "User_ID", "Superior_ID", "LastUpdateDate",
            "CreatedDate", "PrimaryKey"
        };

    // Detail-row fields that add no human-readable diff value
    private static readonly HashSet<string> _skipDetailFields =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "PI_Detail_ID", "PI_Master_ID", "Serial_No", "SerialNo",
            "IsActive", "CreatedDate", "LastUpdateDate"
        };

    public PiLogService(IPiLogRepository repo) => _repo = repo;

    // ── WRITE ─────────────────────────────────────────────────────────────────

    public async Task LogAsync(
        long    piId,
        string  actionType,
        object? masterData,
        object? detailsData,
        long    changedBy,
        string? changedByName,
        string? ipAddress,
        string? userAgent)
    {
        try
        {
            await _repo.AddAsync(new PiLog
            {
                PI_Id           = piId,
                ActionType      = actionType,
                MasterDataJson  = ToJsonString(masterData,  "{}"),
                DetailsDataJson = ToJsonString(detailsData, "[]"),
                ChangedBy       = changedBy,
                ChangedByName   = changedByName,
                ChangedAt       = DateTime.UtcNow,
                IPAddress       = ipAddress,
                UserAgent       = userAgent,
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[PiLogService] Failed to write log: {ex.Message}");
        }
    }

    // ── READ / DIFF ───────────────────────────────────────────────────────────

    public async Task<PiAuditLogResponse> GetAuditLogAsync(long piId)
    {
        var logs   = await _repo.GetByPiIdAsync(piId);
        var piInfo = await _repo.GetPiInfoAsync(piId);

        var response = new PiAuditLogResponse
        {
            PiNo       = piInfo.PiNo,
            ClientName = piInfo.ClientName
        };

        if (logs.Count == 0) return response;

        var entries = new List<PiAuditLogEntry>();

        Dictionary<string, string>?             prevMaster  = null;
        List<Dictionary<string, string>>?        prevDetails = null;

        foreach (var log in logs)
        {
            var displayUser = !string.IsNullOrWhiteSpace(log.ChangedByName)
                ? log.ChangedByName
                : log.ChangedBy.ToString();

            var curMaster  = ParseSnapshot(log.MasterDataJson);
            var curDetails = ParseDetailsSnapshot(log.DetailsDataJson);

            // Keep searching for a meaningful PINo across all logs until one is found.
            // CREATE logs often store [] for unfilled fields, so we must not stop at "[]".
            if (!IsMeaningfulValue(response.PiNo))
            {
                if (curMaster.TryGetValue("PINo", out var v) && IsMeaningfulValue(v))
                    response.PiNo = v;
            }

            if (log.ActionType == "CREATE" || prevMaster is null)
            {
                // Skip — creation events are not surfaced in the audit trail
            }
            else
            {
                // ── Master field-level diff ──────────────────────────────────
                var masterKeys = curMaster.Keys
                    .Union(prevMaster.Keys)
                    .Where(k => !_skipMasterFields.Contains(k));

                foreach (var key in masterKeys)
                {
                    prevMaster.TryGetValue(key, out var oldVal);
                    curMaster.TryGetValue(key,  out var newVal);

                    oldVal ??= "";
                    newVal ??= "";

                    if (string.Equals(oldVal, newVal, StringComparison.Ordinal)) continue;

                    // Only surface the change when both sides carry a real value
                    if (!IsMeaningfulValue(oldVal) || !IsMeaningfulValue(newVal)) continue;

                    entries.Add(new PiAuditLogEntry
                    {
                        EventType     = "Modified",
                        ColumnName    = key,
                        OriginalValue = oldVal,
                        NewValue      = newVal,
                        ChangedBy     = displayUser,
                        ChangedDate   = log.ChangedAt
                    });
                }

                // ── Detail row diff ──────────────────────────────────────────
                if (prevDetails is not null)
                {
                    var detailDiffs = DiffDetails(
                        prevDetails, curDetails, displayUser, log.ChangedAt);

                    entries.AddRange(detailDiffs);
                }
            }

            prevMaster  = curMaster;
            prevDetails = curDetails;
        }

        // Newest changes shown first
        response.Logs = entries.OrderByDescending(e => e.ChangedDate).ToList();
        return response;
    }

    // ── DETAIL DIFF ───────────────────────────────────────────────────────────

    /// <summary>
    /// Compares two detail-row snapshots (arrays of objects) positionally.
    /// Emits Modified, Insert, or Deleted entries for each changed field / row.
    /// </summary>
    private static List<PiAuditLogEntry> DiffDetails(
        List<Dictionary<string, string>> prev,
        List<Dictionary<string, string>> curr,
        string changedBy,
        DateTime changedAt)
    {
        var result = new List<PiAuditLogEntry>();
        var maxLen = Math.Max(prev.Count, curr.Count);

        for (int i = 0; i < maxLen; i++)
        {
            var label = $"Item[{i + 1}]";

            if (i >= curr.Count)
            {
                // Row removed
                result.Add(new PiAuditLogEntry
                {
                    EventType     = "Deleted",
                    ColumnName    = label,
                    OriginalValue = "Row existed",
                    NewValue      = "",
                    ChangedBy     = changedBy,
                    ChangedDate   = changedAt
                });
                continue;
            }

            if (i >= prev.Count)
            {
                // New row — skip, not surfaced in the audit trail
                continue;
            }

            // Field-level diff for same-position row
            var prevRow = prev[i];
            var currRow = curr[i];

            var allKeys = currRow.Keys
                .Union(prevRow.Keys)
                .Where(k => !_skipDetailFields.Contains(k));

            foreach (var key in allKeys)
            {
                prevRow.TryGetValue(key, out var oldVal);
                currRow.TryGetValue(key, out var newVal);

                oldVal ??= "";
                newVal ??= "";

                if (string.Equals(oldVal, newVal, StringComparison.Ordinal)) continue;

                // Only surface the change when both sides carry a real value
                if (!IsMeaningfulValue(oldVal) || !IsMeaningfulValue(newVal)) continue;

                result.Add(new PiAuditLogEntry
                {
                    EventType     = "Modified",
                    ColumnName    = $"{label} → {key}",
                    OriginalValue = oldVal,
                    NewValue      = newVal,
                    ChangedBy     = changedBy,
                    ChangedDate   = changedAt
                });
            }
        }

        return result;
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Safely converts an object to a JSON string.
    /// Handles <see cref="JsonElement"/> produced by System.Text.Json deserialisation
    /// of <c>object</c>-typed DTO properties.
    /// </summary>
    private static string ToJsonString(object? value, string fallback)
    {
        if (value is null) return fallback;

        if (value is JsonElement je)
        {
            return je.ValueKind is JsonValueKind.Null or JsonValueKind.Undefined
                ? fallback
                : je.GetRawText();
        }

        try
        {
            var json = JsonSerializer.Serialize(value);
            return string.IsNullOrWhiteSpace(json) ? fallback : json;
        }
        catch
        {
            return fallback;
        }
    }

    /// <summary>Parses a MasterDataJson blob into a flat string → string dictionary.</summary>
    private static Dictionary<string, string> ParseSnapshot(string? json)
    {
        var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        if (string.IsNullOrWhiteSpace(json) || json == "{}") return result;

        try
        {
            var doc = JsonDocument.Parse(json);
            foreach (var prop in doc.RootElement.EnumerateObject())
                result[prop.Name] = NormaliseJsonValue(prop.Value);
        }
        catch { }

        return result;
    }

    /// <summary>Parses a DetailsDataJson blob into a list of flat string → string dictionaries.</summary>
    private static List<Dictionary<string, string>> ParseDetailsSnapshot(string? json)
    {
        var result = new List<Dictionary<string, string>>();
        if (string.IsNullOrWhiteSpace(json) || json == "[]") return result;

        try
        {
            var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind != JsonValueKind.Array) return result;

            foreach (var item in doc.RootElement.EnumerateArray())
            {
                var row = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                foreach (var prop in item.EnumerateObject())
                    row[prop.Name] = NormaliseJsonValue(prop.Value);
                result.Add(row);
            }
        }
        catch { }

        return result;
    }

    /// <summary>
    /// Converts a single <see cref="JsonElement"/> to a display string.
    /// Empty arrays <c>[]</c> and empty objects <c>{}</c> produced by Angular form
    /// controls that were never filled in are normalised to <c>""</c> so they are
    /// treated as "no value" throughout the diff pipeline.
    /// </summary>
    private static string NormaliseJsonValue(JsonElement el) => el.ValueKind switch
    {
        JsonValueKind.Null      => "",
        JsonValueKind.Undefined => "",
        JsonValueKind.String    => el.GetString()?.Trim() ?? "",
        JsonValueKind.Array     => el.GetArrayLength() == 0 ? "" : el.GetRawText(),
        JsonValueKind.Object    => !el.EnumerateObject().Any() ? "" : el.GetRawText(),
        _                       => el.GetRawText()
    };

    /// <summary>
    /// Returns true when a snapshot value is genuinely meaningful — not empty,
    /// not whitespace, not a bare empty-array/object literal.
    /// Used as the single gate before emitting any diff entry.
    /// </summary>
    private static bool IsMeaningfulValue(string? val)
    {
        if (string.IsNullOrWhiteSpace(val)) return false;
        var t = val.Trim();
        return t != "[]" && t != "{}";
    }
}
