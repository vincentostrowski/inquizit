import { supabase } from './supabaseClient';

export const getNextQuizit = async (sessionId, currentCardIds = [], sessionType = 'regular') => {
  try {
    console.log('Getting next quizit for session:', sessionId);
    console.log('Session type:', sessionType);
    
    // Call appropriate edge function based on session type
    const functionName = sessionType === 'spaced-repetition' 
      ? 'get-next-spaced-repetition-quizit'
      : 'get-next-quizit';
    
    // Build request body based on session type
    const requestBody = sessionType === 'spaced-repetition'
      ? { sessionId } // Spaced repetition doesn't need currentCardIds
      : { sessionId, currentCardIds }; // Regular sessions need currentCardIds
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: requestBody
    });

    if (error) {
      console.error('Error getting next quizit:', error);
      throw new Error(`Failed to get next quizit: ${error.message}`);
    }

    console.log('Quizit retrieved successfully:', data.quizitItems?.[0]?.quizitData?.core?.[0] || data.quizitItems?.[0]);
    return data;
  } catch (error) {
    console.error('Error in getNextQuizit:', error);
    throw error;
  }
};

