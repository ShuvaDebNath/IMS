
﻿using Boilerplate.Contracts.Enum;
using System;
﻿using System;
using System.Collections.Generic;
using System.Text;

namespace AccountingBackEnd.DAL.DTOs
{
    public class CustomerParams
    {
        public string Superior_Id { get; set; }
        public string Customer_Id { get; set; }
        public string Status { get; set; }
        public string SentBy { get; set; }
    }
}
