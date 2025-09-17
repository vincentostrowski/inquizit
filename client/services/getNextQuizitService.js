import { supabase } from './supabaseClient';

export const getNextQuizit = async (sessionId, currentCardIds = []) => {
  try {
    console.log('Getting next quizit for session:', sessionId);
    console.log('Current card IDs to exclude:', currentCardIds);
    
    const { data, error } = await supabase.functions.invoke('get-next-quizit', {
      body: { 
        sessionId,
        currentCardIds 
      }
    });

    if (error) {
      console.error('Error getting next quizit:', error);
      throw new Error(`Failed to get next quizit: ${error.message}`);
    }

    console.log('Next quizit retrieved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in getNextQuizit:', error);
    throw error;
  }
};
