import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SafeAreaWrapper from '../../../components/common/SafeAreaWrapper';

export default function ScheduleScreen() {
  return (
    <SafeAreaWrapper backgroundColor="#F8F9FA">
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Schedule</Text>
          <Text style={styles.subtitle}>Plan your learning sessions</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today's Schedule</Text>
            <Text style={styles.cardText}>No sessions scheduled for today</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Upcoming Sessions</Text>
            <Text style={styles.cardText}>No upcoming sessions</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Study Streak</Text>
            <Text style={styles.cardText}>0 days in a row</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
