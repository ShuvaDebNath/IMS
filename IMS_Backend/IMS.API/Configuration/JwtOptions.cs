namespace IMS.API.Configuration
{
    public class JwtOptions
    {
        public string Key { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public int ExpiryMinutes { get; set; } = 5; // default to 5 minutes
    }
}
