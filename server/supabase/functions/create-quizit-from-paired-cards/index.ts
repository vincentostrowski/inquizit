import "jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts";
import { generateQuizitItems_PairedCards } from '../_shared/quizitGeneration.ts';
import { QuizitData } from '../_shared/types.ts';

interface CreateQuizitFromPairedCardsRequest {
  cardId1: string;
  cardId2: string;
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
    const { cardId1, cardId2 }: CreateQuizitFromPairedCardsRequest = await req.json();
    
    if (!cardId1 || !cardId2) {
      return new Response(JSON.stringify({
        error: "Both cardId1 and cardId2 are required"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Generate paired cards quizit using shared function
    const quizitData = await generateQuizitItems_PairedCards(cardId1, cardId2);

    return new Response(JSON.stringify({
      message: "Paired cards quizit generated successfully",
      quizitData: quizitData
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error("Error in create-quizit-from-paired-cards:", error);
    return new Response(JSON.stringify({
      error: "Failed to create quizit from paired cards",
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
