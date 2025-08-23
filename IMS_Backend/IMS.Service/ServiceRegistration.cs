using Boilerplate.Contracts.Services;
using Boilerplate.Service.Services;
using Boilerplate.Service.ValidationHelpers;
using Microsoft.Extensions.DependencyInjection;

namespace Boilerplate.Service
{
    public class BusinessLogicServiceConfigurator
    {
        private const string CorsPolicyName = "CorsPolicy";
        private static readonly string[] AllowedMethods = ["GET", "POST", "UPDATE", "PUT", "DELETE"];

        public void AddBusinessLogicLayer(IServiceCollection services)
        {
            services.AddTransient<IAuthService, AuthService>();
            services.AddTransient<IUserService, UserService>();
            services.AddTransient<IMasterEntryService, MasterEntryService>();
            services.AddTransient<IDoubleMasterEntryService, DoubleMasterEntryService>();
            services.AddScoped<IGetDataService, GetDataService>();
            services.AddSingleton<ValidationHelper>();
            ConfigureCors(services);
        }

        private void ConfigureCors(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy(CorsPolicyName,
                    builder => builder.AllowAnyOrigin()
                    .WithMethods(AllowedMethods)
                    .AllowAnyHeader());
            });
        }
    }
}
