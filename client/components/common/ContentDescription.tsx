import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';

interface ContentDescriptionProps {
  description: string;
  maxLines?: number;
}

export default function ContentDescription({
  description,
  maxLines = 4
}: ContentDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState<boolean | null>(null); // null = not determined yet
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const onFullTextLayout = (event: any) => {
    const { lines } = event.nativeEvent;
    if (lines && lines.length > 0) {
      const actualHeight = lines.reduce((sum: number, line: any) => sum + line.height, 0);
      const lineHeight = lines[0]?.height || 20; // fallback to lineHeight from styles
      const maxHeight = lineHeight * maxLines;
      
      setNeedsTruncation(actualHeight > maxHeight + 2); // 2px tolerance for rounding
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Hidden full text for measurement */}
      <Text
        style={[styles.description, { position: 'absolute', opacity: 0, zIndex: -1 }]}
        onTextLayout={onFullTextLayout}
      >
        {description}
      </Text>

      {/* Content area with fixed height only when loading */}
      <View style={[styles.contentArea, needsTruncation === null && styles.loadingArea]}>
        {needsTruncation === null ? (
          // Show loading state while determining truncation
          <View style={styles.textContainer}>
            <Text style={[styles.description, { color: 'transparent' }]}>
              {'\n'.repeat(maxLines)}
            </Text>
          </View>
        ) : needsTruncation ? (
          // Show 3 lines + button when truncation needed
          <TouchableOpacity onPress={toggleExpanded} style={styles.textContainer} activeOpacity={1}>
            <Text
              numberOfLines={expanded ? undefined : maxLines}
              style={styles.description}
            >
              {description}
            </Text>
            <View style={styles.buttonContainer}>
              <Text style={styles.expandButton}>
                {expanded ? 'Read less' : 'Read more...'}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          // Show full text (up to 4 lines) when no truncation needed
          <Text style={styles.description}>
            {description}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 26,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  contentArea: {
    // No fixed height by default
  },
  loadingArea: {
    minHeight: 92, // Reserve space for 4 lines (4 * 20px lineHeight + 3 * 4px spacing)
  },
  textContainer: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#1D1D1F',
    lineHeight: 20, 
  },
  buttonContainer: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  expandButton: {
    fontSize: 14,
    color: '#895911',
    fontWeight: '500',
  },
});
