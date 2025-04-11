import { connect } from "https://deno.land/x/redis@v0.30.0/mod.ts";

// Connect to Redis
let redisClient;
try {
  redisClient = await connect({
    hostname: Deno.env.get("REDIS_HOST")!,
    port: Number(Deno.env.get("REDIS_PORT")!),
    password: Deno.env.get("REDIS_PASSWORD"),
    tls: true,
  });
  console.log("Connected to Redis successfully");
} catch (error) {
  console.error("Error connecting to Redis:", error);
  // Optionally, you might want to exit here if the connection is critical
  throw error;
}

export { redisClient };