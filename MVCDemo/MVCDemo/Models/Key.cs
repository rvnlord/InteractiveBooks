using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace MVCDemo.Models
{
    public class Key
    {
        [StringLength(30)]
        public string Id { get; set; }

        [StringLength(1500)]
        public string Value { get; set; }
    }
}
