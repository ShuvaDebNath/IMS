using Boilerplate.Contracts.DTOs;
using Boilerplate.Contracts.Responses;
using System.Data;

namespace Boilerplate.Contracts.Services;

public interface IGoodsDeliveryService
{
    Task<Messages> Save(List<PI_Ledger> model,string AuthUserId);
}
