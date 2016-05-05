using System.Diagnostics.CodeAnalysis;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Web;
using System.Xml.Linq;
using MVCDemo.Common;
using MVCDemo.Controllers;
using static MVCDemo.Common.Encryption;

namespace MVCDemo.Models
{
    [Table("project.tblusers")]
    public class User
    {
        [SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public User()
        {
            Books = new HashSet<Book>();
            ActivationRequests = new HashSet<ActivationRequest>();
        }

        public Guid Id { get; set; }
        
        public string UserName { get; set; }

        [StringLength(200)]
        public string Password { get; set; }

        [NotMapped]
        public string ConfirmPassword { get; set; }

        [StringLength(200)]
        public string Email { get; set; }

        [NotMapped]
        public string ActivationEmail { get; set; }

        [NotMapped]
        public string ActivationCode { get; set; }

        [NotMapped]
        public string RemindPasswordEmail { get; set; }

        [NotMapped]
        public string RemindPasswordCode { get; set; }

        [NotMapped]
        public string RemindPasswordOldPassword { get; set; }

        [NotMapped]
        public string RemindPasswordNewPassword { get; set; }

        [NotMapped]
        public string RemindPasswordConfirmPassword { get; set; }

        public DateTime? RegistrationDate { get; set; }

        public int? RetryAttempts { get; set; }

        public int? IsLocked { get; set; }

        public int? IsActivated { get; set; }

        public DateTime? LockedDateTime { get; set; }

        [SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public ICollection<Book> Books { get; set; }

        public ICollection<ActivationRequest> ActivationRequests { get; set; }

        public ICollection<RemindPasswordRequest> RemindPasswordRequests { get; set; }

        [NotMapped]
        public bool RememberMe { get; set; }

        public ActionStatus Authenticate(bool useHash = false)
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    db.Configuration.ValidateOnSaveEnabled = false; // wyłącz walidację pól podczas logowania
                    var dbUsers = db.Users.Where(u => u.UserName.Equals(UserName)).ToList();
                    var dbUserCount = dbUsers.Count;

                    if (dbUserCount < 1)
                        return ActionStatus.UserDoesNotExist;
                    if (dbUserCount > 1)
                        throw new Exception("Istnieje więcej niż jeden użytkownik o podanej nazwie");

                    var dbUser = dbUsers.Single();

                    var password = !useHash ? VerifyHash(Password ?? "", HashAlgorithmType.SHA512, dbUser.Password) : Password;
                    
                    Id = dbUser.Id;
                    UserName = dbUser.UserName;
                    Password = dbUser.Password;
                    Email = dbUser.Email;
                    RegistrationDate = dbUser.RegistrationDate;
                    RetryAttempts = dbUser.RetryAttempts;
                    IsLocked = dbUser.IsLocked;
                    LockedDateTime = dbUser.LockedDateTime;
                    IsActivated = dbUser.IsActivated;

                    if (Convert.ToBoolean(dbUser.IsLocked)) // Konto Zablokowane
                    {
                        int secondsToUnlock;
                        if (LockedDateTime != null)
                            secondsToUnlock = (int) (15 * 60 - DateTime.Now.Subtract((DateTime)LockedDateTime).TotalSeconds);
                        else
                            throw new NullReferenceException();

                        if (secondsToUnlock >= 0)
                            return ActionStatus.AccountLocked;

                        dbUser.IsLocked = 0;
                        dbUser.RetryAttempts = 0;
                        IsLocked = dbUser.IsLocked;
                        RetryAttempts = dbUser.RetryAttempts;
                    }

                    if (!Convert.ToBoolean(dbUser.IsActivated)) // Konto Nieaktywowane
                        return ActionStatus.AccountNotActivated;
                    
                    if (dbUser.Password == password) // Hasło Poprawne i Konto bez flag
                    {
                        dbUser.RetryAttempts = 0;
                        dbUser.IsLocked = 0;
                        IsLocked = dbUser.IsLocked;
                        RetryAttempts = dbUser.RetryAttempts;
                        db.SaveChanges();

                        Password = password;
                        
                        return ActionStatus.Success;
                    }

                    if (dbUser.RetryAttempts == null)
                        dbUser.RetryAttempts = 0;

                    dbUser.RetryAttempts++;
                    RetryAttempts = dbUser.RetryAttempts;

                    if (dbUser.RetryAttempts <= 3) // Hasło Niepoprawne i liczba prób mniejsza lub równa 3
                    {
                        db.SaveChanges();
                        return ActionStatus.Failure;
                    }

                    dbUser.LockedDateTime = DateTime.Now; // Hasło Niepoprawne i liczba prób większa niż 3
                    dbUser.IsLocked = 1;
                    LockedDateTime = dbUser.LockedDateTime;
                    IsLocked = dbUser.IsLocked;
                    db.SaveChanges();
                    db.Configuration.ValidateOnSaveEnabled = true;
                    return ActionStatus.AccountLocked;
                }
                catch (Exception)
                {
                    return ActionStatus.DatabaseError;
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public ActionStatus Register()
        {
            using (var db = new ProjectDbContext())
            {
                var accountCreationTime = DateTime.Now;
                try
                {
                    Id = Guid.NewGuid();
                    UserName = UserName;
                    Password = ComputeHash(Password, HashAlgorithmType.SHA512);
                    Email = Email;
                    ActivationEmail = Email;
                    RegistrationDate = accountCreationTime;
                    IsLocked = 0;
                    IsActivated = 0;
                    LockedDateTime = accountCreationTime;
                    RetryAttempts = null;

                    db.Users.Add(this);
                    db.SaveChanges();

                    return ActionStatus.Success;
                }
                catch (Exception)
                {
                    return ActionStatus.DatabaseError;
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public ActionStatus Activate()
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    var lastReq = db.ActivationRequests.Single(ar => ar.Id.ToString() == ActivationCode);
                    var dbUser = db.Users.Single(u => u.Id == lastReq.UserId);

                    if (Convert.ToBoolean(dbUser.IsActivated))
                        return ActionStatus.AccountAlreadyActivated;

                    dbUser.IsActivated = 1;

                    Id = dbUser.Id;
                    UserName = dbUser.UserName;
                    Password = dbUser.Password;
                    Email = dbUser.Email;
                    RegistrationDate = dbUser.RegistrationDate;
                    IsLocked = dbUser.IsLocked;
                    IsActivated = dbUser.IsActivated;
                    LockedDateTime = dbUser.LockedDateTime;
                    RetryAttempts = dbUser.RetryAttempts;

                    db.ActivationRequests.Remove(lastReq);
                    db.SaveChanges();

                    return ActionStatus.Success;
                }
                catch (Exception)
                {
                    return ActionStatus.DatabaseError;
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public ActionStatus SendActivationLink()
        {
            using (var db = new ProjectDbContext())
            {
                var activationTime = DateTime.Now;
                var activationRequestGuid = Guid.NewGuid();

                try
                {
                    var dbUser = db.Users.Single(u => u.Email == ActivationEmail);
                    if (Convert.ToBoolean(dbUser.IsActivated))
                        return ActionStatus.AccountAlreadyActivated;

                    Id = dbUser.Id;
                    UserName = dbUser.UserName;
                    Email = dbUser.Email;

                    var sbEmailBody = new StringBuilder();
                    sbEmailBody.Append("Witaj Użytkowniku: " + UserName + ",<br/><br/>");
                    sbEmailBody.Append("Poprosiłeś o aktywację konta na naszej stronie. Aktywacji możesz dokonać poprzez wpisanie Kodu Atywacyjnego na stronie Rejestracji.");
                    sbEmailBody.Append("<br/><br/>");
                    sbEmailBody.Append("Twój Kod Aktywacyjny:");
                    sbEmailBody.Append("<br/>");
                    sbEmailBody.Append("<b>" + activationRequestGuid + "</b>");
                    sbEmailBody.Append("<br/><br/>");
                    sbEmailBody.Append("Pozdrawiamy");
                    sbEmailBody.Append("<br/>");
                    sbEmailBody.Append("Strona Interaktywne Książki");

                    var sendEmailResult = SendEmail("Interaktywne Książki - Aktywacja Konta", sbEmailBody.ToString());

                    if (sendEmailResult == ActionStatus.SendingEmailFailure)
                        return sendEmailResult;
                    
                    db.ActivationRequests.Add(new ActivationRequest()
                    {
                        Id = activationRequestGuid,
                        UserId = Id,
                        ActivationRequestDateTime = activationTime
                    });
                    db.SaveChanges();

                    return ActionStatus.Success;
                }
                catch (Exception)
                {
                    return ActionStatus.DatabaseError;
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public ActionStatus RemindPassword()
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    var lastReq = db.RemindPasswordRequests.Single(ar => ar.Id.ToString() == RemindPasswordCode);
                    var dbUser = db.Users.Single(u => u.Id == lastReq.UserId);

                    dbUser.Password = Encryption.ComputeHash(RemindPasswordNewPassword, HashAlgorithmType.SHA512);

                    AutoMapperConfiguration.Mapper.Map(dbUser, this);

                    db.RemindPasswordRequests.Remove(lastReq);
                    db.SaveChanges();

                    return ActionStatus.Success;
                }
                catch (Exception)
                {
                    return ActionStatus.DatabaseError;
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public ActionStatus SendRemindPasswordRequest()
        {
            using (var db = new ProjectDbContext())
            {
                var vaerificationTime = DateTime.Now;
                var varificationRequestGuid = Guid.NewGuid();

                try
                {
                    var dbUser = db.Users.Single(u => u.Email == RemindPasswordEmail);

                    AutoMapperConfiguration.Mapper.Map(dbUser, this);

                    var sbEmailBody = new StringBuilder();
                    sbEmailBody.Append("Witaj Użytkowniku: " + UserName + ",<br/><br/>");
                    sbEmailBody.Append("Poniżej znajdziesz kod weryfikacyjny do zmiany Hasła dla Twojego konta na naszej stronie:");
                    sbEmailBody.Append("<br/><br/>");
                    sbEmailBody.Append("Twój Kod Weryfikacyjny:");
                    sbEmailBody.Append("<br/>");
                    sbEmailBody.Append("<b>" + varificationRequestGuid + "</b>");
                    sbEmailBody.Append("<br/><br/>");
                    sbEmailBody.Append("Pozdrawiamy");
                    sbEmailBody.Append("<br/>");
                    sbEmailBody.Append("Strona Interaktywne Książki");

                    var sendEmailResult = SendEmail("Interaktywne Książki - Zmiana Hasła", sbEmailBody.ToString());

                    if (sendEmailResult == ActionStatus.SendingEmailFailure)
                        return sendEmailResult;

                    db.RemindPasswordRequests.Add(new RemindPasswordRequest()
                    {
                        Id = varificationRequestGuid,
                        UserId = Id,
                        RemindPasswordRequestDateTime = vaerificationTime
                    });
                    db.SaveChanges();

                    return ActionStatus.Success;
                }
                catch (Exception)
                {
                    return ActionStatus.DatabaseError;
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        private ActionStatus SendEmail(string emailSubject, string emailBody)
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    var dbPrivateKey = db.Keys.Single(k => k.Id == "email_private");
                    var dbPublicKey = db.Keys.Single(k => k.Id == "email_public");
                    var privateKey = dbPrivateKey.Value;

                    //var xmlPath = HttpContext.Current.Server.MapPath("~/Data/Email.xml");
                    var xmlPath = $@"{AppDomain.CurrentDomain.BaseDirectory}\Data\Email.xml";
                    
                    var doc = XDocument.Load(xmlPath);
                    var smtp = doc.Element("smtp");
                    var network = smtp?.Element("network");

                    var host = network?.Attribute("host").Value;
                    var port = Convert.ToInt32(network?.Attribute("port").Value);
                    var address = smtp?.Attribute("from").Value ?? "";
                    var userName = network?.Attribute("userName").Value;
                    var password = RsaDecryptWithPrivate(network?.Attribute("password").Value, privateKey);
                    var enableSsl = network?.Attribute("enableSsl").Value;

                    var keys = RsaGenerateKeys();
                    network?.SetAttributeValue("password", RsaEncryptWithPublic(password, keys.Public));
                    doc.Save(xmlPath);

                    dbPrivateKey.Value = keys.Private;
                    dbPublicKey.Value = keys.Public;
                    db.SaveChanges();

                    var mailMessage = new MailMessage(address, Email)
                    {
                        IsBodyHtml = true,
                        Body = emailBody,
                        Subject = emailSubject
                    };

                    var smtpClient = new SmtpClient(host, port)
                    {
                        Credentials = new NetworkCredential()
                        {
                            UserName = userName,
                            Password = password
                        },
                        EnableSsl = Convert.ToBoolean(enableSsl)
                    };

                    smtpClient.Send(mailMessage);
                    return ActionStatus.Success;
                }
                catch (Exception)
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                    return ActionStatus.SendingEmailFailure;
                }
            }
        }
    }
}
