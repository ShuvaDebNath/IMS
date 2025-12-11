using Boilerplate.Contracts.Enum;
using System;
using System.Collections.Generic;
using System.Text;

namespace AccountingBackEnd.DAL.DTOs
{
    public class BuyerParams
    {
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string Superior_Id { get; set; }
        public string Customer_Id { get; set; }
        public string Status { get; set; }
        public string SentBy { get; set; }
    }
}
