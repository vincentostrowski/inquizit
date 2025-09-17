import "jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts";
import { generateQuizitItems_SingleCard } from '../_shared/quizitGeneration.ts';
import { QuizitData } from '../_shared/types.ts';

interface CreateQuizitFromSingleCardRequest {
  cardId: string;
}

interface QuizitResponse extends QuizitData {}

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
    const { cardId }: CreateQuizitFromSingleCardRequest = await req.json();
    
    if (!cardId) {
      return new Response(JSON.stringify({
        error: "cardId is required"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Generate single card quizit using shared function
    const quizitData = await generateQuizitItems_SingleCard(cardId);

    return new Response(JSON.stringify({
      message: "Single card quizit generated successfully",
      quizitData: quizitData
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error("Error in create-quizit-from-card:", error);
    return new Response(JSON.stringify({
      error: "Failed to create quizit from card",
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
