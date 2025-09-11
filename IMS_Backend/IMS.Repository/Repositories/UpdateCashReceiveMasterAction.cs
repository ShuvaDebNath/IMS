using Boilerplate.Contracts;
using Boilerplate.Contracts.Services;
using IMS.Contracts.Repositories;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;

namespace Boilerplate.Repository.Repositories
{
    public class UpdateCashReceiveMasterAction : IDoubleMasterEntryPostInsertAction
    {
        private readonly IMasterEntryService _masterEntryService;

        public UpdateCashReceiveMasterAction(IMasterEntryService masterEntryService)
        {
            _masterEntryService = masterEntryService;
        }

        public Task ExecuteAsync(DoubleMasterEntryModel model, string authUserName)
        {
            JObject obj = JObject.Parse(model.Data.ToString());
            string PrimaryKey = (string)obj["PrimaryKey"];
            var referenceUpdateModel = new MasterEntryModel
            {
                TableName = "tbl_PI_Master",
                WhereParams = model.WhereParams,
                QueryParams = Newtonsoft.Json.JsonConvert.SerializeObject(new { CR_ID = PrimaryKey.Trim() })
            };

            _masterEntryService.Update(referenceUpdateModel, authUserName);
            return Task.CompletedTask;
        }
    }
}