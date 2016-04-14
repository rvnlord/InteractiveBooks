using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using MVCDemo.Models;
using Newtonsoft.Json;

namespace MVCDemo.Controllers
{
    public class UserController : BaseController
    {
        //public ActionResult Index()
        //{
        //    return View();
        //}

        [HttpGet]
        public ViewResult Register(bool displayRegisterPanel, bool displayActivateAccountPanel, bool displayRemindPasswordPanel)
        {
            Session["DisplayRegisterPanels"] = new
            {
                RegisterPanel = displayRegisterPanel,
                ActivateAccountPanel = displayActivateAccountPanel,
                RemindPasswordPanel = displayRemindPasswordPanel
            };
            return View();
        }

        public string GetRegisterPanel()
        {
            //Thread.Sleep(2000);
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            if (!ModelState.IsValid)
                throw new Exception("Walidacja użytkownika nie powiodła się");

            dynamic displayPanels = Session["DisplayRegisterPanels"];
            return JsonConvert.SerializeObject(new
            {
                DisplayPanel = displayPanels.GetType().GetProperty("RegisterPanel") != null ? displayPanels.RegisterPanel : false,
                PartialView = RenderPartialView("_RegisterPanel", new UserToRegisterViewModel())
            });
        }

        public string GetActivateAccountPanel()
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            if (!ModelState.IsValid)
                throw new Exception("Walidacja użytkownika nie powiodła się");

            dynamic displayPanels = Session["DisplayRegisterPanels"];
            return JsonConvert.SerializeObject(new
            {
                DisplayPanel = displayPanels.GetType().GetProperty("ActivateAccountPanel") != null ? displayPanels.ActivateAccountPanel : false,
                PartialView = RenderPartialView("_ActivateAccountPanel", new UserToActivateViewModel())
            });
        }

        public string GetRemindPasswordPanel()
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            if (!ModelState.IsValid)
                throw new Exception("Walidacja użytkownika nie powiodła się");

