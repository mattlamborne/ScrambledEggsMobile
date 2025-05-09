import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function NewGameScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Game</Text>
      <Text style={styles.subtitle}>Start a new golf game</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text,
  },
}); 