using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Text;

namespace IMS.API.Configuration
{
    public static class ServiceCollectionExtensions
    {
        // Best-practice extension: configure JWT from IConfiguration to avoid resolving services during startup
        public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration, string scheme = "JwtBearer")
        {
            var key = configuration["SecurityJwt:Key"];
            var issuer = configuration["SecurityJwt:Issuer"];

            if (string.IsNullOrWhiteSpace(key))
                throw new ArgumentException("JWT configuration missing: SecurityJwt:Key is not configured. Set it in appsettings or environment (SECURITYJWT_KEY).");
            if (string.IsNullOrWhiteSpace(issuer))
                throw new ArgumentException("JWT configuration missing: SecurityJwt:Issuer is not configured. Set it in appsettings or environment (SECURITYJWT_ISSUER).");

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

            services.AddAuthentication(scheme)
                .AddJwtBearer(scheme, options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = issuer,
                        ValidAudience = issuer,
                        IssuerSigningKey = signingKey
                    };
                });

            return services;
        }
    }
}
