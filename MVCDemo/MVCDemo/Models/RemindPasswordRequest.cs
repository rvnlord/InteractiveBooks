using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace MVCDemo.Models
{
    [Table("project.tblremindpasswordrequests")]
    public class RemindPasswordRequest
    {
        public Guid Id { get; set; }

        public Guid? UserId { get; set; }

        public DateTime? RemindPasswordRequestDateTime { get; set; }

        public virtual User User { get; set; }
    }
}
