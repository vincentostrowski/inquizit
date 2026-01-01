import { Stack } from 'expo-router';
import { ViewModeProvider } from '../context/ViewModeContext';
import { QuizitConfigProvider, useQuizitConfig } from '../context/QuizitConfigContext';
import { AuthProvider } from '../context/AuthContext';
import QuizitConfigModal from '../components/quizit/QuizitConfigModal';

function RootLayoutContent() {
  const { showModal, modalData, hideQuizitConfig } = useQuizitConfig();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            animation: 'none' // Disable animation for login screen
          }} 
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="quizit" 
          options={{ 
            headerShown: false,
            presentation: 'modal'
          }} 
        />
      </Stack>
      
      {/* Global Quizit Config Modal */}
      <QuizitConfigModal
        visible={showModal}
        title={modalData?.title || ''}
        onClose={hideQuizitConfig}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ViewModeProvider>
        <QuizitConfigProvider>
          <RootLayoutContent />
        </QuizitConfigProvider>
      </ViewModeProvider>
    </AuthProvider>
  );
}