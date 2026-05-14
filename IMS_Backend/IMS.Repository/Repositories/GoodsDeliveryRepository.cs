using Boilerplate.Contracts.DTOs;
using Boilerplate.Repository;
using Dapper;
using IMS.Contracts.Repositories;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Data.SqlClient;

namespace IMS.Repository.Repositories
{
    public class GoodsDeliveryRepository : GenericRepository<PI_Ledger>, IGoodsDeliveryRepository
    {
        private SqlConnection conn;

        private string qryPILedger = @"INSERT INTO [dbo].[tbl_pi_ledger]
           ([PI_Detail_ID]
           ,[Date]
           ,[Ordered]
           ,[Delivered]
           ,[Roll]
           ,[Remark]
           ,[Chalan_No]
           ,[User_ID]
           ,[Item_ID]           
           ,[Deliverd_In_Meter]

           ,[Stock_Location_ID])
     VALUES
           (@PI_Detail_ID
           ,@Date
           ,@Ordered
           ,@Delivered
           ,@Roll
           ,@Remark
           ,@Chalan_No
           ,@User_ID
           ,@Item_ID
           ,@Deliverd_In_Meter
           ,@Stock_Location_ID)";

        private string qryPIDetails = @"UPDATE [dbo].[tbl_pi_detail]
   SET [Delivered_Quantity] = Delivered_Quantity+ @Delivered
 WHERE PI_Detail_ID=@PI_Detail_ID";

        private string qryPIStatusCheck = @"
                                            IF NOT EXISTS
                                            (
                                                SELECT 1
                                                FROM dbo.tbl_pi_detail
                                                WHERE PI_Detail_ID IN
                                                (
                                                    SELECT PI_Detail_ID
                                                    FROM dbo.tbl_pi_ledger
                                                    WHERE Chalan_No = @Chalan_No
                                                )
                                                AND ISNULL(Quantity,0) >
                                                    ISNULL(Delivered_Quantity,0)
                                            )
                                            BEGIN
                                                UPDATE dbo.tbl_pi_master
                                                SET [Status] = 'Delivered'
                                                WHERE PINo = @PINo
                                            END";

        private string qryStockOut = @"INSERT INTO tbl_stock
                                        (
                                            Item_ID,
                                            Stock_Location_ID,

                                            Stock_Out,
                                            Roll_Out,
                                            Bag_Out,

                                            Stock_Change_Date,
                                            Note,

                                            Challan_No,
                                            MakeBy,
                                            MakeDate,
                                            InsertTime
                                        )
                                        VALUES
                                        (
                                            @Item_ID,
                                            @Stock_Location_ID,

                                            @Delivered,
                                            @Roll,
                                            @Roll,

                                            GETDATE(),
                                            @Remark,
                                            @Chalan_No,
                                            @MakeBy,
                                            GETDATE(),
                                            GETDATE()
                                        )";

        public GoodsDeliveryRepository(IConfiguration configuration) : base(configuration)
        {

        }

        public async Task<bool> Save(List<PI_Ledger> model, string AuthUserId, string AuthUserName)
        {
            int rowAffect = 0;
            using (conn = new SqlConnection(_connectionStringUserDB))
            {
                if (conn.State != ConnectionState.Open)
                    await conn.OpenAsync();
                using (var trn = await conn.BeginTransactionAsync())
                {
                    try
                    {

                        if (model.Any())
                        {
                            model.ForEach(item =>
                            {
                                item.User_ID = int.Parse(AuthUserId);
                                item.MakeBy = AuthUserName;

                                rowAffect = conn.Execute(qryPILedger, item, trn);

                                rowAffect += conn.Execute(qryPIDetails, item, trn);

                                rowAffect += conn.Execute(qryPIStatusCheck, item, trn);

                                rowAffect += conn.Execute(qryStockOut, item, trn);
                            });

                            await trn.CommitAsync();
                        }

                    }
                    catch (Exception ex)
                    {
                        await trn.RollbackAsync();
                        throw;
                    }
                    finally
                    {
                        await conn.CloseAsync();
                    }
                }
            }

            return rowAffect > 0;
        }
    }
}
