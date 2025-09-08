using Boilerplate.Contracts;
using Boilerplate.Contracts.Services;
using IMS.Contracts.Repositories;
using System.Threading.Tasks;

namespace Boilerplate.Repository.Repositories
{
    public class UpdateRequisitionMasterAction : IDoubleMasterEntryPostInsertAction
    {
        private readonly IMasterEntryService _masterEntryService;

        public UpdateRequisitionMasterAction(IMasterEntryService masterEntryService)
        {
            _masterEntryService = masterEntryService;
        }

        public Task ExecuteAsync(DoubleMasterEntryModel model, string authUserName)
        {
            var referenceUpdateModel = new MasterEntryModel
            {
                TableName = "tbl_rm_requisition_master",
                WhereParams = model.WhereParams,
                QueryParams = Newtonsoft.Json.JsonConvert.SerializeObject(new { Status = model.Status.Trim() })
            };

            _masterEntryService.Update(referenceUpdateModel, authUserName);
            return Task.CompletedTask;
        }
    }
}