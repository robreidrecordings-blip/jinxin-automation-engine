const crypto = require('crypto');

const HEADER_NAMES = ['x-api-key', 'authorization'];

function getConfiguredKey() {
  return process.env.JINXIN_API_KEY || '';
}

function extractCredential(req) {
  const apiKey = req.get('x-api-key');
  if (apiKey) return apiKey.trim();

  const authorization = req.get('authorization') || '';
  if (/^Bearer\s+/i.test(authorization)) {
    return authorization.replace(/^Bearer\s+/i, '').trim();
  }

  return '';
}

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function requireApiKey(req, res, next) {
  const configuredKey = getConfiguredKey();

  // Fail closed whenever protected routes are enabled without a credential.
  if (!configuredKey) {
    console.error('Jinxin auth is not configured: JINXIN_API_KEY is missing');
    return res.status(503).json({ error: 'Authentication is not configured' });
  }

  const suppliedCredential = extractCredential(req);
  if (!suppliedCredential || !safeEqual(suppliedCredential, configuredKey)) {
    res.set('WWW-Authenticate', 'Bearer');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.auth = { method: 'api-key' };
  next();
}

module.exports = { requireApiKey, extractCredential, HEADER_NAMES };
