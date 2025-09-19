import "jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts";
import { Redis } from "https://esm.sh/@upstash/redis@1.19.3";
import { QuizitItem } from '../_shared/types.ts';
import { generateQuizitItems_PairedCards, generateQuizitItems_SingleCard } from '../_shared/quizitGeneration.ts';

interface GetNextQuizitRequest {
  sessionId: string;
  currentCardIds?: string[]; // Cards currently on screen to exclude
}
interface CardUsageData {
  cardId: string;
  totalUses: number;
  recognitionScore: number;
  reasoningScore: number;
  turnsSinceLastUse: number;
}

// Helper function to get session card usage data
async function getSessionCardUsage(redisClient: Redis, sessionId: string, cardIds: string[]): Promise<CardUsageData[]> {
  const cardUsageData: CardUsageData[] = [];
  
  // Get current turn for calculating turns since last use
  const currentTurn = await redisClient.get(`quizit-session:${sessionId}:currentTurn`);
  const turnNumber = parseInt(currentTurn || "0");
  
  for (const cardId of cardIds) {
    const cardData = await redisClient.hgetall(`quizit-session:${sessionId}:card:${cardId}`);
    const lastUsedTurn = parseInt(cardData?.lastUsedTurn || "0");
    
    cardUsageData.push({
      cardId,
      totalUses: parseInt(cardData?.totalUses || "0"),
      recognitionScore: parseFloat(cardData?.recognitionScore || "0.0"), 
      reasoningScore: parseFloat(cardData?.reasoningScore || "0.0"),
      turnsSinceLastUse: turnNumber - lastUsedTurn
    });
  }
  
  return cardUsageData;
}

// Helper function to exclude current cards unless only option
function excludeCurrentCards(cards: CardUsageData[], currentCardIds: string[]): CardUsageData[] {
  if (currentCardIds.length === 0) {
    console.log("No current cards to exclude");
    return cards; // No current cards to exclude
  }
  
  const filteredCards = cards.filter(card => !currentCardIds.includes(card.cardId));
  
  // If no cards left after filtering, return all cards (fallback)
  if (filteredCards.length === 0) {
    console.log(`⚠️ Excluding current cards left no cards available, using all cards`);
    return cards;
  }
  
  console.log(`Excluded ${currentCardIds.length} current cards, ${filteredCards.length} cards available`);
  return filteredCards;
}

// Helper function to check if card is ready based on reasoning score timing (2-3 turns)
function isReasoningReady(card: CardUsageData): boolean {
  // High reasoning score is always ready
  if (card.reasoningScore >= 1.0) {
    return true;
  }
  
  // Low reasoning score needs at least 2 turns
  return card.turnsSinceLastUse >= 2;
}

// Helper function to check if card is ready based on recognition score timing (4-7 turns)
function isRecognitionReady(card: CardUsageData): boolean {
  // High recognition score is always ready
  if (card.recognitionScore >= 1.0) {
    return true;
  }
  
  // Low recognition score needs at least 4 turns
  return card.turnsSinceLastUse >= 4;
}

// Helper function to apply all timing-based filters
function applyTimingFilters(cards: CardUsageData[]): CardUsageData[] {
  const filteredCards = cards.filter(card => {
    // High scores are always available
    if (card.recognitionScore >= 1.0 && card.reasoningScore >= 1.0) {
      return true;
    }
    
    // Check reasoning timing (2-3 turns)
    if (card.reasoningScore < 1.0 && !isReasoningReady(card)) {
      return false;
    }
    
    // Check recognition timing (4-7 turns)
    if (card.recognitionScore < 1.0 && !isRecognitionReady(card)) {
      return false;
    }
    
    return true;
  });
  
  console.log(`Timing filters: ${cards.length} -> ${filteredCards.length} cards available`);
  return filteredCards;
}

