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

    public static PiAuditLookupCache FromDataSet(DataSet? dataSet)
    {
        var lookups = new Dictionary<string, Dictionary<string, string>>(StringComparer.OrdinalIgnoreCase);
        var displayNames = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        if (dataSet is null || dataSet.Tables.Count == 0)
            return new PiAuditLookupCache(lookups, displayNames);

        foreach (var mapping in PiAuditLookupRegistry.Mappings)
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

        return new PiAuditLookupCache(lookups, displayNames);
    }

    public PiAuditLogEntry Enrich(PiAuditLogEntry entry)
    {
        var (auditColumn, prefix) = ParseAuditColumn(entry.ColumnName);

        entry.ColumnName = prefix is null
            ? ResolveColumnHeading(auditColumn)
            : $"{prefix} → {ResolveColumnHeading(auditColumn)}";

        if (_lookups.TryGetValue(auditColumn, out var map))
        {
            entry.OriginalValue = ResolveValue(map, entry.OriginalValue);
            entry.NewValue      = ResolveValue(map, entry.NewValue);
        }

        return entry;
    }

    private static void MergeTable(
        DataTable table,
        string idColumn,
        string displayColumn,
        Dictionary<string, string> target)
    {
        if (!table.Columns.Contains(idColumn) || !table.Columns.Contains(displayColumn))
            return;

        foreach (DataRow row in table.Rows)
        {
            var id = NormaliseKey(row[idColumn]);
            if (string.IsNullOrEmpty(id))
                continue;

            var display = Convert.ToString(row[displayColumn], CultureInfo.InvariantCulture)?.Trim();
            if (string.IsNullOrEmpty(display))
                continue;

            target[id] = display;
        }
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
