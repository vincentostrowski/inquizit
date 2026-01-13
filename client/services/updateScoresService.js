import { supabase } from './supabaseClient';

/**
 * Update scores for a quizit
 * @param {string} sessionId - The session ID
 * @param {string} quizitId - The quizit ID
 * @param {Object} cardData - Card data with scores {id, recognitionScore, reasoningScore}
 * @returns {Promise<Object>} Response from the update-scores function
 */
export const updateScores = async (sessionId, quizitId, cardData) => {
  try {
    console.log('Updating scores:', { sessionId, quizitId, cardData });

    const { data, error } = await supabase.functions.invoke('update-scores', {
      body: {
        sessionId,
        quizitId,
        cardId: cardData.id,
        recognitionScore: cardData.recognitionScore,
        reasoningScore: cardData.reasoningScore
      }
    });

    if (error) {
      console.error('Error updating scores:', error);
      throw error;
    }

    console.log('Scores updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to update scores:', error);
    throw error;
  }
};

/**
 * Debounced version of updateScores to prevent rapid API calls
 * @param {Function} updateFunction - The function to call after debounce
 * @param {number} delay - Delay in milliseconds (default: 2000)
 * @returns {Function} Debounced function
 */
export const createDebouncedUpdateScores = (updateFunction, delay = 2000) => {
  let timeoutId;
  
  return (...args) => {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Set new timeout
    timeoutId = setTimeout(() => {
      updateFunction(...args);
    }, delay);
  };
};

