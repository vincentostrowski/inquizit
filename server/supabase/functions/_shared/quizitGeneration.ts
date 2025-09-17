import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import OpenAI from 'https://esm.sh/openai@4.0.0';
import { QuizitItems, CardData } from './types.ts';
import { SCENARIO_SYSTEM_PROMPT, buildScenarioPrompt, buildScenarioPrompt_PairedCards, REASONING_SYSTEM_PROMPT, buildReasoningPrompt } from './prompts.ts';

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Initialize OpenAI client
function getOpenAIClient() {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
}

// Get seed bundle data for a card
export async function getSeed(cardId: string, seedBundleIndex: number): Promise<{bundleItems: string[], bundleIndex: number}> {
  const supabaseClient = getSupabaseClient();
  // get the seed bundle from the seed_bundles table
  // do this by querying the seed_bundles table for column card_id and bundle_index
  // if the index is greater than 

  try {
    // First, get the total count of bundles for this card
    const { count: totalBundles, error: countError } = await supabaseClient
      .from('seed_bundles')
      .select('*', { count: 'exact', head: true })
      .eq('card_id', cardId);

    if (countError) {
      console.error('Error getting bundle count:', countError);
      throw countError;
    }

    if (!totalBundles || totalBundles === 0) {
      throw new Error(`No seed bundles found for card ${cardId}`);
    }

    // Apply modulo to ensure we stay within bounds
    const actualIndex = seedBundleIndex % totalBundles;
    // Get the bundle at the modulo-adjusted index
    const { data, error } = await supabaseClient
      .from('seed_bundles')
      .select('bundle_items')
      .eq('card_id', cardId)
      .eq('bundle_index', actualIndex)
      .single();

    if (error) {
      console.error('Error getting seed bundle:', error);
      throw error;
    }

    if (!data) {
      throw new Error(`Seed bundle at index ${actualIndex} not found for card ${cardId}`);
    }

    return {
      bundleItems: data.bundle_items,
      bundleIndex: actualIndex
    };

  } catch (error) {
    console.error('Error getting seed:', error);
    throw error;
  }
}

// Get card data with all required fields for quizit generation
export async function getCardData(cardId: string): Promise<CardData> {
  const supabaseClient = getSupabaseClient();
  
  try {
    // Get card data with all required columns
    const { data: cardData, error: cardError } = await supabaseClient
      .from('cards')
      .select('id, card_idea, words_to_avoid, quizit_component_structure, quizit_valid_permutations, banner, title, description')
      .eq('id', cardId)
      .single();

    if (cardError) {
      console.error('Error getting card data:', cardError);
      throw cardError;
    }
      
      return {
        cardId,
        cardIdea: cardData.card_idea || '',
        wordsToAvoid: cardData.words_to_avoid || '',
        quizitComponentStructure: cardData.quizit_component_structure || {},
        quizitValidPermutations: cardData.quizit_valid_permutations || [],
        banner: cardData.banner || '',
        title: cardData.title || '',
        description: cardData.description || '',
      };
  } catch (error) {
    console.error('Error getting card data:', error);
    throw error;
  }
}

