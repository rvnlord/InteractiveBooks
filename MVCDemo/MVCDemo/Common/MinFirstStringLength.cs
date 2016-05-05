using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MVCDemo.Common
{
    public class MinFirstStringLength : ValidationAttribute
    {
        public MinFirstStringLength(int minLength, char separator)
        {
            MinLength = minLength;
            Separator = separator;
        }

        public int MinLength { get; }
        public char Separator { get; }

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (string.IsNullOrEmpty(value?.ToString()))
                return ValidationResult.Success;

            var arrCurrTerm = value.ToString().Split(Separator);
            
            return arrCurrTerm[0].Length < MinLength 
                ? new ValidationResult(FormatErrorMessage(validationContext.DisplayName)) 
                : ValidationResult.Success;
        }
    }
}
