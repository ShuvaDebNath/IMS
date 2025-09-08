using Boilerplate.Contracts;
using System.Collections.Generic;

namespace IMS.Contracts.Repositories
{
    public interface IDoubleMasterEntryPostInsertActionFactory
    {
        IEnumerable<IDoubleMasterEntryPostInsertAction> GetActions(DoubleMasterEntryModel model);
    }
}