using System;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Reflection;
using MySql.Data.Entity;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Xml.Linq;

namespace MVCDemo.Models
{
    //[DbConfigurationType(typeof(MySqlEFConfiguration))]
    public partial class ProjectDbContext : DbContext
    {
        public ProjectDbContext() : base("name=DBCS")
        { }

        public virtual DbSet<Book> Books { get; set; }
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<ActivationRequest> ActivationRequests { get; set; }
        public virtual DbSet<RemindPasswordRequest> RemindPasswordRequests { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            //modelBuilder.Types().Configure(c =>
            //{
            //    var properties = c.ClrType.GetProperties(BindingFlags.NonPublic | BindingFlags.Instance)
            //        .Where(p => p.Name == "IdBinary");
            //    foreach (var p in properties)
            //        c.Property(p).HasColumnName("Id");
            //});

            // Books

            modelBuilder.Entity<Book>()
                .HasKey(e => e.Id)
                .ToTable("tblBooks");

            modelBuilder.Entity<Book>()
                .Property(e => e.Title)
                .IsUnicode(true);

            modelBuilder.Entity<Book>()
                .Property(e => e.Category)
                .IsUnicode(true);

            modelBuilder.Entity<Book>()
                .Property(e => e.Description)
                .IsUnicode(true);

            modelBuilder.Entity<Book>()
                .Property(e => e.Thumbnail)
                .IsUnicode(true);

            // Users

            modelBuilder.Entity<User>()
                .HasKey(e => e.Id)
                .ToTable("tblUsers");

            modelBuilder.Entity<User>()
                .Property(e => e.UserName)
                .IsUnicode(true);

            modelBuilder.Entity<User>()
                .Property(e => e.Password)
                .IsUnicode(true);

            modelBuilder.Entity<User>()
                .Property(e => e.Email)
                .IsUnicode(true);

            modelBuilder.Entity<User>()
                .HasMany(e => e.Books)
                .WithOptional(e => e.Author)
                .HasForeignKey(e => e.AuthorId);

            modelBuilder.Entity<User>()
                .HasMany(e => e.ActivationRequests)
                .WithOptional(e => e.User)
                .HasForeignKey(e => e.UserId);

            modelBuilder.Entity<User>()
                .HasMany(e => e.RemindPasswordRequests)
                .WithOptional(e => e.User)
                .HasForeignKey(e => e.UserId);

            // ActivationRequests

            modelBuilder.Entity<ActivationRequest>()
                .HasKey(e => e.Id)
                .ToTable("tblactivationrequests");

            // RemindPasswordRequests

            modelBuilder.Entity<RemindPasswordRequest>()
                .HasKey(e => e.Id)
                .ToTable("tblremindpasswordRequests");
        }

        protected override DbEntityValidationResult ValidateEntity(DbEntityEntry entityEntry, IDictionary<object, object> items)
        {
            var validationReult = base.ValidateEntity(entityEntry, items);

            if (entityEntry.Entity.GetType() == typeof (User) && validationReult.ValidationErrors.Count > 0)
            {
                var propsToRemove =
                    entityEntry.Entity.GetType().GetProperties()
                        .Where(p => Attribute.IsDefined(p, typeof (NotMappedAttribute)))
                        .SelectMany(p => validationReult.ValidationErrors.Where(err => err.PropertyName == p.Name))
                        .Select(x => x.PropertyName)
                        .Distinct()
                        .ToList();

                var user = (User) entityEntry.Entity;
                if (user.Password.Length > 25)
                    propsToRemove.Add(nameof (user.Password));

                var listErrors =
                    validationReult.ValidationErrors
                        .ToLookup(key => key.PropertyName, val => val)
                        .Where(kvp => propsToRemove.Contains(kvp.Key))
                        .SelectMany(kvp => kvp)
                        .ToList();

                if (listErrors.Count(x => x.PropertyName == nameof(user.Password)) != 1)
                    listErrors.RemoveAll(x => x.PropertyName == nameof(user.Password));

                foreach (var error in listErrors)
                    validationReult.ValidationErrors.Remove(error);
            }

            return validationReult;
        }
    }
}
