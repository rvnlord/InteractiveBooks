using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web.Mvc;
using MVCDemo.Models;
using System.IO;
using Newtonsoft.Json;
using System.Data.Entity.Infrastructure;
using System.Web;
using System.Xml.Linq;
using MySql.Data.MySqlClient;
using static MVCDemo.Models.AutoMapperConfiguration;

namespace MVCDemo.Controllers
{
    public class BaseController : Controller
    {
        public string GetAutocompleteResults(Search search)
        {
            if (!ModelState.IsValid)
                throw new Exception("Model dla 'search' jest nieprawidłowy");

            bool error;
            string resultsCounter;
            var books = GetBooks(search, out resultsCounter, out error);

            var dateFormatSettings = new JsonSerializerSettings
            {
                DateFormatHandling = DateFormatHandling.IsoDateFormat,
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
            };

            return JsonConvert.SerializeObject(books, dateFormatSettings);
        }

        public PartialViewResult GetSearchWidget(string controller, string action)
        {
            var search = new Search();

            var dictSearchParams = GetSearchParamsSession();
            if (dictSearchParams != null && dictSearchParams.Count > 0)
            {
                search.SearchTerm = dictSearchParams["SearchTerm".ToLower()] != null ? dictSearchParams["SearchTerm".ToLower()].ToString() : string.Empty;
                search.IncludeAuthor = Convert.ToBoolean(dictSearchParams["IncludeAuthor".ToLower()]);
            }

            ViewBag.Controller = controller;
            ViewBag.Action = action;
            return PartialView("_SearchWidget", search);
        }

        protected List<Book> GetBooks(Search search, out string resultsCounter, out bool error)
        {
            error = false;
            resultsCounter = "n/a";
            var books = Enumerable.Empty<Book>().ToList();

            using (var db = new ProjectDbContext())
            {
                db.Database.Initialize(false); // MODEL MUSI BYĆ ZBUDOWANY ZANIM OTWORZYMY POŁĄCZENIE, INACZEJ BĘDZIE BŁĄD, CANNOT USE CONTEXT DURING MODEL CREATING

                var paramSearchTerms = new MySqlParameter { ParameterName = "p_SearchTerms", Value = search.SearchTerm };
                var paramIncludeTitle = new MySqlParameter { ParameterName = "p_IncludeTitle", Value = search.IncludeTitle };
                var paramIncludeAuthor = new MySqlParameter { ParameterName = "p_IncludeAuthor", Value = search.IncludeAuthor };
                var paramIncludeCategory = new MySqlParameter { ParameterName = "p_IncludeCategory", Value = search.IncludeCategory };
                var paramIncludeDescription = new MySqlParameter { ParameterName = "p_IncludeDescription", Value = search.IncludeDescription };
                var paramHowMuchSkip = new MySqlParameter { ParameterName = "p_HowMuchSkip", Value = search.HowMuchSkip };
                var paramHowMuchTake = new MySqlParameter { ParameterName = "p_HowMuchTake", Value = search.HowMuchTake };
                var paramSortBy = new MySqlParameter { ParameterName = "p_SortBy", Value = search.SortBy };
                var paramSortOrder = new MySqlParameter { ParameterName = "p_SortOrder", Value = search.SortOrder };

                var cmd = db.Database.Connection.CreateCommand();
                cmd.CommandText = "sp_SearchBooks";
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add(paramSearchTerms);
                cmd.Parameters.Add(paramIncludeTitle);
                cmd.Parameters.Add(paramIncludeAuthor);
                cmd.Parameters.Add(paramIncludeCategory);
                cmd.Parameters.Add(paramIncludeDescription);
                cmd.Parameters.Add(paramHowMuchSkip);
                cmd.Parameters.Add(paramHowMuchTake);
                cmd.Parameters.Add(paramSortBy);
                cmd.Parameters.Add(paramSortOrder);

                try
                {
                    if (search.HowMuchSkip >= 0)
                    {
                        db.Database.Connection.Open();
                        var reader = cmd.ExecuteReader();

                        resultsCounter = ((IObjectContextAdapter)db)
                            .ObjectContext
                            .Translate<string>(reader).SingleOrDefault();

                        reader.NextResult();
                        books = ((IObjectContextAdapter)db)
                            .ObjectContext
                            .Translate<Book>(reader).ToList(); //.AsQueryable().Include(b => b.Author)
                        reader.Close();

                        var loadedUsers = new List<User>();
                        foreach (var b in books)
                        {
                            var loadedCurrAuthor = loadedUsers.SingleOrDefault(u => b.AuthorId == u.Id);

                            if (loadedCurrAuthor == null)
                                loadedUsers.Add(db.Users.Single(u => b.AuthorId == u.Id));

                            b.Author = loadedUsers.Single(u => b.AuthorId == u.Id);
                        }
                    }
                }
                catch (Exception)
                {
                    error = true;
                    return books; // fallback, zwróć pusty zestaw
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }

                return books;
            }
        }
        
