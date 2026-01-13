import { Redis } from '@upstash/redis';
import 'dotenv/config';

let redisClient = null;

try {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("⚠️ Upstash Redis credentials missing in .env");
  } else {
    console.log("🔵 Connecting to Upstash Redis...");

    redisClient = new Redis({
      url,
      token,
    });

    // Run a proper test
    const testConnection = async () => {
      try {
        await redisClient.set("health-check", "ok");
        const result = await redisClient.get("health-check");

        console.log("✅ Upstash Redis connected successfully:", result);
      } catch (err) {
        console.error("❌ Upstash Redis connection failed:", err.message);
      }
    };

    testConnection();
  }

} catch (error) {
  console.error("❌ Redis initialization error:", error.message);
}

export default redisClient;
