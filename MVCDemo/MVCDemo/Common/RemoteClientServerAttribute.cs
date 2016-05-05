using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using MVCDemo.Controllers;
using MVCDemo.Models;
using Newtonsoft.Json;

namespace MVCDemo.Common
{
    public class RemoteClientServerAttribute : RemoteAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var propValues = new List<object> { value };
            if (!string.IsNullOrWhiteSpace(AdditionalFields))
            {
                var additionalFields = AdditionalFields.Split(',');
                propValues.AddRange(additionalFields
                    .Select(additionalField => validationContext.ObjectType.GetProperty(additionalField))
                    .Where(prop => prop != null)
                    .Select(prop => prop.GetValue(validationContext.ObjectInstance, null)));
            }

            // Pobierz kontroler używając Reflection
            var controller = Assembly.GetExecutingAssembly().GetTypes()
                .FirstOrDefault(type => string.Equals(type.Name, $"{RouteData["controller"].ToString()}Controller", StringComparison.CurrentCultureIgnoreCase));

            // Pobierz metodę akcji zawierającą logikę walidacji
            var action = controller?.GetMethods()
                .FirstOrDefault(method => string.Equals(method.Name, RouteData["action"].ToString(), StringComparison.CurrentCultureIgnoreCase)
                     && method.GetParameters().Select(p => p.ParameterType).SequenceEqual(propValues.Select(p => p.GetType())));

            if (action == null)
                throw new Exception("Wskazana w RemoteClientServerAttribute metoda walidacji nie istnieje");
            
            // Utwórz instancję klasy kontrolera
            var instance = Activator.CreateInstance(controller);
            // Wywołaj metodę akcji posiadającą logikę walidacji
            var response = action.Invoke(instance, propValues.ToArray());
            var jsonString = response as string;
            var jsonResult = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(jsonString);
            var result = jsonResult["Result"];
            var message = jsonResult["Message"] ?? "";

            if (result == null)
                throw new Exception("Rezultat metody w RemoteClientServerAttribute zwrócił null");

            switch ((ActionStatus)result)
            {
                case ActionStatus.Success:
                {
                    return ValidationResult.Success;
                }
                case ActionStatus.Failure:
                {
                    return new ValidationResult(ErrorMessage); // zwróć wiadomość użytkownika
                }
                case ActionStatus.DatabaseError:
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