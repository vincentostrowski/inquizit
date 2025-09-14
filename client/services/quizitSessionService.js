import { supabase } from './supabaseClient';

export const createQuizitSession = async (cardIds) => {
  try {
    console.log('Creating quizit session with card IDs:', cardIds);
    
    const { data, error } = await supabase.functions.invoke('create-quizit-session', {
      body: { cardIds }
    });

    if (error) {
      console.error('Error creating quizit session:', error);
      throw new Error(`Failed to create quizit session: ${error.message}`);
    }

    console.log('Quizit session created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createQuizitSession:', error);
    throw error;
  }
};
