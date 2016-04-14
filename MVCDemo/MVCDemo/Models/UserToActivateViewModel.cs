using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using MVCDemo.Common;

namespace MVCDemo.Models
{
    public class UserToActivateViewModel
    {
        [DisplayName("Email Aktywacyjny")]
        [Required]
        [RegularExpression(@"^(?("")("".+?(?<!\\)""@)|(([0-9a-z~!$%^&*_=+]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-z~!$%^&*_=+])@))" + @"(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z~!$%^&*_=+][-\w]*[0-9a-z~!$%^&*_=+]*\.)+[a-z0-9~!$%^&*_=+][\-a-z0-9~!$%^&*_=+]{0,22}[a-z0-9~!$%^&*_=+]))$", ErrorMessage = "To nie jest poprawny adres email")]
        [RemoteClientServer("IsEmailInDatabase", "User", ErrorMessage = "Podany Email nie istnieje w Bazie Danych")]
        public string ActivationEmail { get; set; }

        [DisplayName("Kod Aktywacyjny")]
        [Required]
        [RegularExpression(@"^[A-Za-z0-9]{8}-([A-Za-z0-9]{4}-){3}[A-Za-z0-9]{12}$", ErrorMessage = "To nie jest poprawny Kod Aktywacyjny")]
        [RemoteClientServer("IsActivationCodeValid", "User", AdditionalFields = "ActivationEmail", ErrorMessage = "Kod aktywacji dla podanego Emaila jest nieprawidłowy")]
        public string ActivationCode { get; set; }
    }
}