// Helper function to calculate weights for probabilistic selection
function calculateCardWeights(cards: CardUsageData[]): {card: CardUsageData, weight: number}[] {
  if (cards.length === 0) {
    return [];
  }
  
  const weightedCards = cards.map(card => {
    let weight = 1.0; // Base weight
    
    // 1. Usage-based weight (inverse relationship)
    // Less used cards get higher weight
    const maxUses = Math.max(...cards.map(c => c.totalUses));
    if (maxUses > 0) {
      const usageRatio = card.totalUses / maxUses;
      weight *= (1.0 - usageRatio) + 0.1; // 0.1 to 1.0 range
    }
    
    // 2. Score-based weight (inverse relationship)
    // Lower scores get higher weight
    const recognitionWeight = (1.0 - card.recognitionScore) + 0.1; // 0.1 to 1.0
    const reasoningWeight = (1.0 - card.reasoningScore) + 0.1; // 0.1 to 1.0
    weight *= (recognitionWeight + reasoningWeight) / 2; // Average of both scores
    
    // 3. Timing bonus (exponential decay)
    // Cards that haven't been used recently get higher weight
    const timingBonus = Math.exp(-card.turnsSinceLastUse / 3.0); // Decay over 3 turns
    weight *= (1.0 + timingBonus);
    
    // 4. Fairness boost for very low usage cards
    if (card.totalUses === 0) {
      weight *= 2.0; // Double weight for unused cards
    }
    
    // 5. Ensure minimum weight to prevent zero probability
    weight = Math.max(weight, 0.01);
    
    return { card, weight };
  });
  
  console.log(`Calculated weights:`, weightedCards.map(w => `${w.card.cardId}:${w.weight.toFixed(3)}`));
  return weightedCards;
}

// Helper function to select a card by weight using weighted random selection
function selectByWeight(weightedCards: {card: CardUsageData, weight: number}[]): CardUsageData | null {
  if (weightedCards.length === 0) {
    return null;
  }
  
  if (weightedCards.length === 1) {
    return weightedCards[0].card;
  }
  
  // Calculate total weight
  const totalWeight = weightedCards.reduce((sum, w) => sum + w.weight, 0);
  
  if (totalWeight === 0) {
    // Fallback to random selection if all weights are 0
    const randomIndex = Math.floor(Math.random() * weightedCards.length);
    return weightedCards[randomIndex].card;
  }
  
  // Generate random number between 0 and totalWeight
  const randomValue = Math.random() * totalWeight;
  
  // Find the card corresponding to this random value
  let currentWeight = 0;
  for (const weightedCard of weightedCards) {
    currentWeight += weightedCard.weight;
    if (randomValue <= currentWeight) {
      console.log(`Selected card ${weightedCard.card.cardId} with weight ${weightedCard.weight.toFixed(3)} (${((weightedCard.weight/totalWeight)*100).toFixed(1)}%)`);
      return weightedCard.card;
    }
  }
  
  // Fallback to last card (shouldn't happen)
  return weightedCards[weightedCards.length - 1].card;
}

// Helper function to select a card probabilistically
function selectCardProbabilistically(cards: CardUsageData[]): CardUsageData | null {
  if (cards.length === 0) {
    return null;
  }
  
  // Calculate weights for all cards
  const weightedCards = calculateCardWeights(cards);
  
  // Select by weight
  return selectByWeight(weightedCards);
}

// Helper function to increment card usage count
async function incrementCardUsage(redisClient: Redis, sessionId: string, cardId: string): Promise<void> {
  try {
    // Get current usage count
    const currentUses = await redisClient.hget(`quizit-session:${sessionId}:card:${cardId}`, 'totalUses');
    const newUses = (parseInt(currentUses || "0") + 1).toString();
    
    // Update usage count
    await redisClient.hset(`quizit-session:${sessionId}:card:${cardId}`, {
      totalUses: newUses
    });
    
    console.log(`Incremented usage for card ${cardId}: ${newUses} total uses`);
  } catch (error) {
    console.error(`Error incrementing usage for card ${cardId}:`, error);
    throw error;
  }
}

// Helper function to get current turn and increment it
async function getAndIncrementTurn(redisClient: Redis, sessionId: string): Promise<number> {
  try {
    // Get current turn
    const currentTurn = await redisClient.get(`quizit-session:${sessionId}:currentTurn`);
    const turnNumber = parseInt(currentTurn || "0");
    
    // Increment turn for next time
    await redisClient.set(`quizit-session:${sessionId}:currentTurn`, (turnNumber + 1).toString());
    
    console.log(`Current turn: ${turnNumber}`);
    return turnNumber;
  } catch (error) {
    console.error(`Error managing turn counter:`, error);
    throw error;
  }
}

