using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using MVCDemo.Common;

namespace MVCDemo.Models
{
    public class UserToSendRemindPasswordRequestViewModel
    {
        [DisplayName("Email")]
        [Required]
        [RegularExpression(@"^(?("")("".+?(?<!\\)""@)|(([0-9a-z~!$%^&*_=+]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-z~!$%^&*_=+])@))" + @"(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z~!$%^&*_=+][-\w]*[0-9a-z~!$%^&*_=+]*\.)+[a-z0-9~!$%^&*_=+][\-a-z0-9~!$%^&*_=+]{0,22}[a-z0-9~!$%^&*_=+]))$", ErrorMessage = "To nie jest poprawny adres email")]
        [RemoteClientServer("IsEmailInDatabase", "User", ErrorMessage = "Podany Email nie istnieje w Bazie Danych")]
        public string RemindPasswordEmail { get; set; }
    }
}
