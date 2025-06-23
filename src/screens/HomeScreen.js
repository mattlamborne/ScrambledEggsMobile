import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useGameContext } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { getWelcomeMessage } from '../utils/welcomeMessages';
import GradientBackground from '../components/common/GradientBackground';

export default function HomeScreen({ navigation }) {
  const { activeGame, games } = useGameContext();
  const { profile } = useAuth();
  const [welcomeMessage, setWelcomeMessage] = useState('Track your scramble games');

  useEffect(() => {
    console.log("HomeScreen useEffect triggered. Profile:", profile); // Debugging line

    const getUserName = () => {
      if (profile?.full_name) {
        return profile.full_name.split(' ')[0];
      }
      return null;
    };

    const userName = getUserName();
    if (userName) {
      setWelcomeMessage(getWelcomeMessage(userName));
    }
  }, [profile]); // This effect runs when the profile object changes

  const handleNewGame = () => {
    navigation.navigate('New Game');
  };

  const handleContinueGame = () => {
    // Navigate to GamePlay screen
    navigation.navigate('GamePlay');
  };

  return (
    <GradientBackground>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>{welcomeMessage}</Text>
        </View>

        {activeGame ? (
          <View style={styles.activeGameSection}>
            <Text style={styles.sectionTitle}>Active Game</Text>
            <View style={styles.gameCard}>
              <Text style={styles.gameTitle}>{activeGame.courseName}</Text>
              <Text style={styles.gameDetails}>
                Hole {activeGame.currentHole} • {activeGame.players?.length || 0} players
              </Text>
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={handleContinueGame}
              >
                <Text style={styles.continueButtonText}>Continue Game</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noGameSection}>
            <Ionicons name="golf-outline" size={64} color={COLORS.primary} />
            <Text style={styles.noGameText}>No active game</Text>
            <TouchableOpacity 
              style={styles.newGameButton}
              onPress={handleNewGame}
            >
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.newGameButtonText}>Start New Game</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.recentGamesSection}>
          <Text style={styles.sectionTitle}>Recent Games</Text>
          {games.length > 0 ? (
            games.slice(0, 3).map((game, index) => (
              <View key={game.id} style={styles.recentGameCard}>
                <Text style={styles.recentGameTitle}>{game.course_name}</Text>
                <Text style={styles.recentGameDate}>
                  {new Date(game.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noGamesText}>No games yet</Text>
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 80,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  activeGameSection: {
    padding: 16,
  },
  noGameSection: {
    padding: 40,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  gameDetails: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noGameText: {
    fontSize: 18,
    color: COLORS.textLight,
    marginVertical: 16,
  },
  newGameButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newGameButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  recentGamesSection: {
    padding: 16,
  },
  recentGameCard: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentGameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  recentGameDate: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  noGamesText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 20,
  },
});
