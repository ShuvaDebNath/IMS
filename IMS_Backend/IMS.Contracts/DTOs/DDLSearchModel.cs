using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Contracts.DTOs
{
    public class DDLSearchModel
    {
        public int? First { get; set; }
        public int? Rows { get; set; }
        public string? Filter { get; set; }
    }
}