        public PartialViewResult GetAutocompleteItem(Book book) // wywoływany w JS, otrzymuje po kolei itemy pobrane z bazy danych
        {
            return PartialView("_AutocompleteItem", book);
        }

        public JsonResult GetDefaultSearchProperties()
        {
            var filteredSearchOptions = new Search().ToDictionary().Where(kvp => kvp.Key.GetType() != typeof(List<SelectListItem>)).ToDictionary(kvp => kvp.Key, kvp => kvp.Value);

            return Json(filteredSearchOptions, JsonRequestBehavior.AllowGet);
        }

        public Dictionary<string, object> GetSearchParamsSession()
        {
            if (Session["SearchParams"] != null)
                return (Dictionary<string, object>)Session["SearchParams"];
            return new Dictionary<string, object>();
        }

        public JsonResult GetJsonSearchParamsSession()
        {
            return Json(GetSearchParamsSession(), JsonRequestBehavior.AllowGet);
        }

        public void SaveSearchParamsSession(Dictionary<string, object> dictSearchParams)
        {
            Session["SearchParams"] = dictSearchParams;
        }

        protected Dictionary<string, object> MergeDictonaries(Dictionary<string, object> dict1, Dictionary<string, object> dict2)
        {
            var d1 = (new Dictionary<string, object>(dict1)).ToDictionary(kvp => kvp.Key.ToLower(), kvp => kvp.Value);
            var d2 = (new Dictionary<string, object>(dict2)).ToDictionary(kvp => kvp.Key.ToLower(), kvp => kvp.Value);

            return d2.Concat(d1.Where(x => !d2.Keys.Contains(x.Key))).ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
        }

        /// <summary>
        /// Renderuje Widok Częściowy do stringa zawierającego kod Html do wyświetlenia w przeglądarce.
        /// </summary>
        /// <param name="partialViewName">Nazwa Widoku Częściowego do wyświetlenia</param>
        /// <param name="model">Model związany z Widokiem Częściowym</param>
        /// <returns>Kod Html renderowany jako Widok Częsciowy</returns>
        public virtual string RenderPartialView(string partialViewName, object model)
        {
            if (ControllerContext == null)
                return string.Empty;

            if (model == null)
                throw new ArgumentNullException(nameof(model));

            if (string.IsNullOrEmpty(partialViewName))
                throw new ArgumentNullException(nameof(partialViewName));

            ModelState.Clear();//Remove possible model binding error.

            ViewData.Model = model;//Set the model to the partial view

            using (var sw = new StringWriter())
            {
                var viewResult = ViewEngines.Engines.FindPartialView(ControllerContext, partialViewName);
                var viewContext = new ViewContext(ControllerContext, viewResult.View, ViewData, TempData, sw);
                viewResult.View.Render(viewContext, sw);
                return sw.GetStringBuilder().ToString();
            }
        }

        // Menu Strony

        public PartialViewResult GetMenu(string controller, string action)
        {
            if (Session["MenuPartialView"] != null)
            {
                dynamic sessData = Session["MenuPartialView"];
                if (sessData.Controller == controller && sessData.Action == action)
                    return PartialView("_Menu", (List<MenuItem>)sessData.MenuItems);
            }

            var menuItems = new List<MenuItem>();
            var xmlUrl = Server.MapPath("~/MenuItems.xml");

            if (System.IO.File.Exists(xmlUrl) && new FileInfo(xmlUrl).Length > 0)
            {
                //var authuser = GetAuthenticatedUser();

                var actionController = controller + "/" + action;
                var url = Url.Content("~/");
                
                var doc = XDocument.Load(Server.MapPath("~/MenuItems.xml"));
                var root = doc.Element("MenuItems");
                var xDescendants = (root?.Descendants() ?? Enumerable.Empty<XElement>()).ToList();
                
                if (root != null && xDescendants.Count > 0)
                {
                    foreach (var xDesc in xDescendants)
                    {
                        var descAuth = (string)xDesc.Attribute("Authenticated") != null && Convert.ToBoolean(xDesc.Attribute("Authenticated").Value);
                        //if (descAuth && authuser == null)
                        //    continue;

                        var descId = Convert.ToInt32(xDesc.Attribute("Id").Value);
                        if (menuItems.Select(item => item.Id).Any(id => id == descId))
                            continue;

                        var nodNavUrl = xDesc.Attribute("NavigateUrl").Value;
                        while (url.EndsWith("/"))
                            url = url.Substring(0, url.Length - 1);
                        while (nodNavUrl.StartsWith("/") || nodNavUrl.StartsWith("~"))
                            nodNavUrl = nodNavUrl.Substring(1);
                            
                        menuItems.Add(new MenuItem
                        {
                            Id = descId,
                            Text = xDesc.Attribute("Text").Value,
                            NavigateUrl = Url.Content("~/" + nodNavUrl),
                            Checked = nodNavUrl.Equals(actionController),
                            AncestorId =
                                xDesc.Parent != null && xDesc.Parent.Name == "MenuItem"
                                    ? (int?)Convert.ToInt32(xDesc.Parent.Attribute("Id").Value)
                                    : null,
                            Level = xDesc.Ancestors().Count(), // ilość przodków w pionie
                            RequiresAuthentication = descAuth
                        });
                    }

                    var minLvl = menuItems.Select(item => item.Level).Min();
                    foreach (var item in menuItems)
                        item.Level -= minLvl;
                }
            }

            Session["MenuPartialView"] = new { Controller = controller, Action = action, MenuItems = menuItems };
            return PartialView("_Menu", menuItems);
        }

