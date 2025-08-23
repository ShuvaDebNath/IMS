using Serilog;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace IMS.API.Configuration
{
    public class LoggingServiceConfigurator
    {
        public void ConfigureLog(ILoggingBuilder logging, ConfigurationManager manager)
        {
            var logger = new LoggerConfiguration().ReadFrom
                .Configuration(manager)
                .Enrich.FromLogContext()
                .CreateLogger();
            logging.ClearProviders();
            logging.AddSerilog(logger);
        }
    }
}
