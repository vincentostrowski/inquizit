import { Stack } from 'expo-router';
import { ViewModeProvider } from '../context/ViewModeContext';
import { QuizitConfigProvider, useQuizitConfig } from '../context/QuizitConfigContext';
import { SpacedRepetitionConfigProvider, useSpacedRepetitionConfig } from '../context/SpacedRepetitionConfigContext';
import { AuthProvider } from '../context/AuthContext';
import QuizitConfigModal from '../components/quizit/QuizitConfigModal';
import SpacedRepetitionConfigModal from '../components/schedule/SpacedRepetitionConfigModal';

function RootLayoutContent() {
  const { showModal, modalData, hideQuizitConfig } = useQuizitConfig();
  const { showModal: showSpacedRepetitionModal, hideSpacedRepetitionConfig } = useSpacedRepetitionConfig();

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
      
      {/* Global Spaced Repetition Config Modal */}
      <SpacedRepetitionConfigModal
        visible={showSpacedRepetitionModal}
        onClose={hideSpacedRepetitionConfig}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ViewModeProvider>
        <QuizitConfigProvider>
          <SpacedRepetitionConfigProvider>
            <RootLayoutContent />
          </SpacedRepetitionConfigProvider>
        </QuizitConfigProvider>
      </ViewModeProvider>
    </AuthProvider>
  );
}