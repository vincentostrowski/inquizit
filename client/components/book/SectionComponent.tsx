import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { includesId } from '../../utils/idUtils';
import CardComponent from '../common/CardComponent';

interface Card {
  id: string;
  title: string;
  isBookmarked?: boolean;
}

interface SectionComponentProps {
  title: string;
  cards?: Card[];
  onPress: () => void;
  isEditMode?: boolean;
  selectedCardIds?: string[];
  onCardSelection?: (cardId: string) => void;
}

export default function SectionComponent({ 
  title, 
  cards = [], 
  onPress, 
  isEditMode = false, 
  selectedCardIds = [], 
  onCardSelection 
}: SectionComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTogglePress = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCardPress = (card: Card) => {
    if (isEditMode && onCardSelection) {
      onCardSelection(card.id);
    } else {
      onCardPress(card);
    }
  };

  // Select All logic for this section
  const sectionCardIds = cards.map(card => card.id);
  const allCardsSelected = sectionCardIds.length > 0 && sectionCardIds.every(cardId => includesId(selectedCardIds, cardId));
  
  const handleSelectAll = () => {
    if (!onCardSelection) return;
    
    if (allCardsSelected) {
      // Deselect all cards in this section
      sectionCardIds.forEach(cardId => {
        if (includesId(selectedCardIds, cardId)) {
          onCardSelection(cardId);
        }
      });
    } else {
      // Select all unselected cards in this section
      sectionCardIds.forEach(cardId => {
        if (!includesId(selectedCardIds, cardId)) {
          onCardSelection(cardId);
        }
      });
    }
  };
  if (isExpanded || isEditMode) {
    return (
      <View style={styles.sectionContainer}>
        {/* Expanded Container */}
        <View style={styles.expandedContainer}>
          <TouchableOpacity 
            style={styles.headerContainer}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Text style={styles.title}>{title}</Text>
            <View style={styles.rightContainer}>
              {/* Selection Toggle - Show in edit mode, otherwise show triangle toggle */}
              {isEditMode && onCardSelection ? (
                <TouchableOpacity 
                  onPress={handleSelectAll} 
                  style={styles.selectAllButton}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={allCardsSelected ? "checkmark" : "square-outline"} 
                    size={14} 
                    color={allCardsSelected ? "black" : "#8E8E93"} 
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.triangleContainer}
                  onPress={handleTogglePress}
                  activeOpacity={0.5}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View style={[
                    styles.triangle,
                    { transform: [{ rotate: '180deg' }] }
                  ]} />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
          
          {/* Cards */}
          <View style={styles.cardsContainer}>
            {cards.map((card) => (
              <CardComponent
                key={card.id}
                title={card.title}
                isBookmarked={card.isBookmarked}
                onPress={() => handleCardPress(card)}
                size="small"
                isSelected={includesId(selectedCardIds, card.id)}
              />
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      {/* Collapsed Container */}
      <TouchableOpacity 
        style={styles.collapsedContainer}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rightContainer}>
          {/* Triangle Toggle */}
          <TouchableOpacity 
            style={styles.triangleContainer}
            onPress={handleTogglePress}
            activeOpacity={0.5}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.triangle} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 12,
  },
  // Collapsed Container - Simple rounded container
  collapsedContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Expanded Container - Contains header and cards
  expandedContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    overflow: 'hidden',
  },
  // Header within expanded container
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    fontWeight: '400',
    color: '#1D1D1F',
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectAllButton: {
    padding: 4,
    minWidth: 24,
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triangleContainer: {
    padding: 8, // Increased padding for better touch target
    minWidth: 32, // Minimum touch target size
    minHeight: 32, // Minimum touch target size
    justifyContent: 'center',
    alignItems: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#8E8E93',
  },
  cardsContainer: {
    paddingTop: 8,
    paddingBottom: 8,
  },
});
