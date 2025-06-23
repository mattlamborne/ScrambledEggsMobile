// src/screens/GameHistoryScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useGameContext } from '../context/GameContext';
import GameCard from '../components/GameCard';
import GradientBackground from '../components/common/GradientBackground';

export default function GameHistoryScreen() {
  const { games, loading } = useGameContext();
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <GameCard 
      game={{
        ...item,
        courseName: item.course_name,
        type: `${item.hole_count || 18}-Hole`,
        strokes: item.total_score,
        date: new Date(item.created_at),
      }}
      onPress={() => navigation.navigate('GameDetails', { gameId: item.id })}
      onDelete={() => {/* Handle delete */}}
    />
  );

  if (loading && games.length === 0) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.emptyStateText}>Loading Game History...</Text>
      </View>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Game History</Text>
        <FlatList
          data={games}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    paddingTop: 60,
    textAlign: 'center',
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