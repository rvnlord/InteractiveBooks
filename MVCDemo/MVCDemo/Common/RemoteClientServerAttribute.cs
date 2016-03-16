using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using MVCDemo.Models;
using Newtonsoft.Json;

namespace MVCDemo.Common
{
    public class RemoteClientServerAttribute : RemoteAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var propValues = new List<object> {value};
            if (!(string.IsNullOrWhiteSpace(AdditionalFields) || string.IsNullOrEmpty(AdditionalFields)))
            {
                var additionalFields = AdditionalFields.Split(',');
                propValues.AddRange(additionalFields
                    .Select(additionalField => validationContext.ObjectType.GetProperty(additionalField))
                    .Where(prop => prop != null)
                    .Select(prop => prop.GetValue(validationContext.ObjectInstance, null)));
            }

            // Get the controller using reflection
            var controller = Assembly.GetExecutingAssembly().GetTypes()
                .FirstOrDefault(type => string.Equals(type.Name, $"{RouteData["controller"].ToString()}Controller", StringComparison.CurrentCultureIgnoreCase));

            // Get the action method that has validation logic
            var action = controller?.GetMethods()
                .FirstOrDefault(method => string.Equals(method.Name, RouteData["action"].ToString(), StringComparison.CurrentCultureIgnoreCase));

            if (action == null)
                throw new Exception("Wskazana w RemoteClientServerAttribute metoda walidacji nie istnieje");

            // poniższy skomenotwany kod jest niepotrzebny, bo wywoływany przez serwer typ np Usera przyjmie tylko 
            // w wypadku, jęzeli prześlemy tego Usera jako 'additionalFields', 'value' jest zawsze właściwością Usera

            //var notStrParams = action.GetParameters().Where(p => p.ParameterType != typeof(string));
            //var notStrParamValues = propValues.Where(p => notStrParams.Select(x => x.Name).Contains(nameof(p)));
            //propValues.RemoveAll(p => notStrParamValues.Contains(p));
            //var paramProps =
            //    from pv in notStrParamValues
            //    from prop in pv.GetType().GetProperties()
            //    select prop.GetValue(pv, null);

            //propValues.AddRange(paramProps);

            // Create an instance of the controller class
            var instance = Activator.CreateInstance(controller);
            // Invoke the action method that has validation logic
            var response = action.Invoke(instance, propValues.ToArray()); // 1 parametr, TYLKO value // new[] { value }
            var jsonString = response as string;
            var jsonResult = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(jsonString);
            var result = jsonResult["Result"];
            var message = jsonResult["Message"] ?? "";

            if (result == null)
                throw new Exception("Rezultat metody w RemoteClientServerAttribute zwrócił null");

            switch ((UserActionResult)result)
            {
                case UserActionResult.Success:
                {
                    return ValidationResult.Success;
                }
                case UserActionResult.Failure:
                {
                    return new ValidationResult(ErrorMessage); // zwróć wiadomość użytkownika
                }
                case UserActionResult.DatabaseError:
                {
                    return new ValidationResult(message); // Zwróć wiadomość serwera
                }
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }
        
        public RemoteClientServerAttribute(string routeName) : base(routeName)
        {
        }

        public RemoteClientServerAttribute(string action, string controller) : base(action, controller)
        {
        }

        public RemoteClientServerAttribute(string action, string controller, string areaName) : base(action, controller, areaName)
        {
        }
    }
}