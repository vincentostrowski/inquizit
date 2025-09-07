import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface QuizitHeaderProps {
  onBack: () => void;
  quizitTitle: string;
}

export default function QuizitHeader({
  onBack,
  quizitTitle,
}: QuizitHeaderProps) {
  return (
    <View style={styles.container}>

      {/* Rounded Title Container */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {quizitTitle}
        </Text>
      </View>

      {/* Settings Icon */}
      <TouchableOpacity>
        <Image 
          source={require('../../assets/icons/mingcute--settings-2-line.png')} 
          style={{ width: 24, height: 24 }} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    gap: 8,
    height: 60,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 20, // Pill shape
    padding: 5,
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#1D1D1F',
  },
});
