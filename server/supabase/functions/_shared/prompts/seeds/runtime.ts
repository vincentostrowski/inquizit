// Runtime Seed Generation Prompts
// For inquizit app - theme-based seed generation during quizit sessions

import { CORE_SEED_PROMPT } from './core.ts';

// ===== RUNTIME FUNCTIONS =====

// Helper function to build runtime seed generation prompt
export function buildRuntimeSeedPrompt(
  theme: string,
  cardTitle: string, 
  cardDescription: string,
  count: number,
  previousSeeds: string[][] = []
): string {
  return `${CORE_SEED_PROMPT}

Theme: ${theme}
Card: ${cardTitle} - ${cardDescription}

Generate ${count} different seed sets (3-5 items each) that would create 
varied scenarios combining this theme with the card concepts.

Previous seeds generated: ${JSON.stringify(previousSeeds)}

Return as JSON array of arrays: [["item1", "item2", "item3"], ...]`;
}
