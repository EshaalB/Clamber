const crypto = require('crypto');
const env = require('../../config/env');

const getKey = () => crypto
  .createHash('sha256')
  .update(env.WELLNESS_ENCRYPTION_KEY || env.JWT_ACCESS_SECRET)
  .digest();

const encryptJSON = (payload) => {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.from(JSON.stringify(payload), 'utf8');
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;
};

module.exports = {
  encryptJSON,
};