// Get indices for a card
export async function getIndicesSingleCard(cardId: string): Promise<{permutationIndex: number, seedBundleIndex: number}> {
  const supabaseClient = getSupabaseClient();
  // get the last quizit that was generated for this card where the card's seed index was used
  // do this by querying the quizits table for column chosen_card_for_seed 
  // if no quizit is found, return { permutationIndex: 0, seedBundleIndex: 0 }
  const { data, error } = await supabaseClient
    .from('quizits')
    .select('permutation_index_1, permutation_index_2, seed_bundle_index, chosen_card_for_seed, card_id_1, card_id_2')
    .or(`card_id_1.eq.${cardId},card_id_2.eq.${cardId}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error getting indices:', error);
    throw error;
  }

  if (!data) {
    return { permutationIndex: 0, seedBundleIndex: 0 };
  }

  if (data.card_id_1 === cardId) {
    return { permutationIndex: data.permutation_index_1 + 1, seedBundleIndex: data.seed_bundle_index + 1 };
  } else {
    return { permutationIndex: data.permutation_index_2 + 1, seedBundleIndex: data.seed_bundle_index + 1 };
  }
}

// Get indices for paired cards - returns the card with lower seed index as chosen card for seed
export async function getIndicesPairedCards(cardId1: string, cardId2: string): Promise<{
  permutationIndex1: number, 
  permutationIndex2: number, 
  seedBundleIndex: number, 
  chosenCardForSeed: string
}> {
  const supabaseClient = getSupabaseClient();
  
  try {
    // Get latest quizit for card1
    const { data: card1Data, error: card1Error } = await supabaseClient
      .from('quizits')
      .select('permutation_index_1, seed_bundle_index')
      .eq('chosen_card_for_seed', cardId1)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (card1Error && card1Error.code !== 'PGRST116') {
      console.error('Error getting card1 indices:', card1Error);
      throw card1Error;
    }

    // Get latest quizit for card2
    const { data: card2Data, error: card2Error } = await supabaseClient
      .from('quizits')
      .select('permutation_index, seed_bundle_index')
      .eq('chosen_card_for_seed', cardId2)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (card2Error && card2Error.code !== 'PGRST116') {
      console.error('Error getting card2 indices:', card2Error);
      throw card2Error;
    }

    // Determine which card has the lower seed index
    const card1SeedIndex = card1Data ? card1Data.seed_bundle_index : -1;
    const card2SeedIndex = card2Data ? card2Data.seed_bundle_index : -1;
    
    let chosenCardForSeed: string;
    let seedBundleIndex: number;

    if (card1SeedIndex < card2SeedIndex) {
      // Card1 has lower seed index, use it as the seed source
      chosenCardForSeed = cardId1;
      seedBundleIndex = card1Data ? card1Data.seed_bundle_index + 1 : 0;
    } else if (card2SeedIndex < card1SeedIndex) {
      // Card2 has lower seed index, use it as the seed source
      chosenCardForSeed = cardId2;
      seedBundleIndex = card2Data ? card2Data.seed_bundle_index + 1 : 0;
    } else {
      // Both have same seed index (including both being -1), default to card1
      chosenCardForSeed = cardId1;
      seedBundleIndex = card1Data ? card1Data.seed_bundle_index + 1 : 0;
    }

    return {
      permutationIndex1: card1Data ? card1Data.permutation_index + 1 : 0,
      permutationIndex2: card2Data ? card2Data.permutation_index + 1 : 0,
      seedBundleIndex,
      chosenCardForSeed
    };

  } catch (error) {
    console.error('Error getting paired card indices:', error);
    throw error;
  }
}

export async function getPermutation(permutations: string[], permutationIndex: number): Promise<{permutation: string, permutationIndex: number}> {
  // If no permutations, throw error
  if (!permutations || permutations.length === 0) {
    throw new Error('No permutations available');
  }

  // Apply modulo to loop back to 0 if index exceeds array length
  const actualIndex = permutationIndex % permutations.length;
  
  return {
    permutation: permutations[actualIndex],
    permutationIndex: actualIndex
  };
}

// Extract scenario components from card data using permutation order
export function extractScenarioComponents(cardData: CardData, permutation: string): string {
  // Split permutation to get component IDs
  const permutationIds = permutation.split(' ');
  
  // Find scenario components in permutation order
  const scenarioComponents = permutationIds
    .map(id => {
      const component = cardData.quizitComponentStructure.components
        .find(comp => comp.id === id && comp.type === 'scenario');
      return component ? component.text : '';
    })
    .filter(text => text !== '')
    .join(', ');
    
  return scenarioComponents;
}

// Extract reasoning components from card data (no permutation needed)
export function extractReasoningComponents(cardData: CardData): string {
  // Get ALL reasoning components regardless of order
  const reasoningComponents = cardData.quizitComponentStructure.components
    .filter(component => component.type === 'reasoning')
    .map(component => component.text)
    .join(', ');
    
  return reasoningComponents;
}

// Generic OpenAI API caller using official SDK
export async function callOpenAI(messages: any[], model: string, temperature: number, maxTokens: number): Promise<string> {
  try {
    const openai = getOpenAIClient();
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
    });
    
    const generatedContent = completion.choices[0]?.message?.content;
    
    if (!generatedContent) {
      throw new Error('No content generated from OpenAI');
    }
    
    return generatedContent;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

// Generate scenario using OpenAI
export async function generateScenario_SingleCard(scenarioComponents: string, wordsToAvoid: string, seedBundle: string[]): Promise<string> {
  try {
    // Build the prompt using the prompts file
    const userPrompt = buildScenarioPrompt(scenarioComponents, wordsToAvoid, seedBundle);
    
    // Call OpenAI API
    const messages = [
      { role: 'system', content: SCENARIO_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ];

    const generatedContent = await callOpenAI(messages, 'gpt-4', 0.7, 500);
    
    if (!generatedContent) {
      throw new Error('No content generated from OpenAI');
    }

    return generatedContent;
  } catch (error) {
    console.error('Error generating scenario:', error);
    throw error;
  }
}

// Generate scenario using OpenAI
export async function generateScenario_PairedCards(scenarioComponents1: string, wordsToAvoid1: string, scenarioComponents2: string, wordsToAvoid2: string, seedBundle: string[]): Promise<string> {
  try {
    const userPrompt = buildScenarioPrompt_PairedCards(scenarioComponents1, wordsToAvoid1, scenarioComponents2, wordsToAvoid2, seedBundle);

    const messages = [
      { role: 'system', content: SCENARIO_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ];

    const generatedContent = await callOpenAI(messages, 'gpt-4', 0.7, 500);
    
    return generatedContent;
  } catch (error) {
    console.error('Error generating scenario:', error);
    throw error;
  }
}

// Generate reasoning using OpenAI
export async function generateReasoning(scenarioComponents: string, reasoningComponents: string, cardIdea: string, generatedScenario: string): Promise<string> {
  try {
    // Build the prompt using the prompts file
    const userPrompt = buildReasoningPrompt(scenarioComponents, reasoningComponents, cardIdea, generatedScenario);
    
    // Call OpenAI API
    const messages = [
      { role: 'system', content: REASONING_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ];

    const generatedContent = await callOpenAI(messages, 'gpt-4', 0.7, 600);
    
    if (!generatedContent) {
      throw new Error('No content generated from OpenAI');
    }

    return generatedContent;
  } catch (error) {
    console.error('Error generating reasoning:', error);
    throw error;
  }
}

// Generate quizit content
export async function generateQuizitContent_SingleCard(cardData: CardData, permutation: string, seedBundle: string[]): Promise<{scenario: string, reasoning: string}> {
  try {
    // Extract components from card data
    const scenarioComponents = extractScenarioComponents(cardData, permutation); // Pass permutation
    const reasoningComponents = extractReasoningComponents(cardData); // No permutation needed
    
    // Generate scenario using OpenAI
    const scenario = await generateScenario_SingleCard(scenarioComponents, cardData.wordsToAvoid, seedBundle);
    
    // Generate reasoning using OpenAI
    const reasoning = await generateReasoning(scenarioComponents, reasoningComponents, cardData.cardIdea, scenario);
    
    return {
      scenario,
      reasoning
    };
  } catch (error) {
    console.error('Error generating quizit content:', error);
    throw error;
  }
}

export async function generateQuizitContent_PairedCards(cardData1: CardData, cardData2: CardData, permutation1: string, permutation2: string, seedBundle: string[]): Promise<{scenario: string, reasoning1: string, reasoning2: string}> {
  try {
    // Extract components from card data
    const scenarioComponents1 = extractScenarioComponents(cardData1, permutation1); // Pass permutation
    const scenarioComponents2 = extractScenarioComponents(cardData2, permutation2); // Pass permutation
    const reasoningComponents1 = extractReasoningComponents(cardData1); // No permutation needed
    const reasoningComponents2 = extractReasoningComponents(cardData2); // No permutation needed
    
    // Generate scenario using OpenAI
    const scenario = await generateScenario_PairedCards(scenarioComponents1, cardData1.wordsToAvoid, scenarioComponents2, cardData2.wordsToAvoid, seedBundle);
    
    // Generate reasoning using OpenAI
    const reasoning1 = await generateReasoning(scenarioComponents1, reasoningComponents1, cardData1.cardIdea, scenario);
    const reasoning2 = await generateReasoning(scenarioComponents2, reasoningComponents2, cardData2.cardIdea, scenario);
    
    return {
      scenario,
      reasoning1, 
      reasoning2
    };

  } catch (error) {
    console.error('Error generating paired quizit content:', error);
    throw error;
  }
}


// Store quizit in database - works for both single and paired cards
export async function storeQuizit(
  cardId1: string, 
  cardId2: string | null, 
  scenario: string, 
  reasoning1: string, 
  reasoning2: string | null,
  permutationIndex1: number, 
  permutationIndex2: number | null,
  seedBundleIndex: number,
  chosenCardForSeed: string
): Promise<string> {
  const supabaseClient = getSupabaseClient();
  
  try {
    const { data, error } = await supabaseClient
      .from('quizits')
      .insert({
        card_id_1: parseInt(cardId1),
        card_id_2: cardId2 ? parseInt(cardId2) : null,
        seed_bundle_index: seedBundleIndex,
        scenario: scenario,
        reasoning1: reasoning1,
        reasoning2: reasoning2,
        card_1_recognition_score: 0.0,
        card_1_reasoning_score: 0.0,
        card_2_recognition_score: cardId2 ? 0.0 : null,
        card_2_reasoning_score: cardId2 ? 0.0 : null,
        chosen_card_for_seed: chosenCardForSeed ? parseInt(chosenCardForSeed) : null,
        permutation_index_1: permutationIndex1,
        permutation_index_2: permutationIndex2,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error storing quizit:', error);
      throw error;
    }

    console.log(`Stored quizit with ID: ${data.id}`);
    return data.id.toString();
  } catch (error) {
    console.error('Error storing quizit:', error);
    throw error;
  }
}


// Generate single card quizit
export async function generateQuizitItems_SingleCard(cardId: string): Promise<QuizitItems> {
  console.log(`Generating single card quizit for card: ${cardId}`);
  
  // Get necessary data to generate quizit
  const cardData = await getCardData(cardId);
  const indices = await getIndicesSingleCard(cardId);
  const seedData = await getSeed(cardId, indices.seedBundleIndex);
  const permutationData = await getPermutation(cardData.quizitValidPermutations, indices.permutationIndex);
  const content = await generateQuizitContent_SingleCard(cardData, permutationData.permutation, seedData.bundleItems);
  // Store in database
  const quizitId = await storeQuizit(
    cardId, 
    null,  // cardId2 for single card
    content.scenario, 
    content.reasoning, 
    null,  // reasoning2 for single card
    permutationData.permutationIndex, 
    null,  // permutationIndex2 for single card
    seedData.bundleIndex,
    cardId   // chosenCardForSeed
  );
  // Return the quizit items for UI
  return [{
    faceType: 'quizit',
    quizitData: {
      quizit: content.scenario,  // Use scenario as the quizit text
      quizitId: quizitId,
    },
  }, 
  {
    faceType: 'concept',
    conceptData: {
      id: cardId,
      banner: cardData.banner,
      title: cardData.title,
      description: cardData.description,
      reasoning: content.reasoning,
      status: 'question',
      recognitionScore: 0.0,
      reasoningScore: 0.0
    }
  }];
}

// Generate paired cards quizit
export async function generateQuizitItems_PairedCards(cardId1: string, cardId2: string): Promise<QuizitItems> {
  console.log(`Generating paired cards quizit for cards: ${cardId1}, ${cardId2}`);
  
  // Get card data for primary card
  const cardData1 = await getCardData(cardId1);
  const cardData2 = await getCardData(cardId2);
  
  // Get indices for primary card
  // must also determine the chosen card for seed
  const indices = await getIndicesPairedCards(cardId1, cardId2);

  let seedData;
  if (indices.chosenCardForSeed === cardId1) {
    seedData = await getSeed(cardId1, indices.seedBundleIndex);
  } else {
    seedData = await getSeed(cardId2, indices.seedBundleIndex);
  }
  const permutationData1 = await getPermutation(cardData1.quizitValidPermutations, indices.permutationIndex1);
  const permutationData2 = await getPermutation(cardData2.quizitValidPermutations, indices.permutationIndex2);

  // Use the chosen card's data for content generation
  const content = await generateQuizitContent_PairedCards(cardData1, cardData2, permutationData1.permutation, permutationData2.permutation, seedData.bundleItems);
  
  // Store quizit with both cards and correct chosen card for seed
  const quizitId = await storeQuizit(
    cardId1, 
    cardId2,  // cardId2 for paired cards
    content.scenario, 
    content.reasoning1, 
    content.reasoning2,
    permutationData1.permutationIndex,  // Use permutation1 for primary card
    permutationData2.permutationIndex,  // Use permutation2 for secondary card
    indices.seedBundleIndex,
    indices.chosenCardForSeed  // chosenCardForSeed (the one with lower seed index)
  );

  // Return the quizit items for UI
  return [{
    faceType: 'quizit',
    quizitData: {
      quizit: content.scenario,  // Use scenario as the quizit text
      quizitId: quizitId,
    },
  }, 
  {
    faceType: 'concept',
    conceptData: {
      id: cardId1,
      banner: cardData1.banner,
      title: cardData1.title,
      description: cardData1.description,
      reasoning: content.reasoning1,
      status: 'question',
      recognitionScore: 0.0,
      reasoningScore: 0.0
    }
  }, 
  {
    faceType: 'concept',
    conceptData: {
      id: cardId2,
      banner: cardData2.banner,
      title: cardData2.title,
      description: cardData2.description,
      reasoning: content.reasoning2,
      status: 'question',
      recognitionScore: 0.0,
      reasoningScore: 0.0
    }
  }
];
}
