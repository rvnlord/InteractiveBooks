using System;
using System.ComponentModel.DataAnnotations;

namespace MVCDemo.Common
{
    public class NotEqualTo : ValidationAttribute
    {
        public string OtherProperty { get; }

        public NotEqualTo(string otherProperty)
        {
            if (string.IsNullOrEmpty(otherProperty))
                throw new ArgumentNullException(nameof(otherProperty));
            OtherProperty = otherProperty;
        }

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (string.IsNullOrEmpty(value?.ToString()))
                throw new ArgumentNullException(value?.ToString());

            var otherProperty = validationContext.ObjectInstance.GetType().GetProperty(OtherProperty);
            var otherPropertyValue = otherProperty.GetValue(validationContext.ObjectInstance, null);

            return value.Equals(otherPropertyValue) 
                ? new ValidationResult(FormatErrorMessage(validationContext.DisplayName)) 
                : ValidationResult.Success;
        }
    }
}
