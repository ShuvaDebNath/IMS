using IMS.Contracts.DTOs;
using System.Data;
using System.Globalization;

namespace Boilerplate.Service.Audit;

/// <summary>
/// In-memory FK resolver built once from <c>usp_ProformaInvoice_GetInitialData</c>.
/// </summary>
public sealed class PiAuditLookupCache
{
    private readonly Dictionary<string, Dictionary<string, string>> _lookups;
    private readonly Dictionary<string, string> _displayNames;

    private PiAuditLookupCache(
        Dictionary<string, Dictionary<string, string>> lookups,
        Dictionary<string, string> displayNames)
    {
        _lookups = lookups;
        _displayNames = displayNames;
    }

    public static PiAuditLookupCache FromDataSet(
        DataSet? dataSet,
        IReadOnlyList<PiAuditLookupMapping>? mappings = null,
        IReadOnlyDictionary<string, string>? extraDisplayNames = null)
    {
        var lookups = new Dictionary<string, Dictionary<string, string>>(StringComparer.OrdinalIgnoreCase);
        var displayNames = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        mappings ??= PiAuditLookupRegistry.Mappings;

        if (extraDisplayNames is not null)
        {
            foreach (var pair in extraDisplayNames)
                displayNames[pair.Key] = pair.Value;
        }

        if (dataSet is null || dataSet.Tables.Count == 0)
            return new PiAuditLookupCache(lookups, displayNames);

        foreach (var mapping in mappings)
        {
            if (!lookups.ContainsKey(mapping.AuditColumn))
                lookups[mapping.AuditColumn] = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            if (!string.IsNullOrWhiteSpace(mapping.DisplayName))
                displayNames[mapping.AuditColumn] = mapping.DisplayName!;

            foreach (var tableIndex in mapping.TableIndices)
            {
                if (tableIndex < 0 || tableIndex >= dataSet.Tables.Count)
                    continue;

                MergeTable(
                    dataSet.Tables[tableIndex],
                    mapping.IdColumn,
                    mapping.DisplayColumn,
                    lookups[mapping.AuditColumn]);
            }
        }

        if (extraDisplayNames is not null)
        {
            foreach (var pair in extraDisplayNames)
                displayNames[pair.Key] = pair.Value;
        }

        return new PiAuditLookupCache(lookups, displayNames);
    }

    public void Merge(DataSet? dataSet, IReadOnlyList<PiAuditLookupMapping> mappings)
    {
        if (dataSet is null || dataSet.Tables.Count == 0)
            return;

        foreach (var mapping in mappings)
        {
            if (!_lookups.ContainsKey(mapping.AuditColumn))
                _lookups[mapping.AuditColumn] = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            if (!string.IsNullOrWhiteSpace(mapping.DisplayName))
                _displayNames[mapping.AuditColumn] = mapping.DisplayName!;

            foreach (var tableIndex in mapping.TableIndices)
            {
                if (tableIndex < 0 || tableIndex >= dataSet.Tables.Count)
                    continue;

                MergeTable(
                    dataSet.Tables[tableIndex],
                    mapping.IdColumn,
                    mapping.DisplayColumn,
                    _lookups[mapping.AuditColumn]);
            }
        }
    }

    public void AddLookup(string auditColumn, Dictionary<string, string> values)
    {
        if (string.IsNullOrWhiteSpace(auditColumn) || values.Count == 0)
            return;

        if (!_lookups.TryGetValue(auditColumn, out var existing))
        {
            _lookups[auditColumn] = new Dictionary<string, string>(values, StringComparer.OrdinalIgnoreCase);
            return;
        }

        foreach (var pair in values)
            existing[pair.Key] = pair.Value;
    }

    public PiAuditLogEntry Enrich(PiAuditLogEntry entry) =>
        EnrichEntry(entry, (column, original, updated) =>
        {
            entry.ColumnName    = column;
            entry.OriginalValue = original;
            entry.NewValue      = updated;
            return entry;
        });

    public LcAuditLogEntry Enrich(LcAuditLogEntry entry) =>
        EnrichEntry(entry, (column, original, updated) =>
        {
            entry.ColumnName    = column;
            entry.OriginalValue = original;
            entry.NewValue      = updated;
            return entry;
        });

