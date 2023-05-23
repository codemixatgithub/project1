require('dotenv').config({path: '.env'});
const crypto = require('crypto');
const Crypto_algorithm = 'aes-256-cbc';
const Crypto_key = Buffer.from(process.env.PUBLIC_KEY, 'hex')
const Crypto_iv = crypto.randomBytes(16);
module.exports = {
encrypt:(text)=> {
    let cipher = crypto.createCipheriv(Crypto_algorithm, Buffer.from(Crypto_key), Crypto_iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: Crypto_iv.toString('hex'), encryptedData: encrypted.toString('hex') };
 },
decrypt:(text,crypto_iv)=> {
    let iv = Buffer.from(crypto_iv, 'hex');
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv(Crypto_algorithm, Buffer.from(Crypto_key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
 },
}