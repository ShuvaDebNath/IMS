using System;
using System.Collections.Generic;
using System.Text;

namespace AccountingBackEnd.DAL.DTOs
{
    public class ApplicaitonParams
    {
        public string fromDate { get; set; }
        public string toDate { get; set; }
        public string applicationType { get; set; }
    }
}
