using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Reflection;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity.Core.Objects.DataClasses;
using System.Data.Entity.Core.Objects;
using System.Text;
using Newtonsoft.Json.Linq;

namespace MVCDemo.Common
{
    public class DisplayNameHelper
    {
        public static string GetDisplayName(object obj, string propertyName)
        {
            if (obj == null) return null;
            return GetDisplayName(obj.GetType(), propertyName);
        }

        public static string GetDisplayName(Type type, string propertyName)
        {
            var property = type.GetProperty(propertyName);
            if (property == null) return null;

            return GetDisplayName(property);
        }

        public static string GetDisplayName(PropertyInfo property)
        {
            var attrName = GetAttributeDisplayName(property);
            if (!string.IsNullOrEmpty(attrName))
                return attrName;

            var metaName = GetMetaDisplayName(property);
            if (!string.IsNullOrEmpty(metaName))
                return metaName;

            return property.Name;
        }

        private static string GetAttributeDisplayName(PropertyInfo property)
        {
            var atts = property.GetCustomAttributes(typeof(DisplayNameAttribute), true);
            if (atts.Length == 0)
                return null;
            var displayNameAttribute = atts[0] as DisplayNameAttribute;
            return displayNameAttribute?.DisplayName;
        }

        private static string GetMetaDisplayName(PropertyInfo property)
        {
            if (property.DeclaringType == null)
                return null;
            var atts = property.DeclaringType.GetCustomAttributes(
                typeof(MetadataTypeAttribute), true);
            if (atts.Length == 0)
                return null;
            var metaAttr = atts[0] as MetadataTypeAttribute;
            var metaProperty = metaAttr?.MetadataClassType.GetProperty(property.Name);
            return metaProperty == null ? null : GetAttributeDisplayName(metaProperty);
        }
    }

}