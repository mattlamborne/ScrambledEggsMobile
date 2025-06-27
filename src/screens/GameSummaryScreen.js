import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useGameContext } from '../context/GameContext';

const getScoreEmoji = (score, par) => {
  if (score === 1) return '🎯'; // Hole in One
  const relativeScore = score - par;
  if (relativeScore === -3) return '🦅🦅'; // Albatross (Double Eagle)
  if (relativeScore === -2) return '🦅'; // Eagle
  if (relativeScore === -1) return '🐦'; // Birdie
  if (relativeScore === 0) return '✅'; // Par
  if (relativeScore === 1) return '🟧'; // Bogey
  return '❌'; // Double Bogey or worse
};

const AnimatedPlayerContribution = ({ player, totalGameStrokes }) => {
  const [displayedStrokes, setDisplayedStrokes] = useState(0);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const countAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const percentage = totalGameStrokes > 0 ? (player.totalStrokes / totalGameStrokes) * 100 : 0;
    
    Animated.parallel([
      Animated.timing(progressAnimation, {
        toValue: percentage,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(countAnimation, {
        toValue: player.totalStrokes,
        duration: 800,
        useNativeDriver: false,
      })
    ]).start();

    const listener = countAnimation.addListener(({ value }) => {
      setDisplayedStrokes(Math.round(value));
    });

    return () => {
      countAnimation.removeListener(listener);
    };
  }, [player, totalGameStrokes]);

  const width = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.playerContribution}>
      <Text style={styles.playerName}>{player.name}</Text>
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, { width }]} />
      </View>
      <Text style={styles.playerShots}>
        {displayedStrokes} shots ({totalGameStrokes > 0 ? Math.round((player.totalStrokes / totalGameStrokes) * 100) : 0}%)
      </Text>
    </View>
  );
};

export default function GameSummaryScreen({ route, navigation }) {
  const { completedGame } = route.params;
  const { completeGame, deleteGame } = useGameContext();

  if (!completedGame) {
    return (
      <View style={styles.container}>
        <Text>No game data available.</Text>
      </View>
    );
  }

  const playerContributions = completedGame.players.map(player => {
    const totalStrokes = completedGame.scores.reduce((sum, hole) => {
      return sum + (hole.strokes?.filter(s => s.playerId === player.id).length || 0);
    }, 0);
    return { ...player, totalStrokes };
  });

  const totalGameStrokes = playerContributions.reduce((sum, p) => sum + p.totalStrokes, 0);

  const finalScore = totalGameStrokes;
  const coursePar = completedGame.scores.reduce((sum, hole) => sum + (hole.par || 0), 0);
  const relativeScore = finalScore - coursePar;

  const handleSaveAndFinish = () => {
    completeGame(completedGame);
    navigation.navigate('Main', { screen: 'Home' });
  };

  const handleEditRound = () => {
    // TODO: Implement edit round navigation or modal
    alert('Edit Round feature coming soon!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Game Summary</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.courseName}>{completedGame.courseName} ({completedGame.totalHoles}-Hole)</Text>

        {/* Final Score */}
        <View style={styles.finalScoreContainer}>
          <Text style={styles.finalScoreLabel}>Final Score</Text>
          <View style={styles.scoreValueContainer}>
            <Ionicons name="trophy" size={24} color={COLORS.secondary} />
            <Text style={styles.finalScore}>{finalScore}</Text>
            <Text style={styles.relativeScore}>
              {relativeScore > 0 ? `+${relativeScore}` : relativeScore}
            </Text>
          </View>
        </View>
        <Text style={styles.coursePar}>Course Par: {coursePar}</Text>

        {/* Player Contributions */}
        <View style={styles.contributionsContainer}>
          <Text style={styles.sectionTitle}>Player Contributions</Text>
          {playerContributions.map(player => (
            <AnimatedPlayerContribution
              key={player.id}
              player={player}
              totalGameStrokes={totalGameStrokes}
            />
          ))}
        </View>

        {/* Hole by Hole */}
        <View style={styles.holeByHoleContainer}>
          <Text style={styles.sectionTitle}>Hole by Hole</Text>
          <View style={styles.holeGrid}>
            {completedGame.scores.map(hole => (
              <View key={hole.hole} style={styles.holeItem}>
                <Text style={styles.holeNumber}>{hole.hole}</Text>
                <Text style={styles.holeScore}>{getScoreEmoji(hole.totalStrokes, hole.par)}</Text>
              </View>
            ))}
          </View>
          {/* Running total below the grid */}
          <Text style={styles.runningTotal}>
            Total: {completedGame.scores.reduce((sum, h) => sum + (h.totalStrokes || 0), 0)}
            {(() => {
              const totalStrokes = completedGame.scores.reduce((sum, h) => sum + (h.totalStrokes || 0), 0);
              const totalPar = completedGame.scores.reduce((sum, h) => sum + (h.par || 0), 0);
              const diff = totalStrokes - totalPar;
              return ` (${diff > 0 ? '+' : ''}${diff} vs Par)`;
            })()}
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveAndFinish}
        >
          <Text style={styles.saveButtonText}>Save Game & Finish</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.discardButton}
          onPress={handleEditRound}
        >
          <Text style={styles.discardButtonText}>Edit Round</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  finalScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  finalScoreLabel: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  scoreValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  finalScore: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
  },
  relativeScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 8,
  },
  coursePar: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'right',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  contributionsContainer: {
    marginBottom: 16,
  },
  playerContribution: {
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  progressContainer: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  playerShots: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  holeByHoleContainer: {
    marginBottom: 24,
  },
  holeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  holeItem: {
    width: '11.1%', // 9 per row
    backgroundColor: COLORS.background,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
    marginRight: 2,
  },
  holeNumber: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  holeScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 2,
    textAlign: 'center',
  },
  runningTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  discardButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  discardButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 