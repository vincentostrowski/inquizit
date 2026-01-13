import "jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";
import { redisClient } from '../_shared/redisClient.ts';

// Simple interface for spaced repetition session request
interface SpacedRepetitionSessionRequest {
  theme?: string;
  isPairedMode?: boolean;
  reviewCardOrder?: 'ordered' | 'random'; // 'ordered' = earliest due first, 'random' = shuffled
  cardInterleaving?: 'interleaved' | 'review-first'; // 'interleaved' = mix new/review, 'review-first' = all review then all new
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
    // Validate Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({
        error: "Missing or invalid Authorization header"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({
        error: "Missing Supabase configuration"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Create Supabase client with auth token
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Get the user
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({
        error: "Invalid authentication token"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const userId = userData.user.id;

    // Get the request data
    const { theme, isPairedMode, reviewCardOrder = 'ordered', cardInterleaving = 'review-first' }: SpacedRepetitionSessionRequest = await req.json();

    // Get today's date for queries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    // 1. Get daily new card count (to enforce daily limit of 10)
    const { data: dailyReview, error: dailyError } = await supabaseClient
      .from('user_daily_reviews')
      .select('new_cards_reviewed')
      .eq('user_id', userId)
      .eq('review_date', todayDateStr)
      .single();

    if (dailyError && dailyError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching daily review:', dailyError);
      return new Response(JSON.stringify({
        error: "Failed to fetch daily review data"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const dailyNewCardCount = dailyReview?.new_cards_reviewed || 0;
    const newCardsLeft = Math.max(0, 10 - dailyNewCardCount);

    // 2. Fetch review cards (due today or overdue)
    // Note: due column is DATE type, so we can compare directly with date strings
    let reviewCardsQuery = supabaseClient
      .from('user_cards')
      .select('card_id')
      .eq('user_id', userId)
      .not('due', 'is', null)
      .lte('due', todayDateStr); // due <= today (includes overdue cards)
    
    // Apply ordering based on reviewCardOrder setting
    if (reviewCardOrder === 'ordered') {
      reviewCardsQuery = reviewCardsQuery.order('due', { ascending: true }); // Earliest due first
    }
    // If 'random', we'll shuffle after fetching
    
    const { data: reviewCards, error: reviewError } = await reviewCardsQuery;

    if (reviewError) {
      console.error('Error fetching review cards:', reviewError);
      return new Response(JSON.stringify({
        error: "Failed to fetch review cards"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    let reviewCardIds = (reviewCards || []).map(card => card.card_id.toString());
    
    // Shuffle review cards if random order is requested
    if (reviewCardOrder === 'random' && reviewCardIds.length > 0) {
      // Fisher-Yates shuffle
      for (let i = reviewCardIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [reviewCardIds[i], reviewCardIds[j]] = [reviewCardIds[j], reviewCardIds[i]];
      }
    }

    // 3. Fetch new cards (up to daily limit)
    let newCardIds: string[] = [];
    if (newCardsLeft > 0) {
      const { data: newCards, error: newError } = await supabaseClient
        .from('user_cards')
        .select('card_id')
        .eq('user_id', userId)
        .is('due', null) // New cards (not yet reviewed)
        .gte('queue', 0) // Exclude temporary -1 values
        .order('queue', { ascending: true })
        .limit(newCardsLeft);

      if (newError) {
        console.error('Error fetching new cards:', newError);
        return new Response(JSON.stringify({
          error: "Failed to fetch new cards"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
          }
        });
      }

      newCardIds = (newCards || []).map(card => card.card_id.toString());
    }

    // 4. Combine cards based on interleaving setting
    let allCardIds: string[] = [];
    if (cardInterleaving === 'interleaved') {
      // Interleave: alternate between review and new cards
      const maxLength = Math.max(reviewCardIds.length, newCardIds.length);
      for (let i = 0; i < maxLength; i++) {
        if (i < reviewCardIds.length) {
          allCardIds.push(reviewCardIds[i]);
        }
        if (i < newCardIds.length) {
          allCardIds.push(newCardIds[i]);
        }
      }
    } else {
      // Review first: all review cards, then all new cards
      allCardIds = [...reviewCardIds, ...newCardIds];
    }

    // 5. Check if we have any cards available
    const totalCardCount = allCardIds.length;

    if (totalCardCount === 0) {
      return new Response(JSON.stringify({
        error: "No cards available for review"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // 6. Generate session ID
    const sessionId = crypto.randomUUID();

    // 7. Store sessionType in Redis
    await redisClient.setex(`quizit-session:${sessionId}:type`, 86400, 'spaced-repetition');

    // 8. Store card IDs
    // Store the combined ordered list (already interleaved or review-first based on setting)
    await redisClient.setex(`quizit-session:${sessionId}:cardIds`, 86400, JSON.stringify(allCardIds));
    // Also store separately for metadata (isNewCard flag)
    await redisClient.setex(`quizit-session:${sessionId}:newCardIds`, 86400, JSON.stringify(newCardIds));
    await redisClient.setex(`quizit-session:${sessionId}:reviewCardIds`, 86400, JSON.stringify(reviewCardIds));
    await redisClient.setex(`quizit-session:${sessionId}:newCardCount`, 86400, newCardIds.length.toString());
    await redisClient.setex(`quizit-session:${sessionId}:reviewCardCount`, 86400, reviewCardIds.length.toString());
    
    if (theme) {
      await redisClient.setex(`quizit-session:${sessionId}:theme`, 86400, theme);
    }
    if (isPairedMode !== undefined) {
      await redisClient.setex(`quizit-session:${sessionId}:isPairedMode`, 86400, isPairedMode.toString());
    }
    
    // Note: No turn counter needed for spaced-repetition sessions
    // Turn counter is only used in regular sessions for timing-based probabilistic selection

    console.log(`Created spaced repetition session ${sessionId} with ${totalCardCount} cards (${reviewCardIds.length} review, ${newCardIds.length} new), theme: ${theme || 'none'}, paired mode: ${isPairedMode || false}, review order: ${reviewCardOrder}, interleaving: ${cardInterleaving}`);

    return new Response(JSON.stringify({
      sessionId,
      sessionType: 'spaced-repetition',
      cardCount: totalCardCount,
      reviewCardCount: reviewCardIds.length,
      newCardCount: newCardIds.length,
      theme: theme || null,
      isPairedMode: isPairedMode || false,
      message: "Spaced repetition session created successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error("Error creating spaced repetition session:", error);
    return new Response(JSON.stringify({
      error: "Failed to create spaced repetition session",
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

