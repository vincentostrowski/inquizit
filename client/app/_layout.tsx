import { Stack } from 'expo-router';
import { ViewModeProvider } from '../context/ViewModeContext';
import { QuizitConfigProvider, useQuizitConfig } from '../context/QuizitConfigContext';
import QuizitConfigModal from '../components/quizit/QuizitConfigModal';

function RootLayoutContent() {
  const { showModal, modalData, hideQuizitConfig } = useQuizitConfig();

  return (
    <>
      <Stack>
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
        screenType={modalData?.screenType || 'book'}
        bookCover={modalData?.bookCover || ''}
        title={modalData?.title || ''}
        onStartQuizit={() => {
          hideQuizitConfig();
          modalData?.onStartQuizit();
        }}
        onClose={hideQuizitConfig}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ViewModeProvider>
      <QuizitConfigProvider>
        <RootLayoutContent />
      </QuizitConfigProvider>
    </ViewModeProvider>
  );
}