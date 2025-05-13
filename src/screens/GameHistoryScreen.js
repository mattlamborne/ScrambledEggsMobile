// src/screens/GameHistoryScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import GameCard from '../components/GameCard';

// Mock data for development
const mockGames = [
  { id: '1', courseName: 'Tally', type: '18-Hole', strokes: 72, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  { id: '2', courseName: 'Tally', type: '18-Hole', strokes: 72, date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
  { id: '3', courseName: 'Pine Hills', type: '9-Hole', strokes: 36, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
];

export default function GameHistoryScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <GameCard 
      game={item}
      onPress={() => navigation.navigate('GameDetails', { gameId: item.id })}
      onDelete={() => {/* Handle delete */}}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Game History</Text>
        <Text style={styles.subtitle}>View and manage your past games</Text>
      </View>
      
      {mockGames.length > 0 ? (
        <FlatList
          data={mockGames}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="golf-outline" size={64} color={COLORS.disabled} />
          <Text style={styles.emptyStateText}>No games recorded yet</Text>
          <TouchableOpacity 
            style={styles.newGameButton}
            onPress={() => navigation.navigate('New Game')}
          >
            <Text style={styles.newGameButtonText}>Start Your First Game</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.card,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  newGameButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  newGameButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});