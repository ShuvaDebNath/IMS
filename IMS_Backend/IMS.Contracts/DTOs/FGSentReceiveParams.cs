using System;
using System.Collections.Generic;
using System.Text;

namespace AccountingBackEnd.DAL.DTOs
{
    public class FGSentReceiveParams
    {
        public string InvoiceNo { get; set; }
        public string fromDate { get; set; }
        public string toDate { get; set; }
    }
}
