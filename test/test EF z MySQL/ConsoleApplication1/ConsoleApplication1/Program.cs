using System;
using System.Linq;
using ConsoleApplication1.Models;

namespace ConsoleApplication1
{
    class Program
    {
        static void Main(string[] args)
        {
            var db = new ProjectDbContext();
            var books = db.Books.ToList();
            var users = db.Users.ToList();
            foreach (var b in books)
            {
                Console.WriteLine(b.Id + "\n" 
                    + b.Title + "\n" 
                    + b.Category + "\n" 
                    + b.AdditionDate + "\n" 
                    + users.Single(u => u.Id == b.AuthorId).UserName + "\n");
            }
            Console.ReadLine();
        }
    }
}
