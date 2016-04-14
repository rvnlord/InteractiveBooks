using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MVCDemo.Models
{
    public class MenuItem
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public string NavigateUrl { get; set; }
        public bool Checked { get; set; }
        public int? AncestorId { get; set; }
        public int Level { get; set; }
        public bool RequiresAuthentication { get; set; }
    }
}
