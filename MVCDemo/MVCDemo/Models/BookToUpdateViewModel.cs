using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using MVCDemo.Common;

namespace MVCDemo.Models
{
    public class BookToUpdateViewModel
    {
        public Guid Id { get; set; }
        
        [DisplayName("Tytuł")]
        [Required(ErrorMessage = "Podanie Tytułu Książki jest Wymagane")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Tytuł Książki musi mieć od 3 do 100 znaków")]
        [RemoteClientServer("IsTitleAvailable", "Book", ErrorMessage = "Tytuł Książki jest już w użyciu")]
        public string Title { get; set; }
        
        [DisplayName("Kategoria")]
        public string Category { get; set; }
        
        [DisplayName("Opis")]
        public string Description { get; set; }
    }
}