        // Panel Logowania

        public PartialViewResult GetLoginPanel(string controller, string action)
        {
            var userToLogin = GetAuthenticatedUser();
            
            return PartialView(userToLogin != null ? "_LoginPanelLogged" : "_LoginPanel", userToLogin ?? new UserToLoginViewModel());
        }

        public string LoginUser([Bind(Include = "UserName,Password,RememberMe")] UserToLoginViewModel userToLogin)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");
            //Thread.Sleep(5000);

            var user = new User();
            Mapper.Map(userToLogin, user);

            var isAuthenticated = user.Authenticate();
            Mapper.Map(user, userToLogin);

            switch (isAuthenticated)
            {
                case ActionStatus.Success:
                {
                    userToLogin.Id = user.Id;

                    // Zapisz w Sesji
                    Session["LoggedUser"] = userToLogin;
                    
                    // Zapisz w Cookies
                    if (user.RememberMe)
                    {
                        Response.SetCookie(new HttpCookie("LoggedUser")
                        {
                            Value = JsonConvert.SerializeObject(userToLogin),
                            Expires = DateTime.Now.AddDays(30)
                        });
                    }

                    return JsonConvert.SerializeObject(new
                    {
                        LoginMessage = "",
                        PartialView = RenderPartialView("_LoginPanelLogged", userToLogin)
                    });
                }
                case ActionStatus.Failure:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        LoginMessage = $"Niepoprawne Dane. Prób: {4 - user.RetryAttempts}",
                        PartialView = RenderPartialView("_LoginPanel", userToLogin)
                    });
                }
                case ActionStatus.UserDoesNotExist:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        LoginMessage = "Użytkownik nie istnieje",
                        PartialView = RenderPartialView("_LoginPanel", userToLogin)
                    });
                }
                case ActionStatus.AccountNotActivated:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        LoginMessage = "Konto Nieaktywne",
                        PartialView = RenderPartialView("_LoginPanel", userToLogin)
                    });
                }
                case ActionStatus.AccountLocked:
                {
                    int? secondsToUnlock = null;
                    if (user.LockedDateTime != null)
                        secondsToUnlock = (int) (15 * 60 - DateTime.Now.Subtract((DateTime) user.LockedDateTime).TotalSeconds);
                    if (secondsToUnlock < 0)
                        secondsToUnlock = 0;

                    var timeToUnlock = secondsToUnlock != null
                        ? $"{secondsToUnlock / 60:00}" + ":" + $"{secondsToUnlock % 60:00}" // string.Format("{0:00}", secondsToUnlock % 60) 
                        : "błąd";

                    return JsonConvert.SerializeObject(new
                    {
                        LoginMessage = $"Zablokowano. Spróbuj za: {timeToUnlock}",
                        PartialView = RenderPartialView("_LoginPanel", userToLogin)
                    });
                }
                case ActionStatus.DatabaseError:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        LoginMessage = "Baza Danych nie odpowiada",
                        PartialView = RenderPartialView("_LoginPanel", userToLogin)
                    });
                }
                default:
                    throw new ArgumentOutOfRangeException();
            }

        }

        public string Logout()
        {
            // Usuń Sesję
            Session.Remove("LoggedUser");

            // Usuń Cookie
            if (Request.Cookies["LoggedUser"] != null)
            {
                Response.SetCookie(new HttpCookie("LoggedUser")
                {
                    Expires = DateTime.Now.AddDays(-1),
                    Value = null
                });
            }

            return JsonConvert.SerializeObject(new
            {
                PartialView = RenderPartialView("_LoginPanel", new UserToLoginViewModel())
            }); 
        }

        public UserToLoginViewModel GetAuthenticatedUser()
        {
            var userCookie = Request.Cookies["LoggedUser"];
            var userSession = (UserToLoginViewModel)Session["LoggedUser"];
            var user = new User();
            UserToLoginViewModel userToLogin = null;
            if (userSession != null)
                userToLogin = userSession;
            else if (userCookie != null)
                userToLogin = JsonConvert.DeserializeObject<UserToLoginViewModel>(userCookie.Value);

            Mapper.Map(userToLogin, user);
            return user.Authenticate(true) == ActionStatus.Success 
                ? userToLogin 
                : null;
        }
    }

    public enum ActionStatus
    {
        Success = 0,
        Failure = 1,
        DatabaseError = 2,
        AccountLocked = 3,
        AccountNotActivated = 4,
        SendingEmailFailure = 5,
        UserDoesNotExist = 6,
        AccountAlreadyActivated = 7
    }
}
