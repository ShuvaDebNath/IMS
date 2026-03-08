using System;
using System.Collections.Generic;
using System.Text;

namespace AccountingBackEnd.DAL.DTOs
{
    public class PIReportParams
    {
        public string RptType { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string? PI_Master_Id { get; set; }
        public string? ClientId { get; set; }
        public string? User_Id { get; set; }
        public int PageLength { get; set; }
        public int PageNo { get; set; }
        public string? SearchParam { get; set; }
    }
}
