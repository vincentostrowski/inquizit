import { Redis } from "https://esm.sh/@upstash/redis@1.19.3";

// Connect to Upstash Redis
let redisClient;
try {
  redisClient = new Redis({
    url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
    token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
  });
  console.log("Connected to Upstash Redis successfully");
} catch (error) {
  console.error("Error connecting to Upstash Redis:", error);
  throw error;
}

export { redisClient };
