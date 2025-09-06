using Boilerplate.Contracts;
using System.Threading.Tasks;

namespace IMS.Contracts.Repositories
{
    public interface IDoubleMasterEntryPostInsertAction
    {
        Task ExecuteAsync(DoubleMasterEntryModel model, string authUserName);
    }
}