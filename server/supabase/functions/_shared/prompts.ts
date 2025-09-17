// Quizit generation prompts

export const SCENARIO_SYSTEM_PROMPT = `You write one short scenario ("quizit") to test concept(s).
Priorities: 1) Follow constraints, 2) Be concise.
Rules:
- Second person ("you…").
- Preserve given item ORDER, the order of the items should be how they appear in the scenario; combine only consecutive items.
- ≤1 sentence per item (fewer allowed via combining). 
- No filler, no labels.
- Treat banned phrases as case-insensitive; avoid inflections/near-variants.`;

export const SCENARIO_USER_PROMPT_TEMPLATE = `You write one short scenario ("quizit") to test a concept.
Priorities: 1) Follow constraints, 2) Be concise.
Rules:
- Second person ("you…").
- Preserve given item ORDER, the order of the items should be how they appear in the scenario; combine only consecutive items.
- ≤1 sentence per item (fewer allowed via combining). 
- No filler, no labels.
- Treat banned phrases as case-insensitive; avoid inflections/near-variants.

items_in_order: {scenarioComponents}
banned_phrases: {wordsToAvoid}
{seedBundleSection}

Return the scenario text directly.`;

export const SCENARIO_SYSTEM_PROMPT_PAIRED_CARDS = `You write one short scenario ("quizit") to test concept(s).
Priorities: 1) Follow constraints, 2) Be concise.
Rules:
- Second person ("you…").
- Preserve given item ORDER, the order of the items should be how they appear in the scenario; combine only consecutive items.
- ≤1 sentence per item (fewer allowed via combining). 
- No filler, no labels.
- Treat banned phrases as case-insensitive; avoid inflections/near-variants.

items_in_order: {scenarioComponents1}, {scenarioComponents2}
banned_phrases: {wordsToAvoid1}, {wordsToAvoid2}
{seedBundleSection}

Return the scenario text directly.`;

export const REASONING_SYSTEM_PROMPT = `You write reasoning for a given scenario.
Priorities: 1) Behavioral constraints, 2) Concision.
REASONING MUST BE EXPLANATORY-ONLY:
- Describe events, causes, and implications in the scenario.
- Do not talk about the text, its structure, the prompt, fields, lists, or your process.
- Do not mention sentences, components, order, bullets, arrays, JSON, schema, or placeholders.
- Two paragraphs separated by exactly one blank line.
- Paragraph 1: explain how the situation unfolds so each required element is present, using temporal/causal cues (e.g., "at first… then… as a result…"), without meta talk.
- Paragraph 2: explain how the situation expresses the underlying idea and discuss the provided considerations in practical, non-meta terms.`;

export const REASONING_USER_PROMPT_TEMPLATE = `scenario: {generatedScenario}
idea_hint: {cardIdea}        // do not name explicitly in text
considerations: {reasoningComponents}

Return the reasoning text directly.`;

// Helper function to build scenario prompt with seed bundle
export function buildScenarioPrompt(scenarioComponents: string, wordsToAvoid: string, seedBundle: string[]): string {
  const seedBundleString = seedBundle.join(', ');
  
  const seedBundleSection = seedBundleString 
    ? `seed_bundle: ${seedBundleString}

The scenario should incorporate these seed words naturally and implement concrete details beyond them. Use the seed bundle as inspiration for the scenario context and build the scenario around these themes.`
    : '';

  return SCENARIO_USER_PROMPT_TEMPLATE
    .replace('{scenarioComponents}', scenarioComponents)
    .replace('{wordsToAvoid}', wordsToAvoid)
    .replace('{seedBundleSection}', seedBundleSection);
}

// Helper function to build reasoning prompt
export function buildReasoningPrompt(scenarioComponents: string, reasoningComponents: string, cardIdea: string, generatedScenario: string): string {
  return REASONING_USER_PROMPT_TEMPLATE
    .replace('{generatedScenario}', generatedScenario)
    .replace('{cardIdea}', cardIdea)
    .replace('{reasoningComponents}', reasoningComponents);
}

export function buildScenarioPrompt_PairedCards(scenarioComponents1: string, wordsToAvoid1: string, scenarioComponents2: string, wordsToAvoid2: string, seedBundle: string[]): string {
  const seedBundleString = seedBundle.join(', ');
  
  const seedBundleSection = seedBundleString 
    ? `seed_bundle: ${seedBundleString}

The scenario should incorporate these seed words naturally and implement concrete details beyond them. Use the seed bundle as inspiration for the scenario context and build the scenario around these themes.`
    : '';

  return SCENARIO_SYSTEM_PROMPT_PAIRED_CARDS
    .replace('{scenarioComponents1}', scenarioComponents1)
    .replace('{wordsToAvoid1}', wordsToAvoid1)
    .replace('{scenarioComponents2}', scenarioComponents2)
    .replace('{wordsToAvoid2}', wordsToAvoid2)
    .replace('{seedBundleSection}', seedBundleSection);
}