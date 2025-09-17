import "jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts";
import { Redis } from "https://esm.sh/@upstash/redis@1.19.3";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Interface for score data
interface ScoreData {
  recognitionScore: number;
  reasoningScore: number;
}

interface UpdateScoresRequest {
  sessionId: string;
  quizitId: string;
  cardId: string;
  recognitionScore: number;
  reasoningScore: number;
}

// Get Supabase client
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  return createClient(supabaseUrl, supabaseServiceKey);
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
    const { sessionId, quizitId, cardId, recognitionScore, reasoningScore }: UpdateScoresRequest = await req.json();
    
    // Validate required fields
    if (!sessionId || !quizitId || !cardId) {
      return new Response(JSON.stringify({
        error: "sessionId, quizitId, and cardId are required"
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

    validateScore(recognitionScore, 'recognitionScore');
    validateScore(reasoningScore, 'reasoningScore');

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

    // Update card scores in Redis
    await redisClient.hset(`quizit-session:${sessionId}:card:${cardId}`, {
      recognitionScore: recognitionScore.toString(),
      reasoningScore: reasoningScore.toString()
    });

    console.log(`Updated Redis scores for card ${cardId}: recognition=${recognitionScore}, reasoning=${reasoningScore}`);

    // Update scores in database
    const supabaseClient = getSupabaseClient();
    
    // Determine which card column to update based on card position
    const updateData: any = {};
    
    // Check if this card is card_id_1 or card_id_2 in the quizit
    const { data: quizitData, error: quizitError } = await supabaseClient
      .from('quizits')
      .select('card_id_1, card_id_2')
      .eq('id', quizitId)
      .single();

    if (quizitError) {
      console.error('Error fetching quizit data:', quizitError);
      return new Response(JSON.stringify({
        error: "Failed to fetch quizit data",
        details: quizitError.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    if (quizitData.card_id_1 === parseInt(cardId)) {
      // Update card_1 scores
      updateData.card_1_recognition_score = recognitionScore;
      updateData.card_1_reasoning_score = reasoningScore;
    } else if (quizitData.card_id_2 === parseInt(cardId)) {
      // Update card_2 scores
      updateData.card_2_recognition_score = recognitionScore;
      updateData.card_2_reasoning_score = reasoningScore;
    } else {
      console.error(`Card ${cardId} not found in quizit ${quizitId}`);
      return new Response(JSON.stringify({
        error: "Card not found in quizit"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Update the quizit record in database
    const { error: updateError } = await supabaseClient
      .from('quizits')
      .update(updateData)
      .eq('id', quizitId);

    if (updateError) {
      console.error('Error updating quizit scores in database:', updateError);
      return new Response(JSON.stringify({
        error: "Failed to update scores in database",
        details: updateError.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    console.log(`Updated database scores for quizit ${quizitId}, card ${cardId}: recognition=${recognitionScore}, reasoning=${reasoningScore}`);

    return new Response(JSON.stringify({
      success: true,
      message: "Scores updated successfully",
      updatedCard: cardId
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
