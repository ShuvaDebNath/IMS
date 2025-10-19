using System;
using System.Collections.Generic;
using System.Text;

namespace AccountingBackEnd.DAL.DTOs
{
    public class ReportsParams
    {
        public string fromDate { get; set; }
        public string toDate { get; set; }
        public string requestStatus { get; set; }
        public string Id { get; set; }
        public string companyId { get; set; }
    }
}
