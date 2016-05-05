using MVCDemo.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Xml;
using System.Xml.Linq;
using MVCDemo.Common;
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
                catch (Exception)
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
                catch (Exception)
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

        public ActionResult Create()
        {
            return View();
        }

        public string GetXmlBookNodeContent(Guid id, int? nodeNumber, int? choiceParent)
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

                    var bookContent = GetXmlBookContent(book);

                    if (choiceParent != null)
                        ViewBag.ChoiceParentChapter = bookContent[(int)choiceParent].Chapter.Number;
                    else
                        ViewBag.ChoiceParentChapter = null;

                    if (bookContent.Count == 0)
                    {
                        return JsonConvert.SerializeObject(new
                        {
                            PartialView = string.Empty,
                            Message = "Książka nie zawiera żadnej treści do wyświetlenia"
                        });
                    }
                    
                    return JsonConvert.SerializeObject(new
                    {
                        PartialView = RenderPartialView("_BookContentPartDetails", bookContent[nodeNumber ?? bookContent.Root().Id]),
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
                        new { BookContent = GetXmlBookContent(book) },
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

        public string UpdateXmlBookContentForGraph(Guid id, BookContentPart bookContentPart, string operation)
        {
            //Thread.Sleep(3000);
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            using (var db = new ProjectDbContext())
            {
                try
                {
                    var dbBook = db.Books.Single(b => b.Id == id);
                    var authUser = GetAuthenticatedUser();
                    if (authUser == null || authUser.Id != dbBook.AuthorId)
                        return JsonConvert.SerializeObject(new
                        {
                            Message = "Nie jesteś zalogowany lub sesja wygasła",
                            Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                        });

                    dbBook.Author = db.Users.Single(u => u.Id == dbBook.AuthorId);
                    var opChars = operation.ToCharArray();
                    var op = (Crud)Enum.Parse(typeof(Crud), new string (opChars.Take(1).ToArray()).ToUpper() + new string(opChars.Skip(1).ToArray()).ToLower());
                    var bookContent = GetXmlBookContent(dbBook);
                    if (bookContentPart.ParentIds == null)
                        bookContentPart.ParentIds = new List<int>();
                    if (bookContentPart.ChildrenIds == null)
                        bookContentPart.ChildrenIds = new List<int>();
                    bookContentPart.Parents = new List<BookContentPart>();
                    bookContentPart.Children = new List<BookContentPart>();
                    foreach (var part in bookContent)
                    {
                        if (part.ParentIds == null)
                            part.ParentIds = new List<int>();
                        if (part.Parents == null)
                            part.Parents = new List<BookContentPart>();
                        if (part.ChildrenIds == null)
                            part.ChildrenIds = new List<int>();
                        if (part.Children == null)
                            part.Children = new List<BookContentPart>();
                    }
                    foreach (var p in bookContentPart.ParentIds.Select(i => bookContent[i]))
                        bookContentPart.Parents.Add(p);
                    foreach (var c in bookContentPart.ChildrenIds.Select(i => bookContent[i]))
                        bookContentPart.Children.Add(c);

                    if (string.IsNullOrWhiteSpace(bookContentPart.Chapter.Title))
                        bookContentPart.Chapter = new Chapter(bookContentPart.Chapter.Number, "(Brak Tytułu)");
                    if (string.IsNullOrWhiteSpace(bookContentPart.Choice))
                        bookContentPart.Choice = "(Bez Wyboru)";
                    if (string.IsNullOrWhiteSpace(bookContentPart.Description))
                        bookContentPart.Description = "(Brak Opisu)";
                    bookContentPart.Story = string.IsNullOrWhiteSpace(bookContentPart.Story) 
                        ? "(Brak Historii)" 
                        : ParseStoryFromPlainToXml(bookContentPart.Story);

                    var newPart = bookContentPart;
                    BookContentPart oldPart = null;
                    var addedParentsIds = new int[] {};
                    var deletedParentsIds = new int[] {};
                    var addedChildrenIds = new int[] {};
                    var deletedChildrenIds = new int[] {};
                    if (op != Crud.Create)
                    {
                        oldPart = bookContent[bookContentPart.Id];
                        addedParentsIds = (newPart.ParentIds ?? new List<int>()).Except(oldPart.ParentIds ?? new List<int>()).ToArray();
                        deletedParentsIds = (oldPart.ParentIds ?? new List<int>()).Except(newPart.ParentIds ?? new List<int>()).ToArray();
                        addedChildrenIds = (newPart.ChildrenIds ?? new List<int>()).Except(oldPart.ChildrenIds ?? new List<int>()).ToArray();
                        deletedChildrenIds = (oldPart.ChildrenIds ?? new List<int>()).Except(newPart.ChildrenIds ?? new List<int>()).ToArray();
                    }

                    switch (op)
                    {
                        case Crud.Edit:
                            foreach (var apId in addedParentsIds)
                            {
                                bookContent[apId].ChildrenIds.Add(newPart.Id);
                                bookContent[apId].Children.Add(oldPart);
                            }
                            foreach (var dpId in deletedParentsIds)
                            {
                                bookContent[dpId].ChildrenIds.Remove(newPart.Id);
                                bookContent[dpId].Children.Remove(oldPart);
                            }
                            foreach (var acId in addedChildrenIds)
                            {
                                bookContent[acId].ParentIds.Add(newPart.Id);
                                bookContent[acId].Parents.Add(oldPart);
                            }
                            foreach (var dcId in deletedChildrenIds)
                            {
                                bookContent[dcId].ParentIds.Remove(newPart.Id);
                                bookContent[dcId].Parents.Remove(oldPart);
                            }

                            AutoMapperConfiguration.Mapper.Map(newPart, oldPart);
                            break;
                        case Crud.Create:
                            foreach (var p in newPart.Parents)
                            {
                                p.ChildrenIds.Add(newPart.Id);
                                p.Children.Add(newPart);
                            }
                            foreach (var c in newPart.Children)
                            {
                                c.ParentIds.Add(newPart.Id);
                                c.Parents.Add(newPart);
                            }
                            bookContent.Add(newPart);
                            break;
                        case Crud.Delete:
                            foreach (var p in bookContentPart.Parents.Where(p => p.ChildrenIds.Contains(bookContentPart.Id)))
                            {
                                p.ChildrenIds.Remove(bookContentPart.Id);
                                p.Children.Remove(bookContentPart);
                            }
                            bookContent.RemoveAt(bookContentPart.Id);
                            break;
                        default:
                            throw new ArgumentOutOfRangeException();
                    }
                    
                    UpdateXmlBookContent(dbBook, bookContent);
                    
                    return JsonConvert.SerializeObject(new {BookContent = GetXmlBookContent(dbBook)}, new JsonSerializerSettings // nie jest zwracane bookContent modyfikowane w metodzie, bo zmieniam właściwości na wartości xmlowe (jeśli byłby błąd to za pierwszym razem nie wyświetli inaczej niż przy wczytaniu przy użyciu GetXmlBookContent)
                    {
                        ReferenceLoopHandling = ReferenceLoopHandling.Serialize, PreserveReferencesHandling = PreserveReferencesHandling.Objects
                    });
                }
                catch (Exception ex) when (ex is MySqlException || ex is XmlException || ex is IOException)
                {
                    return JsonConvert.SerializeObject(new {Message = "Nie można zaaktualizować treści Książki"});
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public string ParseStoryFromPlainToXml(string story)
        {
            // Akapit
            const string twoSpaces = "  ";
            if (story.StartsWith(twoSpaces))
                story = "[p]" + story.TrimStart();
            story = string.Join("[p]", story.Split(new[] { "\n  " }, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.TrimStart()));
            // Nowe Linie
            story = string.Join("[n]", story.Split(new[] { "\n" }, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.TrimStart()));
            // Gwiazdki
            story = string.Join("[***]", story.Split(new[] { "***" }, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.TrimStart()));

            while (story.Contains("[n][***]"))
                story = story.Replace("[n][***]", "[***]");
            while (story.Contains("[p][***]"))
                story = story.Replace("[p][***]", "[***]");

            return story.Trim();
        }

        public ActionResult ParseStoryFromXmlToHtmlPartial(string story)
        {
            return Content(ParseStoryFromXmlToHtml(story));
        }

        public string ParseStoryFromXmlToHtml(string story)
        {
            // Gwiazdki
            if (story.Contains("[***]"))
            {
                var storyArrRaw = story.Split(new[] {"[***]"}, StringSplitOptions.RemoveEmptyEntries).ToList();
                var storyArr = storyArrRaw.Take(storyArrRaw.Count - 1)
                    .Select(s => $@"{s.TrimStart()}<p class='stars'>***</p>").ToList();
                storyArr.Add(storyArrRaw.Last());
                story = string.Join("", storyArr);
            }
            // Nowe Linie
            if (story.Contains("[n]"))
            {
                story = string.Join("<p>", story.Split(new[] {"[n]"}, StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.TrimStart()));
            }
            // Akapit (bez warunku, bo jesli wynik jest jeden, to też chcę go otoczyć tagiem p)
            if (story.Contains("[p]"))
            {
                var pIndented = "<p class='indented'>";
                var storySplitByP = story.Split(new[] {"[p]"}, StringSplitOptions.None).ToList();
                var storySplitByPNoNulls = storySplitByP.Where(s => !string.IsNullOrEmpty(s)).Select(s => s.TrimStart()).ToList();
                if (storySplitByP.Count > 0 && storySplitByP[0].Length == 0)
                    story = pIndented + string.Join(pIndented, storySplitByPNoNulls);
                else
                    story = string.Join(pIndented, storySplitByPNoNulls);
            }

            story = story.Replace("<p", @"</p><p");
            story = story.Replace("</p></p>", "</p>");
            story = story.Replace("</p><p></p>", "</p>");
            story = story.Replace("</p><p class='indented'></p>", "</p>");
            const string pStart = @"<p>";
            const string pEnd = @"</p>";
            while (story.StartsWith(pEnd))
                story = story.Remove(story.IndexOf(pEnd, StringComparison.Ordinal), pEnd.Length);
            if (!story.StartsWith(pStart))
                story = pStart + story;
            while (story.EndsWith(pStart))
                story = story.Remove(story.LastIndexOf(pStart, StringComparison.Ordinal), pStart.Length);
            if (!story.EndsWith(pEnd))
                story += pEnd;
            
            return story.Trim();
        }

        //public string ParseStoryFromXmlToPlain(string story)
        //{
        //    // Obsługiwane w JS
        //}

        public void UpdateXmlBookContent(Book book, BookContent bookContent)
        {
            var xmlPath = Server.MapPath(book.Path + "/Book.xml");
            var root = new XElement("Book");
            var doc = new XDocument(new XDeclaration("1.0", "utf-8", "yes"), root);   
            root.Add(new XElement("Title", book.Title));
            root.Add(new XElement("Author", book.Author.UserName));
            var xContent = new XElement("Content");
            root.Add(xContent);
            var chapters = bookContent.GetChapters().OrderBy(x => x.Number).ToList();
            foreach (var c in chapters)
            {
                var xChapter = new XElement("Chapter", 
                    new XAttribute("Number", c.Number), 
                    new XAttribute("Title", c.Title));
                xContent.Add(xChapter);
                var chapterNodes = bookContent.GetNodes(c);
                foreach (var n in chapterNodes)
                {
                    var xNode = new XElement("Node", new XAttribute("Id", n.Id));
                    xChapter.Add(xNode);
                    
                    if (n.ParentIds != null)
                        foreach (var pId in n.ParentIds)
                            xNode.Add(new XElement("Parent", pId));
                    xNode.Add(new XElement("Choice", n.Choice));
                    xNode.Add(new XElement("Description", n.Description));
                    xNode.Add(new XElement("Story", n.Story));
                    if (n.ChildrenIds != null)
                        foreach (var cId in n.ChildrenIds)
                            xNode.Add(new XElement("Child", cId));
                }
            }

            doc.Save(xmlPath);
        }

        public BookContent GetXmlBookContent(Book book)
        {
            var bookContent = new BookContent();
            var xmlPath = Server.MapPath(book.Path + "/Book.xml");
            XDocument doc;
            XElement root;

            if (!System.IO.File.Exists(xmlPath))
            {
                root = new XElement("Book");
                doc = new XDocument(new XDeclaration("1.0", "utf-8", "yes"), root);
                root.Add(new XElement("Title", book.Title));
                root.Add(new XElement("Author", book.Author.UserName));
                var xContent = new XElement("Content");
                root.Add(xContent);
                new FileInfo(xmlPath).Directory?.Create();
                doc.Save(xmlPath);
                return bookContent;
            }

            doc = XDocument.Load(xmlPath);
            root = doc.Element("Book");

            if (!string.Equals(root?.Element("Title")?.Value, book.Title, StringComparison.OrdinalIgnoreCase) || !string.Equals(root?.Element("Author")?.Value, book.Author.UserName, StringComparison.OrdinalIgnoreCase))
                throw new XmlException("Autor lub nazwa książki w pliku XML jest niepoprawna");

            var content = root?.Element("Content");
            var chapters = content?.Elements("Chapter");
            if (chapters == null)
                throw new XmlException("Plik XML nie zawiera rozdziałów");
            
            foreach (var chapter in chapters)
            {
                var chapterObj = new Chapter
                {
                    Number = Convert.ToInt32(chapter.Attribute("Number").Value), Title = chapter.Attribute("Title").Value
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
                        Id = Convert.ToInt32(node.Attribute("Id").Value),
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
                        var xParent = root.Descendants("Node").Single(n => Convert.ToInt32(n.Attribute("Id").Value) == parent.Id);
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
                        var xChild = root.Descendants("Node").Single(n => Convert.ToInt32(n.Attribute("Id").Value) == child.Id);
                        xChild.Add(new XElement("Parent", part.Id));
                    }
                }
            }
            doc.Save(xmlPath);

            return bookContent;
        }

        public string UploadCover()
        {
            try
            {
                if (!Request.IsAjaxRequest())
                    throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");
                
                using (var db = new ProjectDbContext())
                {
                    var id = new Guid(Request["id"]);
                    var file = Request.Files[0];
                    var mimeTypes = new[] {"image/bmp", "image/jpeg", "image/x-png", "image/png", "image/gif"};
                    var extensions = new[] { ".bmp", ".jpg", ".jpeg", ".png", ".gif" };
                    if (file == null || file.ContentLength == 0 || file.ContentLength > 2 * 1024 * 1024 || !mimeTypes.Contains(file.ContentType))
                        return JsonConvert.SerializeObject(new
                        {
                            Message = "Wskazany plik jest niepoprawny",
                            Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                        });

                    try
                    {
                        var dbBook = db.Books.Single(b => b.Id == id);
                        var authUser = GetAuthenticatedUser();
                        if (authUser == null || authUser.Id != dbBook.AuthorId)
                            return JsonConvert.SerializeObject(new
                            {
                                Message = "Nie jesteś zalogowany lub nie masz uprawnień",
                                Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                            });

                        var fileName = file.FileName.Split('\\').Last();
                        var extension = $".{fileName.Split('.').Last()}";
                        var pathNoExt = $@"{Server.MapPath(dbBook.Path)}\Cover";
                        var path = $"{pathNoExt}{extension}";

                        foreach (var delPath in extensions.Select(ext => $"{pathNoExt}{ext}").Where(System.IO.File.Exists))
                        {
                            GC.Collect();
                            GC.WaitForPendingFinalizers();
                            var f = new FileInfo(delPath);
                            f.Delete();
                        }

                        file.SaveAs(path);

                        return JsonConvert.SerializeObject(new
                        {
                            Message = "Okładka zaaktualizowana",
                            Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success),
                            Path = System.Web.HttpContext.Current.Server.RelativePath(path, System.Web.HttpContext.Current.Request).Replace("~/", "")
                        });
                    }
                    catch (MySqlException)
                    {
                        return JsonConvert.SerializeObject(new
                        {
                            Message = "Baza Danych nie odpowiada",
                            Status = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError),
                        });
                    }
                    catch (Exception)
                    {
                        return JsonConvert.SerializeObject(new
                        {
                            Message = "Nie można przesłać wskazanego pliku jako okładki",
                            Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                        });
                    }
                    finally
                    {
                        if (db.Database.Connection.State == ConnectionState.Open)
                            db.Database.Connection.Close();
                    }
                }
            }
            catch (Exception ex)
            {
                if (GlobalHelper.IsMaxRequestExceededException(ex))
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Wskazany Plik jest Niepoprawny",
                        Status = Enum.GetName(typeof (ActionStatus), ActionStatus.Failure),
                    });
                }
                throw;
            }
        }

        public string DeleteCover(Guid id)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            using (var db = new ProjectDbContext())
            {
                try
                {
                    var dbBook = db.Books.Single(b => b.Id == id);
                    var authUser = GetAuthenticatedUser();
                    if (authUser == null || authUser.Id != dbBook.AuthorId)
                        return JsonConvert.SerializeObject(new
                        {
                            Message = "Nie jesteś zalogowany lub nie masz uprawnień",
                            Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                        });

                    var pathNoExt = $@"{Server.MapPath(dbBook.Path)}\Cover";

                    var extensions = new[] { ".bmp", ".jpg", ".jpeg", ".png", ".gif" };
                    foreach (var delPath in extensions.Select(ext => $"{pathNoExt}{ext}").Where(System.IO.File.Exists))
                    {
                        GC.Collect();
                        GC.WaitForPendingFinalizers();
                        var f = new FileInfo(delPath);
                        f.Delete();
                    }

                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Okładka została usunięta",
                        Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success)
                    });
                }
                catch (MySqlException)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza Danych nie odpowiada",
                        Status = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError),
                    });
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Błąd, nie można usunąć pliku okładki",
                        Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public string UpdateBook(BookToUpdateViewModel book)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            if (!ModelState.IsValid)
                return JsonConvert.SerializeObject(new
                {
                    Message = ModelState.Values.SelectMany(v => v.Errors.Select(err => err.ErrorMessage)).First(),
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                });

            using (var db = new ProjectDbContext())
            {
                try
                {
                    var dbBook = db.Books.Single(b => b.Id == book.Id);
                    var authUser = GetAuthenticatedUser();
                    if (authUser == null || authUser.Id != dbBook.AuthorId)
                        return JsonConvert.SerializeObject(new
                        {
                            Message = "Nie jesteś zalogowany lub nie masz uprawnień",
                            Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                        });

                    AutoMapperConfiguration.Mapper.Map(book, dbBook);
                    db.SaveChanges();

                    var xmlPath = Server.MapPath(dbBook.Path + "/Book.xml");
                    var doc = XDocument.Load(xmlPath);
                    var root = doc.Element("Book");
                    root?.Element("Title")?.SetValue(book.Title);
                    doc.Save(xmlPath);

                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Książka została zaktualizowana",
                        Status = Enum.GetName(typeof (ActionStatus), ActionStatus.Success)
                    });
                }
                catch (MySqlException)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza Danych nie odpowiada",
                        Status = Enum.GetName(typeof (ActionStatus), ActionStatus.DatabaseError),
                    });
                }
                catch (XmlException)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Błąd zapisu do pliku XML",
                        Status = Enum.GetName(typeof (ActionStatus), ActionStatus.Failure),
                    });
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Błąd, nie udało się zmodyfikować książki",
                        Status = Enum.GetName(typeof (ActionStatus), ActionStatus.Failure),
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public string CreateBook(BookToCreateViewModel book)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            if (!ModelState.IsValid)
                return JsonConvert.SerializeObject(new
                {
                    Message = ModelState.Values.SelectMany(v => v.Errors.Select(err => err.ErrorMessage)).First(),
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                });

            var authUser = GetAuthenticatedUser();
            if (authUser == null)
                return JsonConvert.SerializeObject(new
                {
                    Message = "Nie jesteś zalogowany lub sesja wygasła",
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                });

            using (var db = new ProjectDbContext())
            {
                try
                {
                    var dbBook = new Book();
                    AutoMapperConfiguration.Mapper.Map(book, dbBook);
                    dbBook.AdditionDate = DateTime.Now;
                    dbBook.Id = Guid.NewGuid();
                    dbBook.Path = "~/Data/Books/" + dbBook.Id;
                    dbBook.IsPublic = true;
                    dbBook.AuthorId = db.Users.Single(u => u.Id == authUser.Id).Id;
                    db.Books.Add(dbBook);
                    db.SaveChanges();
                    var controller = ControllerContext.RouteData.Values["controller"].ToString();
                    var path = $"{Url.Content("~/")}{controller}/Edit/{dbBook.Id}"; //$"{Request.ApplicationPath}/{controller}/Edit/{dbBook.Id}"
                    
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Książka Została Dodana",
                        Status = Enum.GetName(typeof (ActionStatus), ActionStatus.Success),
                        Link = path
                    });
                }
                catch (MySqlException)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza Danych nie odpowiada",
                        Status = Enum.GetName(typeof (ActionStatus), ActionStatus.DatabaseError),
                    });
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Błąd, nie udało się dodać książki",
                        Status = Enum.GetName(typeof (ActionStatus), ActionStatus.Failure),
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public string DeleteBook(Guid id)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            var authUser = GetAuthenticatedUser();
            if (authUser == null)
                return JsonConvert.SerializeObject(new
                {
                    Message = "Nie jesteś zalogowany lub sesja wygasła",
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                });

            using (var db = new ProjectDbContext())
            {
                try
                {
                    var dbBook = db.Books.Single(b => b.Id == id);
                    new DirectoryInfo(Server.MapPath(dbBook.Path)).Delete(true);
                    db.Books.Remove(dbBook);
                    db.SaveChanges();
                    
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Książka Została Usunięta",
                        Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success),
                    });
                }
                catch (MySqlException)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza Danych nie odpowiada",
                        Status = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError),
                    });
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Błąd, nie udało się usunąć książki",
                        Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
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

                    return JsonConvert.SerializeObject(authUser != null && authUser.Id == book.AuthorId ? new {PartialView = RenderPartialView("_BookEditOptions", book)} : new {PartialView = string.Empty});
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new {Message = "Baza Danych nie odpowiada"});
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
            return authUser != null && authUser.Id == book.AuthorId ? PartialView("_BookEditOptions", book) : (ActionResult) new EmptyResult();
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
                throw new Exception("Model dla 'search' lub Kierunek sortowania przekazany przez Ajax jest nieprawidłowy");

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
            var parsedTo = Convert.ToInt32(resultsCounter.Substring(resultsCounter.LastIndexOf('-') + 1, resultsCounter.IndexOf('z') - resultsCounter.LastIndexOf('-') - 1));
            if (scrollDirection.ToLower() == "scrollup")
                parsedTo += 10;
            var parsedTotal = Convert.ToInt32(resultsCounter.Substring(resultsCounter.LastIndexOf('z') + 1, resultsCounter.LastIndexOf('(') - resultsCounter.LastIndexOf('z') - 1));
            var parsedCount = Convert.ToInt32(resultsCounter.Substring(resultsCounter.LastIndexOf('(') + 1, resultsCounter.LastIndexOf(')') - resultsCounter.LastIndexOf('(') - 1)) + 10;
            //if (parsedCount < parsedTo - parsedFrom) // obsłużone w bazie danych
            //    parsedTo = parsedFrom + parsedCount;

            resultsCounter = parsedFrom + " - " + parsedTo + " z " + parsedTotal + " (" + parsedCount + ")";

            return Json(new
            {
                ResultsCount = books.Count, ResultsCounter = resultsCounter, PartialView = RenderPartialView("_SearchResults", books)
            }, JsonRequestBehavior.AllowGet);
        }

        public string IsTitleAvailable(string title)
        {
            return IsTitleAvailable(title, new Guid()); // Pusty Guid
        }

        public string IsTitleAvailable(string title, Guid id)
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    var isTitleAvailable = !db.Books.Where(b => b.Id != id).Any(b => b.Title == title);
                    return JsonConvert.SerializeObject(new
                    {
                        Message = isTitleAvailable ? "" : "Tytuł jest już używany",
                        Result = isTitleAvailable ? ActionStatus.Success : ActionStatus.Failure
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

    public enum Crud
    {
        None = 0,
        Edit = 1,
        Create = 2,
        Delete = 3
    }
}