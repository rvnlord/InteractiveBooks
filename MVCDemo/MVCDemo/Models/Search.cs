using System;
using System.Collections.Generic;
using System.Linq;
using System.ComponentModel.DataAnnotations;
using MVCDemo.Common;
using System.ComponentModel;
using System.Web.Mvc;
using System.Reflection;

namespace MVCDemo.Models
{
    [Serializable]
    [AtLeastOneProperty(typeof(bool))]
    public class Search
    {
        public Search() // inicjalizuj wartości domyślne
        {
            _searchTerm = "";
            _includeTitle = true;
            _includeAuthor = true;
            _includeCategory = false;
            _includeDescription = false;
            _sortOrder = "asc";
            _sortBy = "title";
            _howMuchSkip = 0;
            _howMuchTake = 10;
        }

        public Search(Search oldSearch) // inicjalizuj wartości domyślne
        {
            _searchTerm = oldSearch.SearchTerm;
            _includeTitle = oldSearch.IncludeTitle;
            _includeAuthor = oldSearch.IncludeAuthor;
            _includeCategory = oldSearch.IncludeCategory;
            _includeDescription = oldSearch.IncludeDescription;
            _sortOrder = oldSearch.SortOrder;
            _sortBy = oldSearch.SortBy;
            _howMuchSkip = oldSearch.HowMuchSkip;
            _howMuchTake = oldSearch.HowMuchTake;
        }

        public Search(IReadOnlyDictionary<string, object> dictSearch)
        {
            _searchTerm = dictSearch["searchTerm".ToLower()] != null ? dictSearch["searchTerm".ToLower()].ToString() : string.Empty;
            _includeTitle = Convert.ToBoolean(dictSearch["IncludeTitle".ToLower()]);
            _includeAuthor = Convert.ToBoolean(dictSearch["includeAuthor".ToLower()]);
            _includeCategory = Convert.ToBoolean(dictSearch["IncludeCategory".ToLower()]);
            _includeDescription = Convert.ToBoolean(dictSearch["IncludeDescription".ToLower()]);
            _sortOrder = dictSearch["sortOrder".ToLower()].ToString();
            _sortBy = dictSearch["sortBy".ToLower()].ToString();
            _howMuchSkip = Convert.ToInt32(dictSearch["howMuchSkip".ToLower()]);
            _howMuchTake = Convert.ToInt32(dictSearch["howMuchTake".ToLower()]);
        }
        
        private string _searchTerm;
        private bool _includeTitle;
        private bool _includeAuthor;
        private bool _includeCategory;
        private bool _includeDescription;
        private string _sortBy;
        private string _sortOrder;
        private int _howMuchSkip;
        private int _howMuchTake;

        [RegularExpression(@"^[a-zA-Z ĄąĆćĘęŁłŃńÓóŚśŹźŻż:]*$")]
        [MinFirstStringLength(3, ' ', ErrorMessage = "Wyszukiwane frazy muszą mieć co najmniej 3 znaki. ")]
        [DisplayName("Szukaj Książek: ")]
        public string SearchTerm
        {
            get
            {
                return !string.IsNullOrWhiteSpace(_searchTerm) ? _searchTerm : string.Empty;
            }
            set
            {
                _searchTerm = value;
            }
        }

        [Required]
        [DisplayName("Uwzględnij Autora")]
        public bool IncludeAuthor
        {
            get { return _includeAuthor; }
            set { _includeAuthor = value; }
        }

        [Required]
        [DisplayName("Uwzględnij Tytuł")]
        public bool IncludeTitle
        {
            get { return _includeTitle; }
            set { _includeTitle = value; }
        }

        [Required]
        [DisplayName("Uwzględnij Kategorię")]
        public bool IncludeCategory
        {
            get { return _includeCategory; }
            set { _includeCategory = value; }
        }

        [Required]
        [DisplayName("Uwzględnij Opis")]
        public bool IncludeDescription
        {
            get { return _includeDescription; }
            set { _includeDescription = value; }
        }

        [Required]
        [MatchProperties(typeof(Book))]
        [DisplayName("Sortuj: ")]
        public string SortBy
        {
            get { return _sortBy; }
            set { _sortBy = value; }
        }

        public List<SelectListItem> DdlSortBy
        {
            get
            {
                var tempDdlSortBy = new List<SelectListItem>
                {
                    new SelectListItem
                    {
                        Value = "default",
                        Text = "(Kategoria Sortowania)",
                        Selected = false
                    }
                };
                
                tempDdlSortBy.AddRange(typeof(Book)
                    .GetProperties(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                    .Where(p => !"Id|AdditionDate|Thumbnail|IsPublic|AuthorId".ToLower().Split('|').Contains(p.Name.ToLower()))
                    .Select(p =>
                        new SelectListItem
                        {
                            Value = p.Name.ToLower(),
                            Text = DisplayNameHelper.GetDisplayName(p),
                            Selected = p.Name.ToLower() == _sortBy
                        }));

                return tempDdlSortBy;
            }
        }

        [Required]
        [MatchPattern("asc", "desc")]
        [DisplayName("Kierunek Sortowania: ")]
        public string SortOrder
        {
            get { return _sortOrder; }
            set { _sortOrder = value; }
        }

        public List<SelectListItem> DdlSortOrder => new SelectList(
            new List<object>
            {
                new { Value = "default", Text = "(Kierunek Sortowania)" },
                new { Value = "asc" , Text = "Rosnąco"  },
                new { Value = "desc" , Text = "Malejąco" }
            },
            "Value",
            "Text",
            _sortOrder.ToLower()).ToList();

        [Required]
        public int HowMuchSkip
        {
            get { return _howMuchSkip; }
            set { _howMuchSkip = value; }
        }

        [Required]
        public int HowMuchTake
        {
            get { return _howMuchTake; }
            set { _howMuchTake = value; }
        }

        public Dictionary<string, object> ToDictionary()
        {
            return new Dictionary<string, object>()
            {
                { "searchTerm".ToLower(), _searchTerm },
                { "includeTitle".ToLower(), _includeTitle },
                { "includeAuthor".ToLower(), _includeAuthor },
                { "includeCategory".ToLower(), _includeCategory },
                { "includeDescription".ToLower(), _includeDescription },
                { "sortBy".ToLower(), _sortBy },
                { "sortOrder".ToLower(), _sortOrder },
                { "howMuchSkip".ToLower(), _howMuchSkip },
                { "howMuchTake".ToLower(), _howMuchTake }
            };
        }

        public override bool Equals(object obj)
        {
            var search = obj as Search;
            if (search == null)
                return false;

            var newSearch = search;

            return
                _searchTerm == newSearch.SearchTerm &&
                _includeTitle == newSearch.IncludeTitle &&
                _includeAuthor == newSearch.IncludeAuthor &&
                _includeCategory == newSearch.IncludeCategory &&
                _includeDescription == newSearch.IncludeDescription &&
                _sortBy == newSearch.SortBy &&
                _sortOrder == newSearch.SortOrder &&
                _howMuchSkip == newSearch.HowMuchSkip &&
                _howMuchTake == newSearch.HowMuchTake;
        }

        public override int GetHashCode()
        { // ReSharper disable once BaseObjectGetHashCodeCallInGetHashCode
            return base.GetHashCode();
        }
    }
}
