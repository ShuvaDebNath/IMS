using Boilerplate.Contracts.Repositories;
using Dapper;
using IMS.Contracts.DTOs;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;

namespace Boilerplate.Repository.Repositories;

public class BeneficiaryRepository : IBeneficiaryRepository
{
    private readonly string _connectionString;

    public BeneficiaryRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("UserDBConnection")
            ?? throw new InvalidOperationException("UserDBConnection is not configured.");
    }

    // ── GET BY ID ─────────────────────────────────────────────────────────────

    public async Task<BeneficiaryDetailDto?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT [Beneficiary_Account_ID], [CompanyName], [BinNo], [Address], [City],
                   [Country_ID], [ETIN], [VATRegNo], [IsAvailable], [PaymentTypeId],
                   [LogoImage]
            FROM   [dbo].[tbl_beneficiary_account]
            WHERE  [Beneficiary_Account_ID] = @Id";

        using var con = new SqlConnection(_connectionString);
        var row = await con.QueryFirstOrDefaultAsync(sql, new { Id = id });
        if (row is null) return null;

        string? logoBase64 = null;
        if (row.LogoImage is byte[] { Length: > 0 } bytes)
        {
            // Detect MIME type from the first bytes (magic numbers)
            var mime = bytes is [0xFF, 0xD8, ..] ? "image/jpeg"
                     : bytes is [0x89, 0x50, ..] ? "image/png"
                     : "image/jpeg";

            logoBase64 = $"data:{mime};base64,{Convert.ToBase64String(bytes)}";
        }

        return new BeneficiaryDetailDto
        {
            Beneficiary_Account_ID = (int)row.Beneficiary_Account_ID,
            CompanyName            = (string)(row.CompanyName    ?? ""),
            BinNo                  = (int)row.BinNo,
            Address                = (string?)row.Address,
            City                   = (string?)row.City,
            Country_ID             = (int)(row.Country_ID        ?? 0),
            ETIN                   = (string?)row.ETIN,
            VATRegNo               = (string?)row.VATRegNo,
            IsAvailable            = (bool)row.IsAvailable,
            PaymentTypeId          = (int)(row.PaymentTypeId     ?? 0),
            LogoImageBase64        = logoBase64
        };
    }

    // ── INSERT ────────────────────────────────────────────────────────────────

    public async Task<int> SaveAsync(BeneficiaryFormDto m)
    {
        const string sql = @"
            INSERT INTO [dbo].[tbl_beneficiary_account]
                ([CompanyName], [BinNo], [Address], [City], [Country_ID],
                 [ETIN], [VATRegNo], [IsAvailable], [PaymentTypeId],
                 [Sent_By], [Received_By], [Received_Date], [LogoImage])
            VALUES
                (@CompanyName, @BinNo, @Address, @City, @Country_ID,
                 @ETIN, @VATRegNo, @IsAvailable, @PaymentTypeId,
                 @Sent_By, @Received_By, @Received_Date, @LogoImage);
            SELECT CAST(SCOPE_IDENTITY() AS INT);";

        using var con = new SqlConnection(_connectionString);
        return await con.ExecuteScalarAsync<int>(sql, new
        {
            m.CompanyName, m.BinNo,    m.Address,       m.City,
            m.Country_ID,  m.ETIN,     m.VATRegNo,      m.IsAvailable,
            m.PaymentTypeId, m.Sent_By, m.Received_By,  m.Received_Date,
            m.LogoImage
        });
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    public async Task<bool> UpdateAsync(BeneficiaryFormDto m)
    {
        // Logo column is only updated when a new file was provided
        var logoClause = m.LogoImage is { Length: > 0 }
            ? ", [LogoImage] = @LogoImage"
            : string.Empty;

        var sql = $@"
            UPDATE [dbo].[tbl_beneficiary_account]
            SET    [CompanyName]  = @CompanyName,
                   [BinNo]        = @BinNo,
                   [Address]      = @Address,
                   [City]         = @City,
                   [Country_ID]   = @Country_ID,
                   [ETIN]         = @ETIN,
                   [VATRegNo]     = @VATRegNo,
                   [IsAvailable]  = @IsAvailable,
                   [PaymentTypeId]= @PaymentTypeId
                   {logoClause}
            WHERE  [Beneficiary_Account_ID] = @Beneficiary_Account_ID";

        using var con = new SqlConnection(_connectionString);
        var rows = await con.ExecuteAsync(sql, new
        {
            m.CompanyName, m.BinNo,    m.Address,         m.City,
            m.Country_ID,  m.ETIN,     m.VATRegNo,        m.IsAvailable,
            m.PaymentTypeId, m.LogoImage, m.Beneficiary_Account_ID
        });

        return rows > 0;
    }
}
