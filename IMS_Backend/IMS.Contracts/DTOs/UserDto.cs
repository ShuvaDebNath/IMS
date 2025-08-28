namespace Boilerplate.Contracts;

public class UserDto
{
    //public string Id { get; set; }
    //public string FullName { get; set; }
    //public string UserName { get; set; }
    //public string Email { get; set; }
    //public bool EmailConfirmed { get; set; }
    //public bool IsActive { get; set; }

    public string? User_ID { get; set; }
    public string? UserName { get; set; }
    public string? Password { get; set; }
    public string? Role_id { get; set; }
    public string? Superior_ID { get; set; }
    public bool? IsAuthorized { get; set; } = true;
    public bool? IsSupplier { get; set; } = true;
    public string? Supplier_ID { get; set; }
}
