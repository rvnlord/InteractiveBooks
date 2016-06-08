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
        public string UserName { get; set; }
        
        [DisplayName("Hasło")]
        public string Password { get; set; }

        [DisplayName("Zapamiętaj")]
        public bool RememberMe { get; set; }
    }
}
