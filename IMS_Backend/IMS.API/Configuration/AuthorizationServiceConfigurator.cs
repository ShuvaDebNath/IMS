using Boilerplate.API.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace IMS.API.Configuration
{
    public class AuthorizationServiceConfigurator
    {
        public void ConfigureCustomeAuthorization(IServiceCollection services)
        {
            services.AddMvc(option =>
            {
                option.Filters.Add(new CustomAuthorizeAttribute());
                option.Filters.Add(typeof(CustomModelStateValidatorFilter));
                option.EnableEndpointRouting = false;
            });
        }
    }
}
