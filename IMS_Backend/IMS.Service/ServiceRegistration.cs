using Boilerplate.Contracts.Services;
using Boilerplate.Service.Services;
using Boilerplate.Service.ValidationHelpers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.SqlServer.Management.Dmf;

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
            services.AddScoped<IGoodsDeliveryService, GoodsDeliveryService>();
            services.AddScoped<IReportService, ReportService>();
            services.AddSingleton<ValidationHelper>();
            ConfigureCors(services);
        }

        private void ConfigureCors(IServiceCollection services)
        {

            services.AddCors(options =>
            {
                options.AddPolicy(CorsPolicyName,
                    builder => builder.WithOrigins(
                        "http://localhost:4200",
                        "https://localhost:4200"
                    )
                    .WithMethods(AllowedMethods)
                    .AllowAnyHeader()
                    .AllowCredentials());
            });
        }
    }
}
