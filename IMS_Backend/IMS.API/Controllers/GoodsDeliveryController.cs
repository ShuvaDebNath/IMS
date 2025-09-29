using Boilerplate.Contracts;
using Boilerplate.Contracts.DTOs;
using Boilerplate.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace Boilerplate.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GoodsDeliveryController : BaseApiController
    {
        public readonly IGoodsDeliveryService _goodsDelivery;
        public GoodsDeliveryController(IGoodsDeliveryService goodsDelivery)
        {
            _goodsDelivery = goodsDelivery;
        }

        [HttpPost(nameof(Insert))]
        public async Task<IActionResult> Insert([FromBody] List<PI_Ledger> item)
        {
            try
            {
                return Ok(await _goodsDelivery.Save(item,AuthUserId));
            }
            catch (Exception ex)
            {
                throw new Exception(ex.ToString());
            }
        }
        
    }
}
