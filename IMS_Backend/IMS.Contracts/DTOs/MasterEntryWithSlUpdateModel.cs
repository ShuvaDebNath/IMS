namespace Boilerplate.Contracts;

public class MasterEntryWithSlUpdateModel
{
    public string? TableName { get; set; }
    public string? ColumnNames { get; set; }
    public object? QueryParams { get; set; }
    public object? WhereParams { get; set; }
    public string? UpdateTableName { get; set; }
    public string? UpdateColumnName { get; set; }
}