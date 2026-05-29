const { createClient } = require("redis");
const logger = require("./logger");

let client = null;
let isConnected = false;

const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    logger.warn("REDIS_URL not set — Redis caching disabled");
    return null;
  }

  client = createClient({ url: process.env.REDIS_URL });

  client.on("error", (err) => logger.error("Redis error:", err));
  client.on("connect", () => {
    isConnected = true;
    logger.info("Redis connected");
  });
  client.on("disconnect", () => {
    isConnected = false;
    logger.warn("Redis disconnected");
  });

  await client.connect();
  return client;
};

const getRedis = () => (isConnected ? client : null);

const cacheGet = async (key) => {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
};

const cacheSet = async (key, value, ttlSeconds = 300) => {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // fail silently — cache is non-critical
  }
};

const cacheDel = async (pattern) => {
  const redis = getRedis();
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(keys);
  } catch {
    // fail silently
  }
};

module.exports = { connectRedis, getRedis, cacheGet, cacheSet, cacheDel };
