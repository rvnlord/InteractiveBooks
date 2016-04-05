using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Org.BouncyCastle.Crypto.Encodings;
using Org.BouncyCastle.Crypto.Engines;

namespace ConsoleDemo
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var enc = new Encryption();
            var keys = enc.RsaGenerateKeys();

            // Generuj Klucze
            var plainText = "Jerzyki fruwają szybciej od jaskółek.";
            var publicKey = keys.Public;
            var privateKey = keys.Private;

            Console.WriteLine($"Klucz publiczny:\n{publicKey}\n\n" +
                              $"Klucz prywatny:\n{privateKey}\n");

            // Szyfruj
            var encryptedWithPublic = enc.RsaEncryptWithPublic(plainText, publicKey);
            var encryptedWithPrivate = enc.RsaEncryptWithPrivate(plainText, privateKey);

            Console.WriteLine($"Zaszyfrowane kluczem publicznym:\n{encryptedWithPublic}\n\n" +
                              $"Zaszyfrowane kluczem prywatnym:\n{encryptedWithPrivate}\n");

            // Deszyfruj
            var decryptedWithPrivate = enc.RsaDecryptWithPrivate(encryptedWithPublic, privateKey);
            var decryptedWithPublic = enc.RsaDecryptWithPublic(encryptedWithPrivate, publicKey);

            Console.WriteLine($"Odszyfrowane kluczem prywatnym:\n{decryptedWithPrivate}\n\n" +
                              $"Odszyfrowane kluczem publicznym:\n{decryptedWithPublic}\n");

            Console.WriteLine($"Poprawność algorytmu: {(decryptedWithPrivate == decryptedWithPublic && decryptedWithPublic == plainText ? "Poprawny" : "Niepoprawny")}");

            Console.ReadLine();
        }
    }
}
