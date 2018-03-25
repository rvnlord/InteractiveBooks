using MVCDemo.Models;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace MVCDemo.Common
{
    internal class MatchPatternAttribute : ValidationAttribute
    {
        public MatchPatternAttribute(params string[] strings)
        {
            this.Strings = strings;
        }

        private Collection<string> _strings;

        public string[] Strings
        {
            get
            {
                if (this._strings == null)
                {
                    this._strings = new Collection<string>();
                }

                return this._strings.ToArray();
            }
            private set
            {
                this._strings = new Collection<string>(value);
            }
        }

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value == null)
                return new ValidationResult(this.FormatErrorMessage(validationContext.DisplayName));
            
            var matchesPattern = Strings.ToList().Select(s => s.ToLower()).Any(value.ToString().ToLower().Contains);

            if (!matchesPattern)
                return new ValidationResult(this.FormatErrorMessage(validationContext.DisplayName));

            return ValidationResult.Success;
        }
    }
}
