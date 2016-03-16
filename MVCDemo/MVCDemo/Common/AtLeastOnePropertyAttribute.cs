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
    class AtLeastOnePropertyAttribute : ValidationAttribute
    {
        public AtLeastOnePropertyAttribute(Type type, params string[] excludedProperties)
        {
            this.Type = type;
            this.ExcludedProperties = excludedProperties;
        }

        public Type Type { get; private set; }
        public string[] ExcludedProperties
        {
            get
            {
                if (this._excludedProperties == null)
                {
                    this._excludedProperties = new Collection<string>();
                }

                return this._excludedProperties.ToArray();
            }
            private set
            {
                this._excludedProperties = new Collection<string>(value);
            }
        }

        private Collection<string> _excludedProperties;

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var props = value.GetType().GetProperties()
                .Where(p => p.PropertyType == Type && !ExcludedProperties.Contains(p.Name));
            
            return props.Any(property => (bool)property.GetValue(value, null)) ? 
                ValidationResult.Success : new ValidationResult(FormatErrorMessage(validationContext.DisplayName));
        }
    }
}
