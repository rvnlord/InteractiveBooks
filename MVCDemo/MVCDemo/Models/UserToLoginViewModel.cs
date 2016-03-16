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
    public class UserToLoginViewModel
    { // nie trzeba walidacji bo ModelState przy logowaniu nie jest sprawdzany
        public Guid Id { get; set; }

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

        [DisplayName("Zapamiętaj")]
        public bool RememberMe { get; set; }
    }
}
