import "jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts";
import { redisClient } from '../_shared/redisClient.ts';

// Simple interface for card IDs
interface SessionRequest {
  cardIds: string[];
  theme?: string;
  isPairedMode?: boolean;
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

    // Get the request data
    const { cardIds, theme, isPairedMode }: SessionRequest = await req.json();
    
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
    
    // Store theme and mode configuration
    if (theme) {
      await redisClient.setex(`quizit-session:${sessionId}:theme`, 86400, theme);
    }
    if (isPairedMode !== undefined) {
      await redisClient.setex(`quizit-session:${sessionId}:isPairedMode`, 86400, isPairedMode.toString());
    }
    
    // Initialize turn counter
    await redisClient.setex(`quizit-session:${sessionId}:currentTurn`, 86400, "0");
    
    // Initialize card usage tracking for all cards
    for (const cardId of cardIds) {
      await redisClient.hset(`quizit-session:${sessionId}:card:${cardId}`, {
        totalUses: "0",
        recognitionScore: "0.0",
        reasoningScore: "0.0",
        lastUsedTurn: "0"
      });
      // Set expiration for card data
      await redisClient.expire(`quizit-session:${sessionId}:card:${cardId}`, 86400);
    }

    console.log(`Created quizit session ${sessionId} with ${cardIds.length} cards, theme: ${theme || 'none'}, paired mode: ${isPairedMode || false}`);

    return new Response(JSON.stringify({
      sessionId,
      cardCount: cardIds.length,
      theme: theme || null,
      isPairedMode: isPairedMode || false,
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
