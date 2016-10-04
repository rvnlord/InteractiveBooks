using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using MVCDemo.Common;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Encodings;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto.Prng;
using Org.BouncyCastle.OpenSsl;
using Org.BouncyCastle.Pkcs;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.X509;

namespace MVCDemo.Common
{
    public static class Encryption
    {
        // Funkcje Haszujące

        public static string ComputeHash(string plainText, HashAlgorithmType hashAlgorithm, byte[] saltBytes = null)
        {
            // If salt is not specified, generate it.
            if (saltBytes == null)
            {
                // Define min and max salt sizes.
                const int minSaltSize = 4;
                const int maxSaltSize = 8;

                // Generate a random number for the size of the salt.
                var random = new Random();
                var saltSize = random.Next(minSaltSize, maxSaltSize);

                // Allocate a byte array, which will hold the salt.
                saltBytes = new byte[saltSize];

                // Initialize a random number generator.
                var rng = new RNGCryptoServiceProvider();

                // Fill the salt with cryptographically strong byte values.
                rng.GetNonZeroBytes(saltBytes);
            }

            // Convert plain text into a byte array.
            var plainTextBytes = Encoding.UTF8.GetBytes(plainText);

            // Allocate array, which will hold plain text and salt.
            var plainTextWithSaltBytes =
            new byte[plainTextBytes.Length + saltBytes.Length];

            // Copy plain text bytes into resulting array.
            for (var i = 0; i < plainTextBytes.Length; i++)
                plainTextWithSaltBytes[i] = plainTextBytes[i];

            // Append salt bytes to the resulting array.
            for (var i = 0; i < saltBytes.Length; i++)
                plainTextWithSaltBytes[plainTextBytes.Length + i] = saltBytes[i];

            HashAlgorithm hash;

            // Initialize appropriate hashing algorithm class.
            switch (hashAlgorithm)
            {
                case HashAlgorithmType.SHA384:
                    hash = new SHA384Managed();
                    break;
                case HashAlgorithmType.SHA512:
                    hash = new SHA512Managed();
                    break;
                case HashAlgorithmType.MD5:
                    hash = new MD5CryptoServiceProvider();
                    break;
                default:
                    hash = new MD5CryptoServiceProvider();
                    break;
            }

            // Compute hash value of our plain text with appended salt.
            var hashBytes = hash.ComputeHash(plainTextWithSaltBytes);

            // Create array which will hold hash and original salt bytes.
            var hashWithSaltBytes = new byte[hashBytes.Length +
            saltBytes.Length];

            // Copy hash bytes into resulting array.
            for (var i = 0; i < hashBytes.Length; i++)
                hashWithSaltBytes[i] = hashBytes[i];

            // Append salt bytes to the result.
            for (var i = 0; i < saltBytes.Length; i++)
                hashWithSaltBytes[hashBytes.Length + i] = saltBytes[i];

            // Convert result into a base64-encoded string.
            var hashValue = Convert.ToBase64String(hashWithSaltBytes);

            // Return the result.
            return hashValue;
        }

        public static string VerifyHash(string plainText, HashAlgorithmType hashAlgorithm, string hashValue)
        {
            // Convert base64-encoded hash value into a byte array.
            var hashWithSaltBytes = Convert.FromBase64String(hashValue);

            // We must know size of hash (without salt).
            int hashSizeInBits;

            // Size of hash is based on the specified algorithm.
            // Initialize appropriate hashing algorithm class.
            switch (hashAlgorithm)
            {
                case HashAlgorithmType.SHA384:
                    hashSizeInBits = 384;
                    break;
                case HashAlgorithmType.SHA512:
                    hashSizeInBits = 512;
                    break;
                case HashAlgorithmType.MD5:
                    hashSizeInBits = 128;
                    break;
                default:
                    hashSizeInBits = 128;
                    break;
            }

            // Convert size of hash from bits to bytes.
            var hashSizeInBytes = hashSizeInBits / 8;

            // Make sure that the specified hash value is long enough.
            if (hashWithSaltBytes.Length < hashSizeInBytes)
                return string.Empty;

            // Allocate array to hold original salt bytes retrieved from hash.
            var saltBytes = new byte[hashWithSaltBytes.Length - hashSizeInBytes];

            // Copy salt from the end of the hash to the new array.
            for (int i = 0; i < saltBytes.Length; i++)
                saltBytes[i] = hashWithSaltBytes[hashSizeInBytes + i];

            // Compute a new hash string.
            var expectedHashString = ComputeHash(plainText, hashAlgorithm, saltBytes);

            return expectedHashString;
        }

