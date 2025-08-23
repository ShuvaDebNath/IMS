using Boilerplate.API.Filters;
using Boilerplate.Repository;
using Boilerplate.Service;
using DotNetEnv;
using IMS.API.Configuration;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
ConfigurationManager configuration = builder.Configuration;

// Load environment variables from .env file
Env.Load();

// Use environment variables for connection strings and JWT
var userDbConnection = Environment.GetEnvironmentVariable("USERDBCONNECTION");
var transactionDbConnection = Environment.GetEnvironmentVariable("TRANSACTIONDBCONNECTION");
var jwtKey = Environment.GetEnvironmentVariable("SECURITYJWT_KEY");
var jwtIssuer = Environment.GetEnvironmentVariable("SECURITYJWT_ISSUER");

// Bind JwtOptions from environment variables
builder.Services.Configure<JwtOptions>(options => {
    options.Key = jwtKey ?? string.Empty;
    options.Issuer = jwtIssuer ?? string.Empty;
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddMemoryCache();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "IMS.API", Version = "v1" });
});

// Register configurators for DI
builder.Services.AddSingleton<LoggingServiceConfigurator>();
builder.Services.AddSingleton<AuthorizationServiceConfigurator>();
builder.Services.AddSingleton<BusinessLogicServiceConfigurator>();

// Serilog Configuration
var loggingConfigurator = builder.Services.BuildServiceProvider().GetRequiredService<LoggingServiceConfigurator>();
loggingConfigurator.ConfigureLog(builder.Logging, configuration);

// Business Logic & Data Access Registration
var businessLogicConfigurator = builder.Services.BuildServiceProvider().GetRequiredService<BusinessLogicServiceConfigurator>();
businessLogicConfigurator.AddBusinessLogicLayer(builder.Services);
builder.Services.AddDataAccessLayer();

builder.Services.AddOptions();

// Set application session period
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(12);
});

// Inject JWT authentication configuration using options pattern
var jwtOptions = builder.Services.BuildServiceProvider().GetRequiredService<Microsoft.Extensions.Options.IOptions<JwtOptions>>();
new ServiceCollectionExtensions().AddJwtAuthentication(builder.Services, jwtOptions.Value);

// Configure Custom Authorization & Model Validator
var authConfigurator = builder.Services.BuildServiceProvider().GetRequiredService<AuthorizationServiceConfigurator>();
authConfigurator.ConfigureCustomeAuthorization(builder.Services);

// Set Content root path
builder.Host.UseContentRoot(Directory.GetCurrentDirectory());

var app = builder.Build();

// Enable Swagger in all environments
app.UseSwagger();
app.UseSwaggerUI();

// Configure the HTTP request pipeline
app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("CorsPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseSession();
app.MapControllers();

app.Run();
