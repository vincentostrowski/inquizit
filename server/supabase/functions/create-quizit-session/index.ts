import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Redis } from "https://esm.sh/@upstash/redis@1.19.3";

// Simple interface for card IDs
interface CardIdsRequest {
  cardIds: string[];
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      } 
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method Not Allowed"
    }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  try {
    // Get and clean environment variables
    const rawUrl = Deno.env.get("UPSTASH_REDIS_REST_URL");
    const rawToken = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");
    
    if (!rawUrl || !rawToken) {
      throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables");
    }
    
    // Remove quotes if present
    const url = rawUrl.replace(/^"(.*)"$/, '$1');
    const token = rawToken.replace(/^"(.*)"$/, '$1');
    
    console.log("Redis URL:", url);
    console.log("Redis Token length:", token.length);
    
    // Initialize Redis client
    const redisClient = new Redis({
      url: url,
      token: token,
    });

    // Get the request data
    const { cardIds }: CardIdsRequest = await req.json();
    
    if (!cardIds || !Array.isArray(cardIds)) {
      return new Response(JSON.stringify({
        error: "cardIds is required and must be an array"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    if (cardIds.length === 0) {
      return new Response(JSON.stringify({
        error: "No cards selected"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Generate session ID
    const sessionId = crypto.randomUUID();

    // Store in Redis with expiration (24 hours)
    await redisClient.setex(`quizit-session:${sessionId}:cards`, 86400, JSON.stringify(cardIds));
    await redisClient.setex(`quizit-session:${sessionId}:created-at`, 86400, Date.now().toString());

    console.log(`Created quizit session ${sessionId} with ${cardIds.length} cards`);

    return new Response(JSON.stringify({
      sessionId,
      cardCount: cardIds.length,
      message: "Quizit session created successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error("Error creating quizit session:", error);
    return new Response(JSON.stringify({
      error: "Failed to create quizit session",
      details: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
});