            dynamic displayPanels = Session["DisplayRegisterPanels"];
            return JsonConvert.SerializeObject(new
            {
                DisplayPanel = displayPanels.GetType().GetProperty("RemindPasswordPanel") != null ? displayPanels.RemindPasswordPanel : false,
                PartialView = RenderPartialView("_RemindPasswordPanel", new UserToRemindPasswordViewModel())
            });
        }

        public string RegisterUser([Bind(Include = "UserName,Password,ConfirmPassword,Email")] UserToRegisterViewModel userToRegister)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            if (!ModelState.IsValid)
                throw new Exception("Walidacja użytkownika nie powiodła się");

            var user = new User();
            AutoMapperConfiguration.Mapper.Map(userToRegister, user);
            var registrationResult = user.Register();
            Session["EmailData"] = Server.MapPath("~/Data/Email.xml");
            var sendActivationResult = user.SendActivationLink();
            
            if (registrationResult == ActionStatus.DatabaseError || sendActivationResult == ActionStatus.DatabaseError)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = "Baza danych nie odpowiada",
                    Result = ActionStatus.DatabaseError,
                    ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.DatabaseError)
                });
            }

            if (sendActivationResult == ActionStatus.AccountAlreadyActivated)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = "Użytkownik został już aktywowany",
                    Result = ActionStatus.AccountAlreadyActivated,
                    ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.AccountAlreadyActivated)
                });
            }

            if (sendActivationResult == ActionStatus.SendingEmailFailure)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = "Rejestracja poprawna, ale Email aktywacyjny nie został wysłany",
                    Result = ActionStatus.SendingEmailFailure,
                    ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.SendingEmailFailure)
                });
            }

            if (registrationResult == ActionStatus.Success && sendActivationResult == ActionStatus.Success)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = $"Rejestracja prawidłowa, link aktywacyjny wysłano do: {user.Email}",
                    Result = ActionStatus.Success,
                    ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.Success)
                });
            }

            throw new ArgumentOutOfRangeException();
        }

        public string ActivateUserAccount([Bind(Include = "ActivationEmail,ActivationCode")] UserToActivateViewModel userToActivate)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            if (!ModelState.IsValid)
                throw new Exception("Walidacja użytkownika nie powiodła się");

            var user = new User();
            AutoMapperConfiguration.Mapper.Map(userToActivate, user);
            var activationResult = user.Activate();

            switch (activationResult)
            {
                case ActionStatus.Success:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = $"Konto <span class=\"linklike\">{user.UserName}</span> zostało Aktywowane",
                        Result = ActionStatus.Success,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.Success)
                    });
                }
                case ActionStatus.DatabaseError:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError)
                    });
                }
                case ActionStatus.AccountAlreadyActivated:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Użytkownik został już aktywowany",
                        Result = ActionStatus.AccountAlreadyActivated,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.AccountAlreadyActivated)
                    });
                }
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }

        public string SendActivationEmailAgain([Bind(Include = "ActivationEmail")] UserToSendActivationCodeViewModel userToSendActivationCode)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            ModelState.Remove("ActivationCode");
            if (!ModelState.IsValid)
                throw new Exception("Walidacja użytkownika nie powiodła się");
                
            var user = new User();
            AutoMapperConfiguration.Mapper.Map(userToSendActivationCode, user);
            Session["EmailData"] = Server.MapPath("~/Data/Email.xml");
            var sendActivationResult = user.SendActivationLink();

            if (sendActivationResult == ActionStatus.DatabaseError)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = "Baza danych nie odpowiada",
                    Result = ActionStatus.DatabaseError,
                    ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError)
                });
            }

            if (sendActivationResult == ActionStatus.AccountAlreadyActivated)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = "Użytkownik został już aktywowany",
                    Result = ActionStatus.AccountAlreadyActivated,
                    ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.AccountAlreadyActivated)
                });
            }

            if (sendActivationResult == ActionStatus.SendingEmailFailure)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = "Email aktywacyjny nie został wysłany",
                    Result = ActionStatus.SendingEmailFailure,
                    ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.SendingEmailFailure)
                });
            }

            if (sendActivationResult == ActionStatus.Success)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = $"Link aktywacyjny wysłano do: <span class=\"linklike\">{user.ActivationEmail}</span>",
                    Result = ActionStatus.Success,
                    ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.Success)
                });
            }

            throw new ArgumentOutOfRangeException();
        }

        public string RemindUserPassword([Bind(Include = "RemindPasswordEmail,RemindPasswordCode,RemindPasswordOldPassword,RemindPasswordNewPassword,RemindPasswordConfirmPassword")] UserToRemindPasswordViewModel userToRemindPassword)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            if (!ModelState.IsValid)
                throw new Exception("Walidacja użytkownika nie powiodła się");

            var user = new User();
            AutoMapperConfiguration.Mapper.Map(userToRemindPassword, user);
            var activationResult = user.RemindPassword();

            switch (activationResult)
            {
                case ActionStatus.Success:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = $"Hasło do konta użytkownika: <span class=\"linklike\">{user.UserName}</span> zostało Zmienione",
                        Result = ActionStatus.Success,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.Success)
                    });
                }
                case ActionStatus.DatabaseError:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError)
                    });
                }
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }

        public string SendRemindPasswordRequest([Bind(Include = "RemindPasswordEmail")] UserToSendRemindPasswordRequestViewModel userToSendRemindPasswordRequest)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            ModelState.Remove("ActivationCode");
            if (!ModelState.IsValid)
                throw new Exception("Walidacja użytkownika nie powiodła się");

            var user = new User();
            AutoMapperConfiguration.Mapper.Map(userToSendRemindPasswordRequest, user);
            Session["EmailData"] = Server.MapPath("~/Data/Email.xml");
            var sendRemindPasswordResult = user.SendRemindPasswordRequest();

            if (sendRemindPasswordResult == ActionStatus.DatabaseError)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = "Baza danych nie odpowiada",
                    Result = ActionStatus.DatabaseError,
                    ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError)
                });
            }

            if (sendRemindPasswordResult == ActionStatus.SendingEmailFailure)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = "Email z kodem weryfikacyjnym nie został wysłany",
                    Result = ActionStatus.SendingEmailFailure,
                    ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.SendingEmailFailure)
                });
            }

            if (sendRemindPasswordResult == ActionStatus.Success)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = $"Kod weryfikacyjny wysłano do: <span class=\"linklike\">{user.RemindPasswordEmail}</span>",
                    Result = ActionStatus.Success,
                    ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.Success)
                });
            }

            throw new ArgumentOutOfRangeException();
        }

        public string IsUserNameAvailable(string userName)
        {
            //Thread.Sleep(3000);
            using (var db = new ProjectDbContext())
            {
                try
                {
                    var isUserNameAvailable = !db.Users.Any(x => x.UserName == userName); // nie wymaga case sensitive, bo jest porównywany w bd
                    return JsonConvert.SerializeObject(new
                    {
                        Message = isUserNameAvailable ? "" : "Nazwa Użytkownika jest już używana",
                        Result = isUserNameAvailable ? ActionStatus.Success : ActionStatus.Failure,
                        ResultString = isUserNameAvailable ? Enum.GetName(typeof (ActionStatus), ActionStatus.Success) : Enum.GetName(typeof (ActionStatus), ActionStatus.Failure)
                    });
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza Danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.DatabaseError)
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public string IsEmailAvailable(string email)
        {
            //Thread.Sleep(2000);
            using (var db = new ProjectDbContext())
            {
                try
                {
                    var isEmailAvailable = !db.Users.Any(x => x.Email == email);
                    return JsonConvert.SerializeObject(new
                    {
                        Message = isEmailAvailable ? "" : "Email jest już używany",
                        Result = isEmailAvailable ? ActionStatus.Success : ActionStatus.Failure,
                        ResultString = isEmailAvailable ? Enum.GetName(typeof (ActionStatus), ActionStatus.Success) : Enum.GetName(typeof (ActionStatus), ActionStatus.Failure)
                    });
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza Danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.DatabaseError)
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public string IsEmailInDatabaseAjax(User user)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            return IsEmailInDatabase(user.Email ?? user.ActivationEmail ?? user.RemindPasswordEmail);
        }

        public string IsEmailInDatabase(string email)
        {
            //Thread.Sleep(2000);
            using (var db = new ProjectDbContext())
            {
                try
                {
                    var isEmailInDatabase = db.Users.Any(x => x.Email == email);
                    return JsonConvert.SerializeObject(new
                    {
                        Message = isEmailInDatabase ? "" : "Email nie znajduje się w Bazie Danych",
                        Result = isEmailInDatabase ? ActionStatus.Success : ActionStatus.Failure,
                        ResultString = isEmailInDatabase ? Enum.GetName(typeof (ActionStatus), ActionStatus.Success) : Enum.GetName(typeof (ActionStatus), ActionStatus.Failure)
                    });
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza Danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.DatabaseError)
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public string IsActivationCodeValid(string activationCode, string activationEmail)
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    if (db.Users.Any(u => u.Email == activationEmail))
                    {
                        var currUserId = db.Users.Single(u => u.Email == activationEmail).Id;
                        var userRequestsDesc =
                            db.ActivationRequests.Where(x => x.UserId == currUserId)
                                .OrderByDescending(x => x.ActivationRequestDateTime);
                        db.ActivationRequests.RemoveRange(userRequestsDesc.Skip(1));
                        db.SaveChanges();

                        if (userRequestsDesc.Count() == 1)
                        {
                            var lastReq = userRequestsDesc.Single();
                            var isActivationCodeValid = activationCode == lastReq.Id.ToString();

                            if (isActivationCodeValid)
                            {
                                return JsonConvert.SerializeObject(new
                                {
                                    Message = "",
                                    Result = ActionStatus.Success,
                                    ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.Success)
                                });
                            }
                        }
                    }

                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Kod aktywacyjny dla podanego Emaila jest błędny",
                        Result = ActionStatus.Failure,
                        ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.Failure)
                    });
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza Danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.DatabaseError)
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public string IsRemindPasswordCodeValid(string remindPasswordCode, string remindPasswordEmail)
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    if (db.Users.Any(u => u.Email == remindPasswordEmail))
                    {
                        var currUserId = db.Users.Single(u => u.Email == remindPasswordEmail).Id;
                        var userRequestsDesc =
                            db.RemindPasswordRequests.Where(x => x.UserId == currUserId)
                                .OrderByDescending(x => x.RemindPasswordRequestDateTime);
                        db.RemindPasswordRequests.RemoveRange(userRequestsDesc.Skip(1));
                        db.SaveChanges();

                        if (userRequestsDesc.Count() == 1)
                        {
                            var lastReq = userRequestsDesc.Single();
                            var isActivationCodeValid = remindPasswordCode == lastReq.Id.ToString();

                            if (isActivationCodeValid)
                            {
                                return JsonConvert.SerializeObject(new
                                {
                                    Message = "",
                                    Result = ActionStatus.Success,
                                    ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.Success)
                                });
                            }
                        }
                    }

                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Kod Weryfikacyjny dla podanego Emaila jest błędny",
                        Result = ActionStatus.Failure,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure)
                    });
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza Danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError)
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public string IsRemindPasswordOldPasswordValid(string remindPasswordOldPassword, string remindPasswordEmail)
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    if (db.Users.Any(u => u.Email == remindPasswordEmail))
                    {
                        var currUser = db.Users.Single(u => u.Email == remindPasswordEmail);
                        var userRequestsDesc =
                            db.RemindPasswordRequests.Where(x => x.UserId == currUser.Id)
                                .OrderByDescending(x => x.RemindPasswordRequestDateTime);
                        db.RemindPasswordRequests.RemoveRange(userRequestsDesc.Skip(1));
                        db.SaveChanges();

                        if (userRequestsDesc.Count() == 1)
                        {
                            //var lastReq = userRequestsDesc.Single();
                            var isOldPasswordValid = Encryption.VerifyHash(remindPasswordOldPassword, HashAlgorithmType.SHA512, currUser.Password) == currUser.Password;

                            if (isOldPasswordValid)
                            {
                                return JsonConvert.SerializeObject(new
                                {
                                    Message = "",
                                    Result = ActionStatus.Success,
                                    ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.Success)
                                });
                            }
                        }
                    }

                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Stare Hasło dla użytkownika o podanym Emailu jest błędne",
                        Result = ActionStatus.Failure,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure)
                    });
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza Danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError)
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }
    }
}