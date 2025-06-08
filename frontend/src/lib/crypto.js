import CryptoJS from 'crypto-js';
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;
const DECRYPTION_KEY = CryptoJS.enc.Base64.parse(ENCRYPTION_KEY);

// AES-GCM-like encryption using CryptoJS (frontend-compatible)
export function encryptText(plainText) {
  const key = CryptoJS.enc.Base64.parse(ENCRYPTION_KEY);
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    data: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
    iv: iv.toString(CryptoJS.enc.Base64),
  };
}


export function decryptText(encryptedData, ivBase64) {
  try {
    const iv = CryptoJS.enc.Base64.parse(ivBase64);

    const decrypted = CryptoJS.AES.decrypt(encryptedData, DECRYPTION_KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error("Decryption failed:", err.message);
    return "[DECRYPTION_FAILED]";
  }
}
