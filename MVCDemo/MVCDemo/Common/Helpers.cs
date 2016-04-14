using System;
using System.Web;
using System.Reflection;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace MVCDemo.Common
{
    public class GlobalHelper
    {
        private const int TimedOutExceptionCode = -2147467259;
        public static bool IsMaxRequestExceededException(Exception e)
        {
            Exception main;
            var unhandled = e as HttpUnhandledException;

            if (unhandled != null && unhandled.ErrorCode == TimedOutExceptionCode)
            {
                main = unhandled.InnerException;
            }
            else
                main = e;
            
            var http = main as HttpException;

            if (http == null || http.ErrorCode != TimedOutExceptionCode)
                return false;
            // Nie istnieje metoda identyfikacji błędu RequestExceeded ponieważ jest on traktowany jako Timeout
            return http.StackTrace.Contains("GetEntireRawContent");
        }
    }

    public class DisplayNameHelper
    {
        public static string GetDisplayName(object obj, string propertyName)
        {
            return obj == null ? null : GetDisplayName(obj.GetType(), propertyName);
        }

        public static string GetDisplayName(Type type, string propertyName)
        {
            var property = type.GetProperty(propertyName);
            return property == null ? null : GetDisplayName(property);
        }

        public static string GetDisplayName(PropertyInfo property)
        {
            var attrName = GetAttributeDisplayName(property);
            if (!string.IsNullOrEmpty(attrName))
                return attrName;

            var metaName = GetMetaDisplayName(property);
            return !string.IsNullOrEmpty(metaName) ? metaName : property.Name;
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