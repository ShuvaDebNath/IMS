using System.Globalization;
using System.Text.Json;

namespace Boilerplate.Service.Audit;

/// <summary>
/// Shared JSON snapshot parsing and diff helpers for PI / LC audit services.
/// </summary>
public static class AuditSnapshotHelper
{
    public static Dictionary<string, string> ParseSnapshot(string? json)
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

    public static List<Dictionary<string, string>> ParseDetailsSnapshot(string? json)
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

    public static string NormaliseJsonValue(JsonElement el) => el.ValueKind switch
    {
        JsonValueKind.Null      => "",
        JsonValueKind.Undefined => "",
        JsonValueKind.String    => el.GetString()?.Trim() ?? "",
        JsonValueKind.Array     => el.GetArrayLength() == 0 ? "" : el.GetRawText(),
        JsonValueKind.Object    => !el.EnumerateObject().Any() ? "" : el.GetRawText(),
        _                       => el.GetRawText()
    };

    public static bool IsMeaningfulValue(string? val)
    {
        if (string.IsNullOrWhiteSpace(val)) return false;
        var t = val.Trim();
        return t != "[]" && t != "{}";
    }

    /// <summary>
    /// Compares two flat snapshots and yields changed fields.
    /// </summary>
    public static IEnumerable<(string Column, string OldValue, string NewValue)> DiffFlatSnapshots(
        Dictionary<string, string> previous,
        Dictionary<string, string> current,
        IEnumerable<string> skipFields)
    {
        var skip = new HashSet<string>(skipFields, StringComparer.OrdinalIgnoreCase);

        var keys = current.Keys
            .Union(previous.Keys)
            .Where(k => !skip.Contains(k));

        foreach (var key in keys)
        {
            previous.TryGetValue(key, out var oldVal);
            current.TryGetValue(key, out var newVal);

            oldVal ??= "";
            newVal ??= "";

            if (string.Equals(oldVal, newVal, StringComparison.Ordinal)) continue;
            if (!IsMeaningfulValue(oldVal) || !IsMeaningfulValue(newVal)) continue;

            yield return (key, oldVal, newVal);
        }
    }

    public static string ResolveDelimitedLookup(
        string raw,
        Dictionary<string, string> map,
        char separator = ',')
    {
        if (string.IsNullOrWhiteSpace(raw)) return raw;

        var parts = raw.Split(separator, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (parts.Length == 0) return raw;

        var resolved = parts.Select(part =>
            map.TryGetValue(part, out var display) ? display : part);

        return string.Join(", ", resolved);
    }
}
