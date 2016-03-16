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
    class MatchPropertiesAttribute : ValidationAttribute
    {
        public MatchPropertiesAttribute(Type type, params string[] defaultValues)
        {
            this.Type = type;
            this.DefaultValues = defaultValues;
        }

        public Type Type { get; private set; }
        public string[] DefaultValues
        {
            get
            {
                if (this._defaultValues == null)
                {
                    this._defaultValues = new Collection<string>();
                }

                return this._defaultValues.ToArray();
            }
            private set
            {
                this._defaultValues = new Collection<string>(value);
            }
        }

        private Collection<string> _defaultValues;

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value == null)
                return new ValidationResult(this.FormatErrorMessage(validationContext.DisplayName));

            var properties = this.Type.GetProperties(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.DeclaredOnly);
            var propertiesNames = properties.Select(p => p.Name.ToLower()).ToList();

            if (this.DefaultValues != null)
                propertiesNames.AddRange(this.DefaultValues);

            var isPropertyOrDefault = propertiesNames.Any(value.ToString().ToLower().Contains);

            if (isPropertyOrDefault)
                return ValidationResult.Success;
            else
                return new ValidationResult(this.FormatErrorMessage(validationContext.DisplayName));
        }
    }
}
