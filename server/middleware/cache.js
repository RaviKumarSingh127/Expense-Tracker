const { cacheGet, cacheSet } = require("../config/redis");

const cacheMiddleware = (keyFn, ttl = 300) => async (req, res, next) => {
  const key = typeof keyFn === "function" ? keyFn(req) : keyFn;
  const cached = await cacheGet(key);
  if (cached) {
    return res.json({ success: true, data: cached, cached: true });
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (body?.success && body?.data) {
      cacheSet(key, body.data, ttl);
    }
    return originalJson(body);
  };

  next();
};

module.exports = cacheMiddleware;
