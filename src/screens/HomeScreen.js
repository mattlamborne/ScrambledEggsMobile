// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useGameContext } from '../context/GameContext';

export default function HomeScreen({ navigation }) {
  const { activeGame, recentGames, deleteGame } = useGameContext();

  const handleNewGame = () => {
    navigation.navigate('New Game');
  };

  const handleContinueGame = () => {
    // Navigate to GamePlay screen
    navigation.navigate('GamePlay');
  };

  const handleViewGameDetails = (gameId) => {
    // This will be implemented when we create the GameDetailsScreen
    Alert.alert('View Game', `Viewing details for game ${gameId}`);
  };

  const handleDeleteGame = (gameId) => {
    Alert.alert(
      'Delete Game',
      'Are you sure you want to delete this game?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteGame(gameId);
          }
        }
      ]
    );
  };

  const handleViewHistory = () => {
    navigation.navigate('History');
  };

  const renderGameItem = ({ item }) => (
    <View style={styles.gameCard} key={item.id}>
      <View style={styles.gameCardHeader}>
        <Text style={styles.courseNameText}>{item.courseName}</Text>
        <Text style={styles.strokesText}>{item.strokes} strokes</Text>
      </View>
      
      <View style={styles.gameCardSubtitle}>
        <Text style={styles.gameTypeText}>{item.type}</Text>
        <Text style={styles.dateText}>
          {item.date.toLocaleDateString() === new Date().toLocaleDateString() 
            ? 'Today'
            : `${Math.round((new Date() - item.date) / (1000 * 60 * 60 * 24))} days ago`
          }
        </Text>
      </View>
      
      <View style={styles.gameCardActions}>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => handleViewGameDetails(item.id)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteGame(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.titleText}>Scrambled Eggs Golf</Text>
        <Text style={styles.subtitleText}>Track your scramble games</Text>
      </View>
      
      {activeGame ? (
        <View style={styles.activeGameSection}>
          <View style={styles.activeGameHeader}>
            <Text style={styles.sectionTitle}>Active Game</Text>
          </View>
          
          <View style={styles.activeGameCard}>
            <View style={styles.activeGameInfo}>
              <Text style={styles.activeGameCourseName}>{activeGame.courseName}</Text>
              <Text style={styles.activeGameDetails}>
                Hole {activeGame.currentHole}/18 • {activeGame.players.length} Players
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={handleContinueGame}
            >
              <Text style={styles.continueButtonText}>Continue Game</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.newGameButton}
          onPress={handleNewGame}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.newGameButtonText}>Start New Game</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.recentGamesHeader}>
        <Text style={styles.sectionTitle}>Recent Games</Text>
      </View>
      
      {recentGames.map(game => renderGameItem({ item: game }))}
      
      <TouchableOpacity 
        style={styles.viewHistoryButton}
        onPress={handleViewHistory}
      >
        <Ionicons name="time-outline" size={20} color={COLORS.primary} />
        <Text style={styles.viewHistoryText}>View Game History</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.signOutButton}
        onPress={() => Alert.alert('Sign Out', 'You have been signed out.')}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.textLight} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  titleText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginVertical: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: COLORS.text,
  },
  activeGameSection: {
    marginBottom: 20,
  },
  activeGameHeader: {
    marginBottom: 10,
  },
  activeGameCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeGameInfo: {
    marginBottom: 12,
  },
  activeGameCourseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  activeGameDetails: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8,
  },
  newGameButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginVertical: 20,
  },
  newGameButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  recentGamesHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  strokesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  gameCardSubtitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gameTypeText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  gameCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  viewButton: {
    flex: 1,
  },
  viewButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    marginTop: 16,
  },
  viewHistoryText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 20,
  },
  signOutText: {
    color: COLORS.textLight,
    marginLeft: 8,
  },
});