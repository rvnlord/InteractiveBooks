using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MVCDemo.Common;

namespace MVCDemo.Models
{
    public class UserToRegisterViewModel
    {
        [DisplayName("Nazwa Użytkownika")]
        [Required]
        [StringLength(25, MinimumLength = 3, ErrorMessage = "Nazwa użytkownika musi mieć od 3 do 25 znaków")]
        [RegularExpression(@"^[a-zA-Z]+$", ErrorMessage = "Nazwa użytkownika moze zawierać tylko litery od A-Z, a-z")]
        [RemoteClientServer("IsUserNameAvailable", "User", ErrorMessage = "Nazwa użytkownika jest już w użyciu")]
        public string UserName { get; set; }

        [DisplayName("Hasło")]
        [Required]
        [RegularExpression(@"(?=^.{6,25}$)(?=.*\d)(?=.*[A-Za-z])(?!.*\s).*$", ErrorMessage = "Hasło musi zawierać przynajmniej jedną literę, jedną cyfrę i od 6 do 25 znaków")]
        public string Password { get; set; }

        [DisplayName("Powtórz Hasło")]
        [Required]
        [System.ComponentModel.DataAnnotations.Compare("Password", ErrorMessage = "Hasła muszą być takie same")]
        public string ConfirmPassword { get; set; }

        [DisplayName("Email")]
        [Required]
        [RegularExpression(@"^(?("")("".+?(?<!\\)""@)|(([0-9a-z~!$%^&*_=+]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-z~!$%^&*_=+])@))" + @"(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z~!$%^&*_=+][-\w]*[0-9a-z~!$%^&*_=+]*\.)+[a-z0-9~!$%^&*_=+][\-a-z0-9~!$%^&*_=+]{0,22}[a-z0-9~!$%^&*_=+]))$", ErrorMessage = "To nie jest poprawny adres email")]
        [RemoteClientServer("IsEmailAvailable", "User", ErrorMessage = "Email jest już w użyciu")]
        public string Email { get; set; }
    }
}
