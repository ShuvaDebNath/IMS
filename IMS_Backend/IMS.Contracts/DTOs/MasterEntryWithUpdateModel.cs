namespace Boilerplate.Contracts;

public class MasterEntryWithUpdateModel:MasterEntryModel
{
    public string? UpdateTableName { get; set; }
    public object? UpdateColumnName { get; set; }
}