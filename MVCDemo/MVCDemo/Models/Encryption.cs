using System;
using System.Text;
using System.Security.Cryptography;

namespace MVCDemo.Models
{
    public class Encryption
    {
        public static string ComputeHash(string plainText, HashAlgorithmType hashAlgorithm, byte[] saltBytes = null)
        {
            // If salt is not specified, generate it.
            if (saltBytes == null)
            {
                // Define min and max salt sizes.
                const int minSaltSize = 4;
                const int maxSaltSize = 8;

                // Generate a random number for the size of the salt.
                Random random = new Random();
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

            // Make sure hashing algorithm name is specified.
            //if (hashAlgorithm == null)
            //    hashAlgorithm = "";

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

            // Make sure that hashing algorithm name is specified.
            //if (hashAlgorithm == null)
            //    hashAlgorithm = "";

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
                //return false;
                return string.Empty;
            
            // Allocate array to hold original salt bytes retrieved from hash.
            var saltBytes = new byte[hashWithSaltBytes.Length - hashSizeInBytes];

            // Copy salt from the end of the hash to the new array.
            for (int i = 0; i < saltBytes.Length; i++)
                saltBytes[i] = hashWithSaltBytes[hashSizeInBytes + i];

            // Compute a new hash string.
            var expectedHashString = ComputeHash(plainText, hashAlgorithm, saltBytes);

            // If the computed hash matches the specified hash,
            // the plain text value must be correct.
            //return (hashValue == expectedHashString);

            return expectedHashString;
        }

    }

    public enum HashAlgorithmType
    {
        SHA384 = 0,
        SHA512 = 1,
        MD5 = 2
    }
}