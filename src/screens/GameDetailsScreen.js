import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { supabase } from '../lib/supabase';

const ScoreSymbol = ({ score, par }) => {
  if (score === null || par === null) {
    return <Text style={styles.scorecardCell}>-</Text>;
  }
  const diff = score - par;

  if (diff <= -2) { // Eagle or better
    return <Text style={styles.scoreSymbol}>🦅</Text>;
  }
  if (diff === -1) { // Birdie
    return <Text style={styles.scoreSymbol}>🐦</Text>;
  }
  if (diff === 0) { // Par
    return <Text style={styles.scoreText}>{score}</Text>;
  }
  if (diff === 1) { // Bogey
    return (
      <View style={styles.bogeyBox}>
        <Text style={styles.scoreText}>{score}</Text>
      </View>
    );
  }
  if (diff >= 2) { // Double Bogey or worse
    return (
      <View style={styles.doubleBogeyOuter}>
        <View style={styles.doubleBogeyInner}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>
    );
  }

  return <Text style={styles.scoreText}>{score}</Text>;
};

const PlayerStatBar = ({ player, totalGameStrokes }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const percentage = totalGameStrokes > 0 ? (player.totalStrokes / totalGameStrokes) * 100 : 0;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false, // 'width' is not supported by native driver
    }).start();
  }, [percentage]);

  const barStyle = {
    width: animatedWidth.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    }),
    height: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  };

  return (
    <View style={styles.playerStatRow}>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{player.name}</Text>
        <Text style={styles.playerPercentage}>{Math.round(percentage)}%</Text>
      </View>
      <View style={styles.barContainer}>
        <Animated.View style={barStyle} />
      </View>
    </View>
  );
};

export default function GameDetailsScreen({ navigation, route }) {
  const { gameId } = route.params;
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [holeScores, setHoleScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameDetails();
  }, [gameId]);

  const fetchGameDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch the game details
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;

      // Fetch players for this game
      const { data: playersData, error: playersError } = await supabase
        .from('game_players')
        .select('id, name')
        .eq('game_id', gameId);

      if (playersError) throw playersError;

      // Fetch hole scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('game_id', gameId)
        .order('hole_number');

      if (scoresError) throw scoresError;

      setGame(gameData);
      setPlayers(playersData);
      setHoleScores(scoresData || []);
    } catch (error) {
      console.error('Error fetching game details:', error);
      Alert.alert('Error', 'Failed to load game details');
    } finally {
      setLoading(false);
    }
  };

  const calculatePlayerStats = () => {
    const stats = {};
    
    players.forEach(player => {
      stats[player.id] = {
        name: player.name,
        totalStrokes: 0,
      };
    });

    holeScores.forEach(hole => {
      try {
        if (hole.strokes) {
          // It's already a JSON string from the DB
          const strokesArray = JSON.parse(hole.strokes);
          strokesArray.forEach(stroke => {
            // Check against the correct player ID from game_players table
            if (stats[stroke.playerId]) {
              stats[stroke.playerId].totalStrokes += 1;
            }
          });
        }
      } catch(e) {
        console.error("Error parsing strokes JSON:", e);
      }
    });

    return Object.values(stats);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading game details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Game not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Main', { screen: 'History' })}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const playerStats = calculatePlayerStats();
  const totalStrokes = holeScores.reduce((sum, hole) => sum + (hole.total_strokes || 0), 0);
  const totalPar = holeScores.reduce((sum, hole) => sum + (hole.par || 0), 0);
  const relativeToPar = totalStrokes - totalPar;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Main', { screen: 'History' })}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Game Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.gameInfoCard}>
            <Text style={styles.courseName}>{game.course_name}</Text>
            <Text style={styles.gameDate}>
              {new Date(game.created_at).toLocaleDateString()}
            </Text>
            <View style={styles.scoreSummary}>
              <Text style={styles.totalScore}>
                Total: {totalStrokes} {relativeToPar !== 0 && `(${relativeToPar > 0 ? '+' : ''}${relativeToPar})`}
              </Text>
              <Text style={styles.parInfo}>Par: {totalPar}</Text>
            </View>
          </View>

          <View style={styles.playersCard}>
            <Text style={styles.sectionTitle}>Player Contributions</Text>
            {totalStrokes > 0 ? (
              playerStats.map((player, index) => (
                <PlayerStatBar 
                  key={index}
                  player={player}
                  totalGameStrokes={totalStrokes}
                />
              ))
            ) : (
              <Text style={styles.noScoresText}>No strokes recorded to show stats.</Text>
            )}
          </View>

          <View style={styles.holesCard}>
            <Text style={styles.sectionTitle}>Scorecard</Text>
            {holeScores.length > 0 ? (
              <View style={styles.scorecard}>
                {/* Header */}
                <View style={styles.scorecardRow}>
                  <Text style={[styles.scorecardHeader, styles.scorecardHole]}>Hole</Text>
                  <Text style={[styles.scorecardHeader, styles.scorecardPar]}>Par</Text>
                  <Text style={[styles.scorecardHeader, styles.scorecardScore]}>Score</Text>
                </View>
                {/* Body */}
                {holeScores.map((hole) => (
                  <View key={hole.id} style={styles.scorecardRow}>
                    <Text style={[styles.scorecardCell, styles.scorecardHole]}>{hole.hole_number}</Text>
                    <Text style={[styles.scorecardCell, styles.scorecardPar]}>{hole.par}</Text>
                    <View style={[styles.scorecardCell, styles.scorecardScore]}>
                      <ScoreSymbol score={hole.total_strokes} par={hole.par} />
                    </View>
                  </View>
                ))}
                {/* Footer */}
                <View style={[styles.scorecardRow, styles.scorecardFooter]}>
                  <Text style={[styles.scorecardHeader, styles.scorecardHole]}>Total</Text>
                  <Text style={[styles.scorecardHeader, styles.scorecardPar]}>{totalPar}</Text>
                  <Text style={[styles.scorecardHeader, styles.scorecardScore]}>{totalStrokes}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noScoresText}>No hole scores were recorded for this game.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  gameInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  courseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  gameDate: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  scoreSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  parInfo: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  playersCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  playerStatRow: {
    marginBottom: 20,
  },
  playerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  playerPercentage: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  barContainer: {
    height: 20,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    overflow: 'hidden',
  },
  holesCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // Scorecard Styles
  scorecard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  scorecardRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scorecardHeader: {
    padding: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scorecardCell: {
    padding: 12,
    color: COLORS.text,
  },
  scorecardHole: {
    flex: 2,
    textAlign: 'center',
  },
  scorecardPar: {
    flex: 1,
    textAlign: 'center',
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  scorecardScore: {
    flex: 1,
    textAlign: 'center',
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scorecardFooter: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 0,
  },
  noScoresText: {
    textAlign: 'center',
    color: COLORS.textLight,
    padding: 20,
  },
  // New styles for score symbols
  scoreSymbol: {
    fontSize: 20,
  },
  scoreText: {
    color: COLORS.text,
    fontWeight: '500',
  },
  bogeyBox: {
    width: 28,
    height: 28,
    borderWidth: 1.5,
    borderColor: COLORS.textLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  doubleBogeyOuter: {
    width: 28,
    height: 28,
    borderWidth: 1.5,
    borderColor: COLORS.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  doubleBogeyInner: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: COLORS.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
});