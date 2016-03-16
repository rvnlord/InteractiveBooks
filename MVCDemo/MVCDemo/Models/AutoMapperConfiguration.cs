using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;

namespace MVCDemo.Models
{
    public static class AutoMapperConfiguration
    {
        public static IMapper Mapper { get; set; }

        public static void Configure()
        {
            var config = new MapperConfiguration(cfg =>
            {
                ConfigureUserMapping(cfg);
                //ConfigurePostMapping();
            });

            Mapper = config.CreateMapper();
        }

        private static void ConfigureUserMapping(IMapperConfiguration cfg)
        {
            cfg.CreateMap<UserToRegisterViewModel, User>();
            cfg.CreateMap<UserToLoginViewModel, User>();
            cfg.CreateMap<UserToActivateViewModel, User>();
            cfg.CreateMap<UserToRemindPasswordViewModel, User>();
            cfg.CreateMap<UserToSendActivationCodeViewModel, User>();
            cfg.CreateMap<UserToSendRemindPasswordRequestViewModel, User>();
            cfg.CreateMap<User, User>().ForAllMembers(opt => opt.Condition(c => !c.IsSourceValueNull));
        }
    }
}
