using Boilerplate.Contracts;
using Boilerplate.Contracts.Repositories;
using Boilerplate.Contracts.Services;
using Boilerplate.Service.Audit;
using IMS.Contracts.DTOs;

namespace Boilerplate.Service.Services;

public class LcLogService : ILcLogService
{
    private readonly ILcLogRepository _repo;
    private readonly IGetDataRepository _getDataRepository;

    private static readonly HashSet<string> _skipFields =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "LC_ID",
            "User_ID"
        };

    public LcLogService(ILcLogRepository repo, IGetDataRepository getDataRepository)
    {
        _repo = repo;
        _getDataRepository = getDataRepository;
    }

    public async Task<LcAuditLogResponse> GetLcAuditLogAsync(long lcId)
    {
        var logs        = await _repo.GetByLcIdAsync(lcId);
        var lcInfo      = await _repo.GetLcInfoAsync(lcId);
        var lookupCache = await LoadLookupCacheAsync();

        var response = new LcAuditLogResponse
        {
            LcNo          = lcInfo.LcNo,
            ConsigneeName = lcInfo.ConsigneeName
        };

        if (logs.Count == 0) return response;

        var entries = new List<LcAuditLogEntry>();

        foreach (var log in logs)
        {
            var displayUser = !string.IsNullOrWhiteSpace(log.ChangedByName)
                ? log.ChangedByName
                : log.ChangedBy.ToString();

            var newSnapshot = AuditSnapshotHelper.ParseSnapshot(log.NewDataJson);

            if (!AuditSnapshotHelper.IsMeaningfulValue(response.LcNo)
                && newSnapshot.TryGetValue("LC_No", out var lcNo)
                && AuditSnapshotHelper.IsMeaningfulValue(lcNo))
            {
                response.LcNo = lcNo;
            }

            if (!AuditSnapshotHelper.IsMeaningfulValue(response.ConsigneeName)
                && newSnapshot.TryGetValue("Consignee_Name", out var consignee)
                && AuditSnapshotHelper.IsMeaningfulValue(consignee))
            {
                response.ConsigneeName = consignee;
            }

            if (log.ActionType.Equals("CREATE", StringComparison.OrdinalIgnoreCase))
                continue;

            var oldSnapshot = AuditSnapshotHelper.ParseSnapshot(log.OldDataJson);

            foreach (var (column, oldVal, newVal) in AuditSnapshotHelper.DiffFlatSnapshots(
                oldSnapshot, newSnapshot, _skipFields))
            {
                entries.Add(lookupCache.Enrich(new LcAuditLogEntry
                {
                    EventType     = "Modified",
                    ColumnName    = column,
                    OriginalValue = oldVal,
                    NewValue      = newVal,
                    ChangedBy     = displayUser,
                    ChangedDate   = log.ChangedAt
                }));
            }
        }

        response.Logs = entries.OrderByDescending(e => e.ChangedDate).ToList();
        return response;
    }

    private async Task<PiAuditLookupCache> LoadLookupCacheAsync()
    {
        try
        {
            var model = new GetDataModel
            {
                ProcedureName = "usp_ProformaInvoice_GetInitialData",
                Parameters = Newtonsoft.Json.JsonConvert.SerializeObject(new
                {
                    userID      = 0,
                    roleID      = 0,
                    PaymentType = 1
                })
            };

            var dataSet    = await _getDataRepository.GetInitialData(model);
            var lookupCache = PiAuditLookupCache.FromDataSet(
                dataSet,
                LcAuditLookupRegistry.Mappings,
                LcAuditLookupRegistry.DisplayNames);

            var lcLookupModel = new GetDataModel
            {
                ProcedureName = "usp_LC_GetInitialData",
                Parameters    = "{}"
            };
            var lcDataSet = await _getDataRepository.GetInitialData(lcLookupModel);
            lookupCache.Merge(lcDataSet, LcAuditLookupRegistry.LcInitialDataMappings);

            var piLookup = await _repo.GetPiNoLookupAsync();
            lookupCache.AddLookup("PI_No", piLookup);

            return lookupCache;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[LcLogService] Lookup cache load failed: {ex.Message}");
            return PiAuditLookupCache.FromDataSet(
                null,
                LcAuditLookupRegistry.Mappings,
                LcAuditLookupRegistry.DisplayNames);
        }
    }
}
