import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = CryptoJS.enc.Base64.parse(process.env.ENCRYPTION_KEY);

export function decryptText(encryptedData, ivBase64) {
  try {
    const iv = CryptoJS.enc.Base64.parse(ivBase64);

    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY, {
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