// Helper function to update card's last used turn
async function updateCardLastUsedTurn(redisClient: Redis, sessionId: string, cardId: string, turnNumber: number): Promise<void> {
  try {
    await redisClient.hset(`quizit-session:${sessionId}:card:${cardId}`, {
      lastUsedTurn: turnNumber.toString()
    });
    
    console.log(`Updated last used turn for card ${cardId}: ${turnNumber}`);
  } catch (error) {
    console.error(`Error updating last used turn for card ${cardId}:`, error);
    throw error;
  }
}

// Probabilistic card selection with multi-tier filtering and adaptive fallbacks
function selectCardWithProbabilisticSystem(cardUsageData: CardUsageData[], currentCardIds: string[] = []): CardUsageData | null {
  if (cardUsageData.length === 0) {
    console.log("No cards available for selection");
    return null;
  }
  
  console.log(`Starting probabilistic selection with ${cardUsageData.length} total cards`);
  
  // Step 1: Exclude current cards (unless only option)
  const filteredByCurrent = excludeCurrentCards(cardUsageData, currentCardIds);
  console.log(`After excluding current cards: ${filteredByCurrent.length} cards`);
  
  // Step 2: Apply timing-based filters
  const filteredByTiming = applyTimingFilters(filteredByCurrent);
  console.log(`After timing filters: ${filteredByTiming.length} cards`);
  
  // Step 3: Adaptive fallback logic
  let finalCandidates: CardUsageData[];
  
  if (filteredByTiming.length > 0) {
    // Timing filters worked, use the filtered set
    finalCandidates = filteredByTiming;
    console.log("✅ Using timing-filtered cards");
  } else if (filteredByCurrent.length > 0) {
    // Timing filters failed, but current card exclusion worked
    finalCandidates = filteredByCurrent;
    console.log(`⚠️ Fallback: Using pre-timing set`);
  } else {
    // Both filters failed, use all cards (emergency fallback)
    finalCandidates = cardUsageData;
    console.log(`🚨 Emergency fallback: Using all cards`);
  }
  
  console.log(`Final candidates for selection: ${finalCandidates.length} cards`);
  
  // Step 4: Probabilistic selection
  const selectedCard = selectCardProbabilistically(finalCandidates);
  
  if (selectedCard) {
    console.log(`✅ Selected card: ${selectedCard.cardId} (uses: ${selectedCard.totalUses}, recognition: ${selectedCard.recognitionScore}, reasoning: ${selectedCard.reasoningScore}, turns since: ${selectedCard.turnsSinceLastUse})`);
  } else {
    console.log("❌ No card selected");
  }
  
  return selectedCard;
}

// Helper function to select primary card using probabilistic system
function selectPrimaryCard(cardUsageData: CardUsageData[], currentCardIds: string[] = []): CardUsageData | null {
  console.log("🎯 Selecting primary card...");
  return selectCardWithProbabilisticSystem(cardUsageData, currentCardIds);
}

