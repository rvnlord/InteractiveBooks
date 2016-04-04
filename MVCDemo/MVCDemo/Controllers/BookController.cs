using MVCDemo.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Web.Mvc;
using System.Xml;
using System.Xml.Linq;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;

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

        public ActionResult Details(Guid id)
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    var book = db.Books.Single(b => b.Id == id);
                    book.Author = db.Users.Single(u => u.Id == book.AuthorId);

                    return View(book);
                }
                catch (Exception ex)
                {
                    return Content("Baza Danych nie odpowiada");
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public ActionResult Edit(Guid id)
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    var book = db.Books.Single(b => b.Id == id);
                    book.Author = db.Users.Single(u => u.Id == book.AuthorId);

                    return View(book);
                }
                catch (Exception ex)
                {
                    return Content("Baza Danych nie odpowiada");
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public string GetXmlBookNodeContent(Guid id, int nodeNumber, int? choiceParent)
        {
            //Thread.Sleep(3000);
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            using (var db = new ProjectDbContext())
            {
                try
                {
                    var book = db.Books.Single(b => b.Id == id);
                    book.Author = db.Users.Single(u => u.Id == book.AuthorId);

                    var bookContent = GetBookContent(book);

                    if (choiceParent != null)
                        ViewBag.ChoiceParentChapter = bookContent[(int)choiceParent].Chapter.Number;
                    else
                        ViewBag.ChoiceParentChapter = null;

                    return JsonConvert.SerializeObject(new
                    {
                        PartialView = RenderPartialView("_BookContentPartDetails", bookContent[nodeNumber]),
                        Message = string.Empty
                    });
                }
                catch (Exception ex) when (ex is MySqlException || ex is XmlException || ex is IOException)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        PartialView = string.Empty,
                        Message = "Nie można pobrać poprawnej treści Książki"
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public string GetXmlBookContentForGraph(Guid id)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            using (var db = new ProjectDbContext())
            {
                try
                {
                    var book = db.Books.Single(b => b.Id == id);
                    book.Author = db.Users.Single(u => u.Id == book.AuthorId);
                    return JsonConvert.SerializeObject(
                        new { BookContent = GetBookContent(book) },
                        new JsonSerializerSettings
                        {
                            ReferenceLoopHandling = ReferenceLoopHandling.Serialize,
                            PreserveReferencesHandling = PreserveReferencesHandling.Objects
                        }
                    );
                }
                catch (Exception ex) when (ex is MySqlException || ex is XmlException || ex is IOException)
                {
                    return JsonConvert.SerializeObject( new { Message = "Nie można pobrać poprawnej treści Książki" });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public BookContent GetBookContent(Book book)
        {
            var xmlPath = Server.MapPath(book.Path + "/Book.xml");
            var doc = XDocument.Load(xmlPath);
            var root = doc.Element("Book");

            if (!string.Equals(root?.Element("Title")?.Value, book.Title, StringComparison.OrdinalIgnoreCase) ||
                !string.Equals(root?.Element("Author")?.Value, book.Author.UserName, StringComparison.OrdinalIgnoreCase))
                throw new XmlException("Autor lub nazwa książki w pliku XML jest niepoprawna");

            var content = root?.Element("Content");
            var chapters = content?.Elements("Chapter");
            if (chapters == null)
                throw new XmlException("Plik XML nie zawiera rozdziałów");

            var bookContent = new BookContent();

            foreach (var chapter in chapters)
            {
                var chapterObj = new Chapter
                {
                    Number = Convert.ToInt32(chapter.Attribute("Number").Value),
                    Title = chapter.Attribute("Title").Value
                };

                foreach (var node in chapter.Elements("Node"))
                {
                    var xParents = node.Elements("Parent").ToList();
                    List<int> parentIds = null;
                    if (xParents.Any())
                        parentIds = xParents.Select(x => Convert.ToInt32(x.Value)).ToList();

                    var xChildren = node.Elements("Child").ToList();
                    List<int> childrenIds = null;
                    if (xChildren.Any())
                        childrenIds = xChildren.Select(x => Convert.ToInt32(x.Value)).ToList();

                    var description = node.Element("Description")?.Value;
                    if (string.IsNullOrWhiteSpace(description))
                        description = "-";
                    var choice = node.Element("Choice")?.Value;
                    if (string.IsNullOrWhiteSpace(choice))
                        choice = "-";
                    var story = node.Element("Story")?.Value;
                    if (string.IsNullOrWhiteSpace(story))
                        story = "-";

                    bookContent.Add(new BookContentPart
                    {
                        Id = Convert.ToInt32(node.Attribute("id").Value),
                        ParentIds = parentIds,
                        ChildrenIds = childrenIds,
                        Chapter = chapterObj,
                        Choice = choice.Trim(),
                        Story = story.Trim(),
                        Description = description.Trim()
                    });
                }
            }

            foreach (var part in bookContent)
            {
                var parIds = part.ParentIds;
                if (parIds != null)
                {
                    part.Parents = parIds.Select(i => bookContent[i]).ToList();

                    foreach (var parent in part.Parents.Where(parent => parent.ChildrenIds == null || !parent.ChildrenIds.Contains(part.Id)))
                    {
                        if (parent.ChildrenIds == null)
                            parent.ChildrenIds = new List<int>();

                        if (parent.Children == null)
                            parent.Children = new List<BookContentPart>();

                        parent.ChildrenIds.Add(part.Id);
                        parent.Children.Add(part);
                        var xParent = root.Descendants("Node").Single(n => Convert.ToInt32(n.Attribute("id").Value) == parent.Id);
                        xParent.Add(new XElement("Child", part.Id));
                    }
                }

                var chilIds = part.ChildrenIds;
                if (chilIds != null)
                {
                    part.Children = chilIds.Select(i => bookContent[i]).ToList();

                    foreach (var child in part.Children.Where(child => child.ParentIds == null || !child.ParentIds.Contains(part.Id)))
                    {
                        if (child.ParentIds == null)
                            child.ParentIds = new List<int>();

                        if (child.Parents == null)
                            child.Parents = new List<BookContentPart>();

                        child.ParentIds.Add(part.Id);
                        child.Parents.Add(part);
                        var xChild = root.Descendants("Node").Single(n => Convert.ToInt32(n.Attribute("id").Value) == child.Id);
                        xChild.Add(new XElement("Parent", part.Id));
                    }
                }
            }
            doc.Save(xmlPath);

            return bookContent;
        }

        public string GetBookEditOptionsAjax(Guid id)
        {
            using (var db = new ProjectDbContext())
            {
                if (!Request.IsAjaxRequest())
                    throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

                try
                {
                    var book = db.Books.Single(b => b.Id == id);
                    var authUser = GetAuthenticatedUser();

                    return JsonConvert.SerializeObject(authUser != null && authUser.Id == book.AuthorId
                        ? new { PartialView = RenderPartialView("_BookEditOptions", book) }
                        : new { PartialView = string.Empty });
                }
                catch (Exception ex)
                {
                    return JsonConvert.SerializeObject(new { PartialView ="Baza Danych nie odpowiada"});
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public ActionResult GetBookEditOptions(Book book)
        {
            var authUser = GetAuthenticatedUser();
            return authUser != null && authUser.Id == book.AuthorId
                ? PartialView("_BookEditOptions", book)
                : (ActionResult) new EmptyResult();
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