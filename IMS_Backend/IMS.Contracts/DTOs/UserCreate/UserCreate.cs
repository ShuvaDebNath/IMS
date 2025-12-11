namespace Boilerplate.Contracts;

public class UserCreate
{
    public int? User_ID { get; set; }
    public string? UserName { get; set; }
    public string? Password { get; set; }
    public int? Role_id { get; set; }
    public int? Superior_ID { get; set; }
    public bool? IsAuthorized { get; set; }
    public bool IsSupplier { get; set; }
    public int? Supplier_ID { get; set; }
    public string? Email { get; set; }
}