// Helper function to select secondary card using probabilistic system
function selectSecondaryCard(cardUsageData: CardUsageData[], primaryCardId: string, currentCardIds: string[] = []): CardUsageData | null {
  console.log("🎯 Selecting secondary card...");
  
  // Filter out the primary card from available options
  const remainingCards = cardUsageData.filter(card => card.cardId !== primaryCardId);
  
  if (remainingCards.length === 0) {
    console.log(`Secondary card selection: no remaining cards available`);
    return null;
  }
  
  console.log(`Secondary card selection: ${remainingCards.length} cards available after excluding primary card ${primaryCardId}`);
  
  // Use probabilistic system for secondary card selection
  return selectCardWithProbabilisticSystem(remainingCards, currentCardIds);
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
    const { sessionId, currentCardIds }: GetNextQuizitRequest = await req.json();
    console.log("Session ID:", sessionId);
    console.log("Current card IDs:", currentCardIds);
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

    // 1. Validate session exists and get configuration
    const sessionCards = await redisClient.get(`quizit-session:${sessionId}:cards`);
    if (!sessionCards) {
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
    
    // Get theme and mode configuration
    const theme = await redisClient.get(`quizit-session:${sessionId}:theme`);
    const isPairedMode = await redisClient.get(`quizit-session:${sessionId}:isPairedMode`);
    
    console.log("Session cards:", sessionCards);
    console.log("Session theme:", theme || 'none');
    console.log("Session isPairedMode:", isPairedMode);
    
    const cardIds = sessionCards as string[];
    console.log(`Session ${sessionId} has ${cardIds.length} cards:`, cardIds);

    // 2. Get current turn and increment it
    const currentTurn = await getAndIncrementTurn(redisClient, sessionId);

    // 3. Get session card usage data
    const cardUsageData = await getSessionCardUsage(redisClient, sessionId, cardIds);
    console.log("📊 Card usage data retrieved:", cardUsageData.map(card => ({
        cardId: card.cardId,
        totalUses: card.totalUses,
        recognitionScore: card.recognitionScore,
        reasoningScore: card.reasoningScore,
        turnsSinceLastUse: card.turnsSinceLastUse
    })));

    // 4. Select primary card
    console.log("🚀 Starting card selection process...");
    const primaryCard = selectPrimaryCard(cardUsageData, currentCardIds || []);
    if (!primaryCard) {
        console.log("❌ No suitable primary card found");
        return new Response(JSON.stringify({
        error: "No suitable primary card found"
        }), {
        status: 400,
        headers: {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
        }
        });
    }

    console.log(`✅ Primary card selected: ${primaryCard.cardId}`);

    // 5. Select secondary card (only if paired mode is enabled)
    const secondaryCard = isPairedMode 
      ? selectSecondaryCard(cardUsageData, primaryCard.cardId, currentCardIds || [])
      : null;
    console.log(`✅ Secondary card selected: ${secondaryCard?.cardId || 'none (single card quizit)'}`);
    console.log(`🎯 Paired mode: ${isPairedMode ? 'enabled' : 'disabled'}`);

    // 6. Update usage counts and turn tracking for selected cards
    console.log("📈 Updating card usage and turn tracking...");
    await incrementCardUsage(redisClient, sessionId, primaryCard.cardId);
    await updateCardLastUsedTurn(redisClient, sessionId, primaryCard.cardId, currentTurn);
    if (secondaryCard) {
        await incrementCardUsage(redisClient, sessionId, secondaryCard.cardId);
        await updateCardLastUsedTurn(redisClient, sessionId, secondaryCard.cardId, currentTurn);
    }
    console.log("✅ Card usage and turn tracking updated");

    // 7. Determine quizit type
    const isPairedQuizit = secondaryCard !== null;
    const cardId1 = primaryCard.cardId;
    const cardId2 = secondaryCard?.cardId || null;

    console.log(`🎲 Quizit type: ${isPairedQuizit ? 'paired' : 'single'} (mode: ${isPairedMode ? 'paired' : 'single'})`);
    console.log(`📝 Card IDs: ${cardId1}${cardId2 ? ` + ${cardId2}` : ''}`);

    // 8. Generate quizit based on type
    console.log("🎨 Generating quizit content...");
    let quizitItems;
    if (isPairedQuizit) {
      console.log(`🔄 Generating paired quizit for cards: ${cardId1} + ${cardId2}`);
      // Call paired cards function with theme
      quizitItems = await generateQuizitItems_PairedCards(cardId1, cardId2!, sessionId, theme);
    } else {
      console.log(`🔄 Generating single card quizit for: ${cardId1}`);
      // Call single card function with theme
      quizitItems = await generateQuizitItems_SingleCard(cardId1, sessionId, theme);
    }
    console.log(`✅ Generated ${quizitItems.length} quizit items`);

    // TODO: Implement remaining logic
    // 9. Update session state
    // 10. Return complete quizit data

    return new Response(JSON.stringify({
      quizitItems
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error("Error in get-next-quizit:", error);
    return new Response(JSON.stringify({
      error: "Failed to get next quizit",
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
