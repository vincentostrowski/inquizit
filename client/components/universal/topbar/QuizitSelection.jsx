import { View, StyleSheet, Text } from 'react-native';
import OptionToggle from './OptionToggle';
import { BooksPreview } from './BooksPreview';

export function QuizitSelection({ quizitBody, setQuizitBody, insightCount }) {

    const handleSavedToggle = () => {
        setQuizitBody((prev) => ({
            ...prev, 
            filters: {
              ...prev.filters,
              saved: !prev.filters.saved, // Toggle the `saved` property
            },
          }));
    }

    const handleCombineToggle = () => {
        setQuizitBody((prev) => ({
            ...prev, 
            filters: {
              ...prev.filters,
              combine: !prev.filters.combine, // Toggle the `combine` property
            },
          }));
    }

    const handleExclusiveToggle = () => {
        setQuizitBody((prev) => ({
            ...prev, 
            filters: {
              ...prev.filters,
              exclusive: !prev.filters.exclusive, // Toggle the `exclusive` property
            },
          }));
    }

    return (
        <View style={styles.container}>
                <View style={styles.bookContainer}>
                    <BooksPreview insightCount={insightCount} saved={quizitBody.filters.saved} combine={quizitBody.filters.combine} exclusive={quizitBody.filters.exclusive}/>
                </View>
                <View style={styles.toggleContainer}>
                    <OptionToggle leftLabel={'Saved'} rightLabel={'All'} onToggle={handleSavedToggle} left={quizitBody.filters.saved}/>
                    <OptionToggle leftLabel={'Separate'} rightLabel={'Combine'} onToggle={handleCombineToggle} left={!quizitBody.filters.combine}/>
                    <OptionToggle leftLabel={'Exclusive'} rightLabel={'Library'} onToggle={handleExclusiveToggle} left={quizitBody.filters.exclusive}/>
                </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,  
        alignItems: 'center',
        flexDirection: 'row',
        // backgroundColor: 'green',
    },
    bookContainer: {
        flex: 1,
        height: '100%',
        // backgroundColor: 'blue',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    toggleContainer: {
        height: '100%',
        width: 170,
        gap: 15,
        paddingRight: 5,
        // backgroundColor: 'red',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

