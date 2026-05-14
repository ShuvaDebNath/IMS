using Boilerplate.Contracts;
using Boilerplate.Contracts.DTOs;
using Boilerplate.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Contracts.Repositories
{
    public interface IGoodsDeliveryRepository
    {
        Task<bool> Save(List<PI_Ledger> model, string AuthUserId, string AuthUserName);

    }
}
