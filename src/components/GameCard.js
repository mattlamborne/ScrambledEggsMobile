// src/components/GameCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function GameCard({ game, onPress, onDelete }) {
  // Format relative date (e.g., "7 days ago")
  const formatRelativeDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.courseName}>{game.courseName}</Text>
        <Text style={styles.strokes}>{game.strokes} strokes</Text>
      </View>
      
      <View style={styles.cardDetails}>
        <Text style={styles.gameType}>{game.type}</Text>
        <Text style={styles.date}>{formatRelativeDate(game.date)}</Text>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.viewButton} onPress={onPress}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  strokes: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gameType: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  date: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 6,
  },
  viewButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteButton: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
});