    private T EnrichEntry<T>(T entry, Func<string, string, string, T> apply)
    {
        var columnNameProp = typeof(T).GetProperty(nameof(PiAuditLogEntry.ColumnName))!;
        var originalProp   = typeof(T).GetProperty(nameof(PiAuditLogEntry.OriginalValue))!;
        var newProp        = typeof(T).GetProperty(nameof(PiAuditLogEntry.NewValue))!;

        var rawColumn = columnNameProp.GetValue(entry)?.ToString() ?? string.Empty;
        var (auditColumn, prefix) = ParseAuditColumn(rawColumn);

        var heading = prefix is null
            ? ResolveColumnHeading(auditColumn)
            : $"{prefix} → {ResolveColumnHeading(auditColumn)}";

        var original = originalProp.GetValue(entry)?.ToString() ?? string.Empty;
        var updated  = newProp.GetValue(entry)?.ToString() ?? string.Empty;

        if (_lookups.TryGetValue(auditColumn, out var map))
        {
            original = ResolveValue(map, original);
            updated  = ResolveValue(map, updated);

            if (auditColumn.Equals("PI_No", StringComparison.OrdinalIgnoreCase))
            {
                original = AuditSnapshotHelper.ResolveDelimitedLookup(original, map);
                updated  = AuditSnapshotHelper.ResolveDelimitedLookup(updated, map);
            }
        }

        return apply(heading, original, updated);
    }

    private static void MergeTable(
        DataTable table,
        string idColumn,
        string displayColumn,
        Dictionary<string, string> target)
    {
        if (!table.Columns.Contains(idColumn))
            return;

        var resolvedDisplayColumn = ResolveDisplayColumn(table, displayColumn);
        if (resolvedDisplayColumn is null)
            return;

        foreach (DataRow row in table.Rows)
        {
            var id = NormaliseKey(row[idColumn]);
            if (string.IsNullOrEmpty(id))
                continue;

            var display = Convert.ToString(row[resolvedDisplayColumn], CultureInfo.InvariantCulture)?.Trim();
            if (string.IsNullOrEmpty(display))
                continue;

            target[id] = display;
        }
    }

    private static string? ResolveDisplayColumn(DataTable table, string displayColumn)
    {
        if (table.Columns.Contains(displayColumn))
            return displayColumn;

        string[] fallbacks = displayColumn.Equals("BankInfo", StringComparison.OrdinalIgnoreCase)
            ? ["BankName"]
            : displayColumn.Equals("BankName", StringComparison.OrdinalIgnoreCase)
                ? ["BankInfo"]
                : [];

        foreach (var fallback in fallbacks)
        {
            if (table.Columns.Contains(fallback))
                return fallback;
        }

        return null;
    }

    private static (string AuditColumn, string? Prefix) ParseAuditColumn(string columnName)
    {
        const string separator = " → ";
        var idx = columnName.IndexOf(separator, StringComparison.Ordinal);
        if (idx < 0)
            return (columnName.Trim(), null);

        return (columnName[(idx + separator.Length)..].Trim(), columnName[..idx].Trim());
    }

    private string ResolveColumnHeading(string auditColumn)
    {
        if (_displayNames.TryGetValue(auditColumn, out var custom))
            return custom;

        return FormatColumnHeading(auditColumn);
    }

    private static string FormatColumnHeading(string column)
    {
        var name = column;
        if (name.EndsWith("_ID", StringComparison.OrdinalIgnoreCase))
            name = name[..^3];

        return name.Replace('_', ' ');
    }

    private static string ResolveValue(Dictionary<string, string> map, string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return raw;

        var key = NormaliseKey(raw);
        return map.TryGetValue(key, out var display) ? display : raw;
    }

    private static string NormaliseKey(object? value)
    {
        if (value is null || value == DBNull.Value)
            return string.Empty;

        if (value is IFormattable formattable && value is not string)
        {
            if (value is decimal or double or float)
                return formattable.ToString(null, CultureInfo.InvariantCulture)?.Trim() ?? string.Empty;

            if (value is int or long or short or byte)
                return Convert.ToInt64(value, CultureInfo.InvariantCulture)
                    .ToString(CultureInfo.InvariantCulture);
        }

        var text = Convert.ToString(value, CultureInfo.InvariantCulture)?.Trim() ?? string.Empty;

        if (decimal.TryParse(text, NumberStyles.Number, CultureInfo.InvariantCulture, out var dec)
            && dec == Math.Truncate(dec))
            return ((long)dec).ToString(CultureInfo.InvariantCulture);

        return text;
    }
}
