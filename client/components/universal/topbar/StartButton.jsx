import { Image, TouchableOpacity, StyleSheet } from 'react-native';
import cardsIcon from '../../../assets/icons/cardsIcon.png';
import { useNavigation } from '@react-navigation/native';
import { useQuizit } from '../../../data/quizitContext';
import { supabase } from "../../../config/supabase";

export function StartButton({quizitBody, insight, book}) {
  const { setCurrentSession, setSessions } = useQuizit();
  const navigation = useNavigation();

  const handlePress = async () => {
    console.log('Starting quizit session');
    try {
      const { data, error } = await supabase.functions.invoke('start-quizit-session', { method: 'POST', body: JSON.stringify(quizitBody), });
      
      // Check for errors 
      if (error) { throw new Error(`Error invoking function: ${error.message}`); }

      // Create session and store it in the context
      const sessionId = data.sessionId;
      const session = {
        id: sessionId,
        type: quizitBody.type,
        title: (insight ? insight.title : book.title),
        filters: quizitBody.filters,
      };

      console.log('Session created:');
      setSessions(session);
      setCurrentSession(session);

      navigation.navigate('quizit');

    } catch (error) {
      console.error('Error starting quizit session:', error.message);
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
    >
      <Image 
            source={cardsIcon}
            style={styles.icon}
            resizeMode="contain"
        />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  icon: {
    width: '60%',
    height: '60%',
    tintColor: '#dfdfdf',
    color: '#dfdfdf',
  },
}); 