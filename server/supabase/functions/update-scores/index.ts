import "jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts";
import { Redis } from "https://esm.sh/@upstash/redis@1.19.3";

// Interface for score data
interface ScoreData {
  recognitionScore: number;
  reasoningScore: number;
}

interface UpdateScoresRequest {
  sessionId: string;
  quizitId: string;
  cardId1: {
    id: string;
    recognitionScore: number;
    reasoningScore: number;
  };
  cardId2?: {
    id: string;
    recognitionScore: number;
    reasoningScore: number;
  };
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
    
    // Initialize Redis client
    const redisClient = new Redis({
      url: url,
      token: token,
    });

    // Get the request data
    const { sessionId, quizitId, cardId1, cardId2 }: UpdateScoresRequest = await req.json();
    
    // Validate required fields
    if (!sessionId || !quizitId || !cardId1) {
      return new Response(JSON.stringify({
        error: "sessionId, quizitId, and cardId1 are required"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Validate score ranges (0.0 to 1.0)
    const validateScore = (score: number, field: string) => {
      if (score < 0.0 || score > 1.0) {
        throw new Error(`${field} must be between 0.0 and 1.0, got ${score}`);
      }
    };

    validateScore(cardId1.recognitionScore, 'cardId1.recognitionScore');
    validateScore(cardId1.reasoningScore, 'cardId1.reasoningScore');
    
    if (cardId2) {
      validateScore(cardId2.recognitionScore, 'cardId2.recognitionScore');
      validateScore(cardId2.reasoningScore, 'cardId2.reasoningScore');
    }

    // Check if session exists
    const sessionExists = await redisClient.exists(`quizit-session:${sessionId}:cards`);
    if (!sessionExists) {
      return new Response(JSON.stringify({
        error: "Session not found or expired"
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Update card1 scores
    await redisClient.hset(`quizit-session:${sessionId}:card:${cardId1.id}`, {
      recognitionScore: cardId1.recognitionScore.toString(),
      reasoningScore: cardId1.reasoningScore.toString()
    });

    console.log(`Updated scores for card ${cardId1.id}: recognition=${cardId1.recognitionScore}, reasoning=${cardId1.reasoningScore}`);

    // Update card2 scores if provided
    if (cardId2) {
      await redisClient.hset(`quizit-session:${sessionId}:card:${cardId2.id}`, {
        recognitionScore: cardId2.recognitionScore.toString(),
        reasoningScore: cardId2.reasoningScore.toString()
      });

      console.log(`Updated scores for card ${cardId2.id}: recognition=${cardId2.recognitionScore}, reasoning=${cardId2.reasoningScore}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Scores updated successfully",
      updatedCards: cardId2 ? [cardId1.id, cardId2.id] : [cardId1.id]
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error("Error updating scores:", error);
    return new Response(JSON.stringify({
      error: "Failed to update scores",
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
