using System;
using System.Threading.Tasks;
using System.Web.Optimization;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(MVCDemo.Startup))]

namespace MVCDemo
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            
        }
    }
}
