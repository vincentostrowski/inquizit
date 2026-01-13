import "jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { generateQuizitItems_PairedCards, generateQuizitItems_SingleCard } from '../_shared/quizitGeneration.ts';
import { redisClient } from '../_shared/redisClient.ts';

interface GetNextSpacedRepetitionQuizitRequest {
  sessionId: string;
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
    const { sessionId }: GetNextSpacedRepetitionQuizitRequest = await req.json();

    if (!sessionId) {
      return new Response(JSON.stringify({
        error: "sessionId is required"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Get authenticated user (needed for fetching initial card state)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), { 
        status: 401,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    const userId = userData.user.id;
    console.log('✅ Authenticated user:', userId);

    // 1. Get session configuration
    const cardIdsStr = await redisClient.get(`quizit-session:${sessionId}:cardIds`);
    const reviewCardIdsStr = await redisClient.get(`quizit-session:${sessionId}:reviewCardIds`);
    const newCardIdsStr = await redisClient.get(`quizit-session:${sessionId}:newCardIds`);
    const theme = await redisClient.get(`quizit-session:${sessionId}:theme`);
    const isPairedMode = await redisClient.get(`quizit-session:${sessionId}:isPairedMode`);

    if (!cardIdsStr && !reviewCardIdsStr && !newCardIdsStr) {
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

    // Parse card IDs (ensure they're strings for consistent comparison)
    // Note: Upstash Redis client auto-deserializes JSON, so data may already be an array
    // Get newCardIds for metadata (isNewCard flag) - needed to determine if a card is new or review
    const parseRedisArray = (data: any): string[] => {
      if (!data) return [];
      const arr = typeof data === 'string' ? JSON.parse(data) : data;
      return arr.map((id: any) => String(id));
    };

    const newCardIds: string[] = parseRedisArray(newCardIdsStr);
    const reviewCardIds: string[] = parseRedisArray(reviewCardIdsStr);
    
    // Use the stored combined ordered list from session creation
    // This list already has the ordering/interleaving applied based on user's configuration:
    // - reviewCardOrder ('ordered' or 'random') was applied when fetching review cards
    // - cardInterleaving ('review-first' or 'interleaved') was applied when combining cards
    // We just need to use this list sequentially via the currentIndex
    let allCardIds: string[] = [];
    if (cardIdsStr) {
      allCardIds = parseRedisArray(cardIdsStr);
      console.log(`📋 Using stored card order (${allCardIds.length} cards) - ordering/interleaving already applied`);
    } else {
      // Fallback: combine review + new (for sessions created before this update)
      // Defaults to review-first ordering
      allCardIds = [...reviewCardIds, ...newCardIds];
      console.log(`📋 Fallback: combining ${reviewCardIds.length} review + ${newCardIds.length} new cards (review-first)`);
    }

    if (allCardIds.length === 0) {
      console.log("❌ No cards available in session");
      return new Response(JSON.stringify({
        error: "No cards available in session"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // 2. Get current index (track progress through session)
    const currentIndexStr = await redisClient.get(`quizit-session:${sessionId}:currentIndex`);
    let currentIndex = currentIndexStr ? parseInt(currentIndexStr) : 0;

    // Check if we've shown all cards
    if (currentIndex >= allCardIds.length) {
      console.log("✅ All cards have been shown - session complete");
      return new Response(JSON.stringify({
        quizitItems: [],
        sessionComplete: true,
        sessionStats: {
          totalCards: allCardIds.length,
          newCardsReviewed: newCardIds.length,
          reviewCardsReviewed: reviewCardIds.length,
        }
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // 3. Select next card sequentially (based on current index)
    const selectedCardId = String(allCardIds[currentIndex]);
    
    // Determine if selected card is new or review (normalize for comparison)
    const isNewCard = newCardIds.map(id => String(id)).includes(selectedCardId);
    
    console.log(`✅ Selected card: ${selectedCardId} (${isNewCard ? 'new' : 'review'})`);

    // 4. Select secondary card if paired mode is enabled
    let secondaryCardId: string | null = null;
    let isSecondaryNewCard = false;
    let nextIndex = currentIndex + 1; // Track how many cards we're using
    
    if (isPairedMode === 'true' && currentIndex + 1 < allCardIds.length) {
      secondaryCardId = String(allCardIds[currentIndex + 1]);
      isSecondaryNewCard = newCardIds.map(id => String(id)).includes(secondaryCardId);
      console.log(`✅ Selected secondary card: ${secondaryCardId} (${isSecondaryNewCard ? 'new' : 'review'})`);
      nextIndex = currentIndex + 2; // Used two cards
    }
    
    // Increment index for next call (after determining how many cards we used)
    await redisClient.setex(`quizit-session:${sessionId}:currentIndex`, 86400, nextIndex.toString());

    // 4.5. Fetch initial states for selected cards (for spaced repetition calculations)
    console.log('📊 Fetching initial card states...');
    const cardIdsToFetch = [parseInt(selectedCardId)];
    if (secondaryCardId) {
      cardIdsToFetch.push(parseInt(secondaryCardId));
    }

    const { data: initialStates, error: initialStatesError } = await supabaseClient
      .from('user_cards')
      .select('card_id, ease_factor, interval_days, repetitions, due, last_reviewed_at, queue')
      .eq('user_id', userId)
      .in('card_id', cardIdsToFetch);

    if (initialStatesError) {
      console.error('❌ Error fetching initial states:', initialStatesError);
      // Don't fail - continue without initial state (backward compatibility)
    }

    // Create map of cardId -> initial state
    const initialStateMap = new Map<string, any>();
    initialStates?.forEach(state => {
      initialStateMap.set(state.card_id.toString(), {
        ease_factor: state.ease_factor,
        interval_days: state.interval_days,
        repetitions: state.repetitions,
        due: state.due,
        last_reviewed_at: state.last_reviewed_at,
        queue: state.queue
      });
    });

    const primaryInitialState = initialStateMap.get(selectedCardId) || null;
    const secondaryInitialState = secondaryCardId ? (initialStateMap.get(secondaryCardId) || null) : null;
    
    console.log(`✅ Fetched initial states: primary=${!!primaryInitialState}, secondary=${!!secondaryInitialState}`);

    // 5. Generate quizit items
    console.log("🎨 Generating quizit content...");
    let quizitItems;
    try {
      if (secondaryCardId) {
        console.log(`🔄 Generating paired quizit for cards: ${selectedCardId} + ${secondaryCardId}`);
        quizitItems = await generateQuizitItems_PairedCards(selectedCardId, secondaryCardId, sessionId, theme || undefined);
      } else {
        console.log(`🔄 Generating single card quizit for: ${selectedCardId}`);
        quizitItems = await generateQuizitItems_SingleCard(selectedCardId, sessionId, theme || undefined);
      }
      console.log(`✅ Generated ${quizitItems.length} quizit items`);
    } catch (error) {
      console.error("❌ Error generating quizit items:", error);
      throw new Error(`Failed to generate quizit items: ${error.message}`);
    }

    // 6. Add metadata to quizit items (isNewCard flag and initialCardState for each concept card)
    // Note: generateQuizitItems functions return conceptData with 'id' field (not 'cardId')
    const quizitItemsWithMetadata = quizitItems.map((item: any) => {
      if (item.faceType === 'concept' && item.conceptData) {
        const cardId = String(item.conceptData.id || item.conceptData.cardId || '');
        const isCardNew = cardId === selectedCardId ? isNewCard : (cardId === secondaryCardId ? isSecondaryNewCard : false);
        
        // Determine which initial state to use
        const initialState = cardId === selectedCardId 
          ? primaryInitialState 
          : (cardId === secondaryCardId ? secondaryInitialState : null);
        
        return {
          ...item,
          conceptData: {
            ...item.conceptData,
            isNewCard: isCardNew,
            initialCardState: initialState  // NEW: Attach initial state
          }
        };
      }
      return item;
    });

    // Calculate remaining cards after this response
    const remainingCards = allCardIds.length - nextIndex;

    return new Response(JSON.stringify({
      quizitItems: quizitItemsWithMetadata,
      sessionComplete: false,
      progress: {
        currentIndex: nextIndex,
        totalCards: allCardIds.length,
        remainingCards: remainingCards,
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error("Error in get-next-spaced-repetition-quizit:", error);
    return new Response(JSON.stringify({
      error: "Failed to get next spaced repetition quizit",
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

