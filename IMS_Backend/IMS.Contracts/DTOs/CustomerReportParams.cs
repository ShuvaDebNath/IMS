using System;
using System.Collections.Generic;
using System.Text;

namespace AccountingBackEnd.DAL.DTOs
{
    public class CustomerReportParams
    {
        public string? Superior_Id { get; set; }
        public string? Customer_Id { get; set; }
        public string Status { get; set; }
        public string? SentBy { get; set; }
        public string RptType { get; set; }
        public int PageLength { get; set; }
        public int PageNo { get; set; }
        public string? SearchParam { get; set; }
    }
}
