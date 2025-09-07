using Boilerplate.Contracts;
using IMS.Contracts.Repositories;
using System.Collections.Generic;
using System.Linq;

namespace Boilerplate.Repository.Repositories
{
    public class DoubleMasterEntryPostInsertActionFactory : IDoubleMasterEntryPostInsertActionFactory
    {
        private readonly IEnumerable<IDoubleMasterEntryPostInsertAction> _actions;

        public DoubleMasterEntryPostInsertActionFactory(IEnumerable<IDoubleMasterEntryPostInsertAction> actions)
        {
            _actions = actions;
        }

        public IEnumerable<IDoubleMasterEntryPostInsertAction> GetActions(DoubleMasterEntryModel model)
        {
            // Example: Only return UpdateRequisitionMasterAction for a specific table
            if (model.TableNameMaster == "tbl_rm_send_master")
            {
                return _actions.Where(a => a is UpdateRequisitionMasterAction);
            }
            return Enumerable.Empty<IDoubleMasterEntryPostInsertAction>();
        }
    }
}