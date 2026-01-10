import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { router } from 'expo-router';
import { createSpacedRepetitionSession } from '../services/quizitSessionService';

interface SpacedRepetitionConfigData {
  isPairedMode: boolean;
  biasText?: string;
  reviewCardOrder: 'ordered' | 'random'; // 'ordered' = earliest due first, 'random' = shuffled
  cardInterleaving: 'interleaved' | 'review-first'; // 'interleaved' = mix new/review, 'review-first' = all review then all new
}

interface SpacedRepetitionConfigContextType {
  showModal: boolean;
  configData: SpacedRepetitionConfigData | null;
  showSpacedRepetitionConfig: () => void;
  hideSpacedRepetitionConfig: () => void;
  setIsPairedMode: (isPairedMode: boolean) => void;
  setBiasText: (biasText: string | undefined) => void;
  setReviewCardOrder: (order: 'ordered' | 'random') => void;
  setCardInterleaving: (interleaving: 'interleaved' | 'review-first') => void;
  startSpacedRepetitionSession: () => Promise<{
    sessionId: string;
    cardCount: number;
  }>;
}

const SpacedRepetitionConfigContext = createContext<SpacedRepetitionConfigContextType | undefined>(undefined);

export const useSpacedRepetitionConfig = () => {
  const context = useContext(SpacedRepetitionConfigContext);
  if (!context) {
    throw new Error('useSpacedRepetitionConfig must be used within a SpacedRepetitionConfigProvider');
  }
  return context;
};

interface SpacedRepetitionConfigProviderProps {
  children: ReactNode;
}

export const SpacedRepetitionConfigProvider = ({ children }: SpacedRepetitionConfigProviderProps) => {
  const [showModal, setShowModal] = useState(false);
  const [configData, setConfigData] = useState<SpacedRepetitionConfigData | null>(null);

  const showSpacedRepetitionConfig = useCallback(() => {
    setConfigData({
      isPairedMode: false, // Default to Single card mode
      biasText: undefined, // No theme by default
      reviewCardOrder: 'ordered', // Default: earliest due first
      cardInterleaving: 'review-first', // Default: review cards first, then new cards
    });
    setShowModal(true);
  }, []);

  const hideSpacedRepetitionConfig = useCallback(() => {
    setShowModal(false);
    setConfigData(null);
  }, []);

  const setIsPairedMode = useCallback((isPairedMode: boolean) => {
    setConfigData(prev => prev ? { ...prev, isPairedMode } : null);
  }, []);

  const setBiasText = useCallback((biasText: string | undefined) => {
    setConfigData(prev => prev ? { ...prev, biasText } : null);
  }, []);

  const setReviewCardOrder = useCallback((reviewCardOrder: 'ordered' | 'random') => {
    setConfigData(prev => prev ? { ...prev, reviewCardOrder } : null);
  }, []);

  const setCardInterleaving = useCallback((cardInterleaving: 'interleaved' | 'review-first') => {
    setConfigData(prev => prev ? { ...prev, cardInterleaving } : null);
  }, []);

  const startSpacedRepetitionSession = useCallback(async () => {
    if (!configData) {
      throw new Error('No configuration data available');
    }

    try {
      const sessionData = await createSpacedRepetitionSession({
        isPairedMode: configData.isPairedMode,
        biasText: configData.biasText || '',
        reviewCardOrder: configData.reviewCardOrder,
        cardInterleaving: configData.cardInterleaving,
      });

      // Navigate to quizit screen with session data
      router.push({
        pathname: '/quizit',
        params: {
          sessionId: sessionData.sessionId,
          sessionType: 'spaced-repetition',
          sessionTitle: 'Spaced Repetition Session',
        },
      });

      // Close modal after successful navigation
      hideSpacedRepetitionConfig();

      return {
        sessionId: sessionData.sessionId,
        cardCount: sessionData.cardCount,
      };
    } catch (error) {
      console.error('Failed to create spaced repetition session:', error);
      throw error;
    }
  }, [configData, hideSpacedRepetitionConfig]);

  return (
    <SpacedRepetitionConfigContext.Provider
      value={{
        showModal,
        configData,
        showSpacedRepetitionConfig,
        hideSpacedRepetitionConfig,
        setIsPairedMode,
        setBiasText,
        setReviewCardOrder,
        setCardInterleaving,
        startSpacedRepetitionSession,
      }}
    >
      {children}
    </SpacedRepetitionConfigContext.Provider>
  );
};

