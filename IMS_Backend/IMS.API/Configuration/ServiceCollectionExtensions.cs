using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace IMS.API.Configuration
{
    public class ServiceCollectionExtensions
    {
        public IServiceCollection AddJwtAuthentication(IServiceCollection services, JwtOptions jwtOptions, string scheme = "JwtBearer")
        {
            services.AddAuthentication(scheme)
                .AddJwtBearer(scheme, options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtOptions.Issuer,
                        ValidAudience = jwtOptions.Issuer,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key))
                    };
                });
            return services;
        }
    }
}
