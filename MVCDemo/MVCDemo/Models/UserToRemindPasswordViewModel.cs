using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using MVCDemo.Common;

namespace MVCDemo.Models
{
    public class UserToRemindPasswordViewModel
    {
        [DisplayName("Email")]
        [Required]
        [RegularExpression(@"^(?("")("".+?(?<!\\)""@)|(([0-9a-z~!$%^&*_=+]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-z~!$%^&*_=+])@))" + @"(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z~!$%^&*_=+][-\w]*[0-9a-z~!$%^&*_=+]*\.)+[a-z0-9~!$%^&*_=+][\-a-z0-9~!$%^&*_=+]{0,22}[a-z0-9~!$%^&*_=+]))$", ErrorMessage = "To nie jest poprawny adres email")]
        [RemoteClientServer("IsEmailInDatabase", "User", ErrorMessage = "Podany Email nie istnieje w Bazie Danych")]
        public string RemindPasswordEmail { get; set; }

        [DisplayName("Kod Weryfikacyjny")]
        [Required]
        [RegularExpression(@"^[A-Za-z0-9]{8}-([A-Za-z0-9]{4}-){3}[A-Za-z0-9]{12}$", ErrorMessage = "To nie jest poprawny Kod Weryfikacyjny")]
        [RemoteClientServer("IsRemindPasswordCodeValid", "User", AdditionalFields = "RemindPasswordEmail", ErrorMessage = "Kod weryfikacji dla podanego Emaila jest nieprawidłowy")]
        public string RemindPasswordCode { get; set; }

        //[DisplayName("Stare Hasło")]
        //[Required]
        //[RegularExpression(@"(?=^.{6,25}$)(?=.*\d)(?=.*[A-Za-z])(?!.*\s).*$", ErrorMessage = "Stare Hasło musi zawierać przynajmniej jedną literę, jedną cyfrę i od 6 do 25 znaków")]
        //[RemoteClientServer("IsRemindPasswordOldPasswordValid", "User", AdditionalFields = "RemindPasswordEmail", ErrorMessage = "Stare Hasło dla podanego Emaila jest nieprawidłowe")]
        //public string RemindPasswordOldPassword { get; set; }

        [DisplayName("Nowe Hasło")]
        [Required]
        [RegularExpression(@"(?=^.{6,25}$)(?=.*\d)(?=.*[A-Za-z])(?!.*\s).*$", ErrorMessage = "Hasło musi zawierać przynajmniej jedną literę, jedną cyfrę i od 6 do 25 znaków")]
        //[NotEqualTo("RemindPasswordOldPassword", ErrorMessage = "Nowe hasło nie może byc takie same jak poprzednie")]
        public string RemindPasswordNewPassword { get; set; }

        [DisplayName("Powtórz Hasło")]
        [Required]
        [Compare("RemindPasswordNewPassword", ErrorMessage = "Hasła muszą być takie same")]
        public string RemindPasswordConfirmPassword { get; set; }
    }
}
