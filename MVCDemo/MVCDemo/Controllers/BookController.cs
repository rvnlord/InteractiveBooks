using MVCDemo.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace MVCDemo.Controllers
{
    public class BookController : BaseController
    {
        public ActionResult Index(Search search)
        {
            if (!ModelState.IsValid)
                throw new Exception("Model dla 'search' jest nieprawidłowy");

            var requestType = System.Web.HttpContext.Current.Request.HttpMethod;
            var searchOptions = new Search {HowMuchTake = 12};

            var dictDefaultSearchOptions = searchOptions.ToDictionary();
            var dictSessionSearchOptions = GetSearchParamsSession();
            var dictPostedSearchOptions = new Dictionary<string, object>();

            if (requestType == "POST")
            {
                dictPostedSearchOptions.Add("searchTerm", search.SearchTerm);
                dictPostedSearchOptions.Add("includeAuthor", search.IncludeAuthor);
            }

            var dictMergedSearchOptions = dictDefaultSearchOptions;
            if (dictSessionSearchOptions != null && requestType == "GET")
                dictMergedSearchOptions = MergeDictonaries(dictMergedSearchOptions, dictSessionSearchOptions);
            if (requestType == "POST")
                dictMergedSearchOptions = MergeDictonaries(dictMergedSearchOptions, dictPostedSearchOptions);

            SaveSearchParamsSession(dictMergedSearchOptions);
            return View();
        }

        public ActionResult Details(Book book)
        {
            return View();
                // nie bedzie trafiać bo GUIDy generowane przez MySQL są inne, działać będzie dopiero jeśli dodamy bezpośrednio z poziomu aplikacji
        }

        public PartialViewResult GetSearchOptions(string controller, string action)
        {
            var search = new Search {HowMuchTake = 12};

            var dictSearchParams = GetSearchParamsSession();
            if (dictSearchParams != null && dictSearchParams.Count > 0)
            {
                search = new Search(dictSearchParams);
            }

            ViewBag.Controller = controller;
            ViewBag.Action = action;
            return PartialView("_SearchOptions", search);
        }

        public JsonResult GetSearchResults(Search search)
        {
            if (!ModelState.IsValid)
                throw new Exception("Model dla 'search' jest nieprawidłowy");

            bool error;
            string resultsCounter;
            var books = GetBooks(search, out resultsCounter, out error);

            SaveSearchParamsSession(search.ToDictionary());

            if (books.Count <= 0)
            {
                return Json(new
                {
                    ResultsCount = error ? -1 : books.Count,
                    ResultsCounter = resultsCounter,
                    PartialView = string.Empty
                }, JsonRequestBehavior.AllowGet);
            }

            return Json(new
            {
                ResultsCount = books.Count,
                ResultsCounter = resultsCounter,
                PartialView = RenderPartialView("_SearchResults", books)
            }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetScrollSearchResults(Search search, string scrollDirection)
        {
            if (!ModelState.IsValid || !new[] {"scrollup", "scrolldown"}.Contains(scrollDirection.ToLower()))
                throw new Exception(
                    "Model dla 'search' lub Kierunek sortowania przekazany przez Ajax jest nieprawidłowy");

            var sessSearch = new Search((Dictionary<string, object>) Session["SearchParams"]);
            var expectedSearch = new Search(search) {HowMuchSkip = sessSearch.HowMuchSkip};

            if (Session["SearchParams"] == null || !sessSearch.Equals(expectedSearch))
            {
                //throw new Exception("Sesja jest pusta lub nieprawidłowa"); // fallback
                return Json(new
                {
                    ResultsCount = -2, // Sesja jest pusta lub nieprawidłowa
                    PartialView = string.Empty
                }, JsonRequestBehavior.AllowGet);
            }

            var totalSkip = search.HowMuchSkip + sessSearch.HowMuchSkip;
            search.HowMuchSkip = totalSkip;
            var searchWithoutInvertedValues = new Search(search);

            switch (scrollDirection.ToLower())
            {
                case "scrolldown":
                    totalSkip = search.HowMuchSkip + search.HowMuchTake - 2;
                    search.HowMuchSkip = totalSkip;
                    break;
                case "scrollup":
                    totalSkip = search.HowMuchSkip; // dummy, do usunięcia
                    search.HowMuchSkip = totalSkip;
                    break;
                default:
                    throw new Exception("Niepoprawny kierunek przewijania. ");
            }

            search.HowMuchTake = 2;
            bool error;
            string resultsCounter;
            var books = GetBooks(search, out resultsCounter, out error);

            if (books.Count <= 0)
                return Json(new
                {
                    ResultsCount = error ? -1 : books.Count,
                    ResultsCounter = resultsCounter,
                    PartialView = string.Empty
                }, JsonRequestBehavior.AllowGet);

            SaveSearchParamsSession(searchWithoutInvertedValues.ToDictionary());

            // parsować do liczb if scrolldown dodac z dolu scrollup z gory
            resultsCounter = resultsCounter.Trim().Replace(" ", string.Empty);
                // obsługuję resultsCounter tylko jeżeli są wyniki
            var parsedFrom = Convert.ToInt32(resultsCounter.Substring(0, resultsCounter.IndexOf('-')));
            if (scrollDirection.ToLower() == "scrolldown")
                parsedFrom -= 10;
            var parsedTo =
                Convert.ToInt32(resultsCounter.Substring(resultsCounter.LastIndexOf('-') + 1,
                    resultsCounter.IndexOf('z') - resultsCounter.LastIndexOf('-') - 1));
            if (scrollDirection.ToLower() == "scrollup")
                parsedTo += 10;
            var parsedTotal =
                Convert.ToInt32(resultsCounter.Substring(resultsCounter.LastIndexOf('z') + 1,
                    resultsCounter.LastIndexOf('(') - resultsCounter.LastIndexOf('z') - 1));
            var parsedCount =
                Convert.ToInt32(resultsCounter.Substring(resultsCounter.LastIndexOf('(') + 1,
                    resultsCounter.LastIndexOf(')') - resultsCounter.LastIndexOf('(') - 1)) + 10;
            //if (parsedCount < parsedTo - parsedFrom) // obsłużone w bazie danych
            //    parsedTo = parsedFrom + parsedCount;

            resultsCounter = parsedFrom + " - " + parsedTo + " z " + parsedTotal + " (" + parsedCount + ")";

            return Json(new
            {
                ResultsCount = books.Count,
                ResultsCounter = resultsCounter,
                PartialView = RenderPartialView("_SearchResults", books)
            }, JsonRequestBehavior.AllowGet);
        }
    }
}