using System;
using System.Collections.Generic;
using System.Text;

namespace AccountingBackEnd.DAL.DTOs
{
    public class ReportsParams
    {
        public string fromdate { get; set; }
        public string todate { get; set; }
        public string Id { get; set; }
        public string companyId { get; set; }
    }
}
