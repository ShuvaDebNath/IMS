using Boilerplate.Contracts;
using Boilerplate.Entities.DBModels;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace Boilerplate.Service.ValidationHelpers;
public class ValidationHelper
{
    private readonly string _schemaFilePath;
    private readonly ValidationSchemaRoot _schemaCache;

    public ValidationHelper(IConfiguration configuration)
    {
        _schemaFilePath = configuration["ValidationSchema:FilePath"];
        if (string.IsNullOrEmpty(_schemaFilePath))
            throw new Exception("Validation schema file path is not configured in appsettings.json");
        if (!File.Exists(_schemaFilePath))
            throw new FileNotFoundException($"Validation schema file not found at {_schemaFilePath}");
        var schemaContent = File.ReadAllText(_schemaFilePath);
        _schemaCache = JsonConvert.DeserializeObject<ValidationSchemaRoot>(schemaContent) ?? new ValidationSchemaRoot();
    }

    public void ValidateModel(MasterEntryModel model, string schemaKey)
    {
        if (!_schemaCache.ValidationSchemas.TryGetValue(schemaKey, out var rules))
            throw new Exception($"No validation rules found for the entity: {schemaKey}");
        ValidateProperty(model.TableName, rules.TableName, "TableName");
        ValidateParameters(model.ColumnNames, rules.ColumnNames, "ColumnNames");
        ValidateParameters(model.QueryParams, rules.QueryParams, "QueryParams");
        ValidateParameters(model.WhereParams, rules.WhereParams, "WhereParams");
    }

    public void ValidateModelWithUpdateSl(MasterEntryWithSlUpdateModel model, string schemaKey)
    {
        if (!_schemaCache.ValidationSchemas.TryGetValue(schemaKey, out var rules))
            throw new Exception($"No validation rules found for the entity: {schemaKey}");
        ValidateProperty(model.TableName, rules.TableName, "TableName");
        ValidateParameters(model.ColumnNames, rules.ColumnNames, "ColumnNames");
        ValidateParameters(model.QueryParams, rules.QueryParams, "QueryParams");
        ValidateParameters(model.WhereParams, rules.WhereParams, "WhereParams");
    }

    private void ValidateProperty(object? columnNames1, Dictionary<string, PropertyRule>? columnNames2, string v)
    {
        throw new NotImplementedException();
    }

    private void ValidateProperty(string? propertyValue, PropertyRule? propertyRules, string propertyName)
    {
        if (propertyRules == null) return;
        if (propertyRules.Required && string.IsNullOrWhiteSpace(propertyValue))
            throw new ArgumentException($"{propertyName} is required.");
        if (propertyRules.MaxLength > 0 && propertyValue?.Length > propertyRules.MaxLength)
            throw new ArgumentException($"{propertyName} exceeds max length of {propertyRules.MaxLength}.");
        if (propertyRules.MaxCount > 0 && propertyValue?.Split(',').Length > propertyRules.MaxCount)
            throw new ArgumentException($"{propertyName} exceeds max count of {propertyRules.MaxCount}.");
    }

    private void ValidateParameters(object? parameters, Dictionary<string, PropertyRule>? paramRules, string paramType)
    {
        if (parameters == null || paramRules == null) return;
        var paramCollection = JsonConvert.DeserializeObject<Dictionary<string, object>>(parameters.ToString() ?? "{}") ?? new();
        if (!paramCollection.Any())
            throw new ArgumentException($"{paramType} is empty or invalid.");
        foreach (var param in paramCollection)
        {
            if (!paramRules.TryGetValue(param.Key, out var paramRule)) continue;
            var paramValue = param.Value?.ToString();
            if (paramRule.Required && string.IsNullOrWhiteSpace(paramValue))
                throw new ArgumentException($"{param.Key} in {paramType} is required.");
            if (paramRule.MaxLength > 0 && paramValue?.Length > paramRule.MaxLength)
                throw new ArgumentException($"{param.Key} in {paramType} exceeds max length of {paramRule.MaxLength}.");
        }
    }

    // Schema models
    public class ValidationSchemaRoot
    {
        public Dictionary<string, EntityRules> ValidationSchemas { get; set; } = new();
    }
    public class EntityRules
    {
        public PropertyRule? TableName { get; set; }
        public Dictionary<string, PropertyRule>? ColumnNames { get; set; }
        public Dictionary<string, PropertyRule>? QueryParams { get; set; }
        public Dictionary<string, PropertyRule>? WhereParams { get; set; }
    }
    public class PropertyRule
    {
        public bool Required { get; set; }
        public int MaxLength { get; set; }
        public int MaxCount { get; set; }
    }
}