        // RSA - Generowanie Kluczy

        public static AssymetricKeys RsaGenerateKeys()
        {
            var kpgen = new RsaKeyPairGenerator();
            kpgen.Init(new KeyGenerationParameters(new SecureRandom(new CryptoApiRandomGenerator()), 1024));

            var keyPair = kpgen.GenerateKeyPair();

            var pkInfo = PrivateKeyInfoFactory.CreatePrivateKeyInfo(keyPair.Private);
            var privateKey = Convert.ToBase64String(pkInfo.GetDerEncoded());

            var info = SubjectPublicKeyInfoFactory.CreateSubjectPublicKeyInfo(keyPair.Public);
            var publicKey = Convert.ToBase64String(info.GetDerEncoded());

            return new AssymetricKeys { Private = privateKey, Public = publicKey };
        }

        public static AsymmetricCipherKeyPair RsaGenerateKeysRaw()
        {
            var kpgen = new RsaKeyPairGenerator();
            kpgen.Init(new KeyGenerationParameters(new SecureRandom(new CryptoApiRandomGenerator()), 1024));
            return kpgen.GenerateKeyPair();
        }

        // RSA - Szyfrowanie

        public static string RsaEncryptWithPublic(string plainText, string publicKey)
        {
            return RsaEncrypt(plainText, ConvertKeyToPem(publicKey, KeyType.Public));
        }

        public static string RsaEncryptWithPrivate(string plainText, string privateKey)
        {
            return RsaEncrypt(plainText, ConvertKeyToPem(privateKey, KeyType.Private));
        }

        private static string RsaEncrypt(string plainText, string key)
        {
            var bytesToEncrypt = Encoding.Unicode.GetBytes(plainText);
            var encryptEngine = new Pkcs1Encoding(new RsaEngine());

            using (var txtreader = new StringReader(key))
            {
                var keyParameter = (AsymmetricKeyParameter)new PemReader(txtreader).ReadObject();
                encryptEngine.Init(true, keyParameter);
            }

            var encrypted = Convert.ToBase64String(encryptEngine.ProcessBlock(bytesToEncrypt, 0, bytesToEncrypt.Length));
            return encrypted;
        }

        // RSA - Deszyfrowanie

        public static string RsaDecryptWithPrivate(string base64Input, string privateKey)
        {
            return RsaDecrypt(base64Input, ConvertKeyToPem(privateKey, KeyType.Private));
        }

        public static string RsaDecryptWithPublic(string base64Input, string publicKey)
        {
            return RsaDecrypt(base64Input, ConvertKeyToPem(publicKey, KeyType.Public));
        }

        private static string RsaDecrypt(string base64Input, string key)
        {
            var bytesToDecrypt = Convert.FromBase64String(base64Input);
            var decryptEngine = new Pkcs1Encoding(new RsaEngine());

            using (var txtreader = new StringReader(key))
            {
                var keyParameter = (AsymmetricKeyParameter)new PemReader(txtreader).ReadObject();
                decryptEngine.Init(false, keyParameter);
            }

            var decrypted = Encoding.Unicode.GetString(decryptEngine.ProcessBlock(bytesToDecrypt, 0, bytesToDecrypt.Length));
            return decrypted;
        }

        public static string ConvertKeyToPem(string key, KeyType keyType)
        {
            string prepend, append;
            if (keyType == KeyType.Public)
            {
                prepend = "-----BEGIN PUBLIC KEY-----\r\n";
                append = "\r\n-----END PUBLIC KEY-----";
            }
            else
            {
                prepend = "-----BEGIN PRIVATE KEY-----\r\n";
                append = "\r\n-----END PRIVATE KEY-----";
            }

            return $"{prepend}{string.Join("\r\n", key.SplitInParts(64))}{append}";
        }
    }

    public class AssymetricKeys
    {
        public string Public { get; set; }
        public string Private { get; set; }
    }

    public enum HashAlgorithmType
    {
        // ReSharper disable once InconsistentNaming
        SHA384 = 0,
        // ReSharper disable once InconsistentNaming
        SHA512 = 1,
        // ReSharper disable once InconsistentNaming
        MD5 = 2
    }

    public enum KeyType
    {
        Public,
        Private
    }
}