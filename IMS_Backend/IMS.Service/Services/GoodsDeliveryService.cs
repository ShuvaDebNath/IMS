using Boilerplate.Contracts;
using Boilerplate.Contracts.DTOs;
using Boilerplate.Contracts.Repositories;
using Boilerplate.Contracts.Responses;
using Boilerplate.Contracts.Services;
using Boilerplate.Entities.DBModels;
using Boilerplate.Entities.Helpers;
using Boilerplate.Repository.Repositories;
using Boilerplate.Service.ValidationHelpers;
using IMS.Contracts.Repositories;
using Microsoft.AspNetCore.Mvc.ViewFeatures.Internal;
using Microsoft.Extensions.Logging;
using System.Data;

namespace Boilerplate.Service.Services
{
    class GoodsDeliveryService : IGoodsDeliveryService
    {
        private readonly IGoodsDeliveryRepository goodsDeliveryRepository;
        private readonly ILogger<MasterEntryService> _logger;
        private readonly ValidationHelper _validationHelper;

        public GoodsDeliveryService(IGoodsDeliveryRepository goodsDeliveryRepository, ILogger<MasterEntryService> logger, ValidationHelper validationHelper)
        {
            this.goodsDeliveryRepository = goodsDeliveryRepository;
            _logger = logger;
            _validationHelper = validationHelper;
        }

        public async Task<Messages> Save(List<PI_Ledger> model, string AuthUserId)
        {
            try
            {
                if (!model.Where(x => x.Delivered > 0).ToList().Any())
                {
                    _logger.LogInformation($"Data Save Fail!");
                    return MessageType.SaveError(null);
                }

                var result = await goodsDeliveryRepository.Save(model, AuthUserId);

                if (result)
                {
                    _logger.LogInformation($"Data Save Success!");
                    return MessageType.SaveSuccess(model);
                }
                _logger.LogInformation($"Data Save Fail!");
                return MessageType.SaveError(null);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Validation failed: {ex.Message}");
                return MessageType.SaveError(ex.Message);
            }
            catch (Exception ex)
            {
                string innserMsg = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                _logger.LogError($"Source: {ex.Source}; Stack Trace: {ex.StackTrace}; Message: {ex.Message}; Inner Exception: {innserMsg};");
                throw;
            }
        }
    }
}
