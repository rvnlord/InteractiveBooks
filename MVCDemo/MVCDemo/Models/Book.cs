using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MVCDemo.Models
{
    [Table("project.tblbooks")]
    public class Book
    {
        public Guid Id { get; set; }

        [StringLength(100)]
        [DisplayName("Tytuł")]
        public string Title { get; set; }

        [StringLength(100)]
        [DisplayName("Kategoria")]
        public string Category { get; set; }

        [Column(TypeName = "text")]
        [StringLength(65535)]
        [DisplayName("Opis")]
        public string Description { get; set; }

        public Guid? AuthorId { get; set; }

        [StringLength(257)]
        public string Thumbnail { get; set; }

        public DateTime? AdditionDate { get; set; }

        [Column(TypeName = "bit")]
        public bool? IsPublic { get; set; }

        //[JsonIgnore]
        [DisplayName("Autor")]
        public virtual User Author { get; set; }
    }
}
