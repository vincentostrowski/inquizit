// Quizit Prompts - Inquizit Server
// Exports all quizit-related prompts for use in inquizit edge functions

// Scenario prompts
export {
  SCENARIO_SYSTEM_PROMPT,
  buildScenarioUserPrompt,
  buildScenarioUserPromptPairedCards
} from './scenario.ts';

// Reasoning prompts
export {
  REASONING_SYSTEM_PROMPT,
  buildReasoningUserPrompt
} from './reasoning.ts';