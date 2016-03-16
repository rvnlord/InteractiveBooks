using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Security;
using System.Web.SessionState;
using System.Web.Http;
using System.Threading;
using System.Globalization;
using System.Web.Optimization;
using AutoMapper;
using MVCDemo.Models;

namespace MVCDemo
{
    public class Global : HttpApplication
    {
        void Application_Start(object sender, EventArgs e)
        {
            var newCulture = (CultureInfo)System.Threading.Thread.CurrentThread.CurrentCulture.Clone();
            newCulture.DateTimeFormat.ShortDatePattern = "dd-MM-yyyy";
            newCulture.DateTimeFormat.DateSeparator = "-";
            Thread.CurrentThread.CurrentCulture = newCulture;

            // Code that runs on application startup
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            BundleMobileConfig.RegisterBundles(BundleTable.Bundles);

            AutoMapperConfiguration.Configure();
        }

        void Session_Start(object sender, EventArgs e)
        {
            
        }
    }
}