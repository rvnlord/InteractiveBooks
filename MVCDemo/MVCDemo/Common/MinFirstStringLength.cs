using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MVCDemo.Common
{
    internal class MinFirstStringLength : ValidationAttribute
    {
        public MinFirstStringLength(int minLength, char separator)
        {
            this.MinLength = minLength;
            this.Separator = separator;
        }

        public int MinLength { get; private set; }
        public char Separator { get; private set; }

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value == null || string.IsNullOrEmpty(value.ToString()))
                return ValidationResult.Success;

            var arrCurrTerm = value.ToString().Split(Separator);
            
            if (arrCurrTerm[0].Length < MinLength)
                return new ValidationResult(this.FormatErrorMessage(validationContext.DisplayName));

            return ValidationResult.Success;
        }
    }
}
