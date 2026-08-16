namespace Boilerplate.Service.Audit;

/// <summary>
/// Maps an audit-log column (FK field name) to one or more lookup tables
/// returned by <c>usp_ProformaInvoice_GetInitialData</c>.
/// Register new FK fields here only — no changes inside <see cref="PiLogService"/>.
/// </summary>
public sealed class PiAuditLookupMapping
{
    /// <summary>Audit JSON property name, e.g. <c>Country_Of_Origin_ID</c>.</summary>
    public required string AuditColumn { get; init; }

    /// <summary>Primary-key column inside the lookup table.</summary>
    public required string IdColumn { get; init; }

    /// <summary>Human-readable column inside the lookup table.</summary>
    public required string DisplayColumn { get; init; }

    /// <summary>
    /// Zero-based <see cref="System.Data.DataSet"/> table indices
    /// (Tables1 = 0, Tables2 = 1, …). Multiple indices are merged (LC + Cash shipper, etc.).
    /// </summary>
    public required int[] TableIndices { get; init; }

    /// <summary>Optional override for the audit column heading.</summary>
    public string? DisplayName { get; init; }
}
