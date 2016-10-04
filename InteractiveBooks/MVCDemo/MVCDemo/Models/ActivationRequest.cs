using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace MVCDemo.Models
{
    [Table("project.tblactivationrequests")]
    public class ActivationRequest
    {
        //[DisplayName("Kod aktywacji")]
        //[Required]
        //[RegularExpression(@"^[A-Z0-9]{8}-([A-Z0-9]{4}-){3}[A-Z0-9]{12}$", ErrorMessage = "To nie jest poprawny Kod Aktywacyjny")]
        //[RemoteClientServer("IsActivationCodeValid", "User", ErrorMessage = "Kod Aktywacyjny nie jest prawidłowy dla podanego Emaila")]
        public Guid Id { get; set; }

        public Guid? UserId { get; set; }

        public DateTime? ActivationRequestDateTime { get; set; }

        public virtual User User { get; set; }
    }
}
