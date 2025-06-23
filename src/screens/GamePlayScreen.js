// src/screens/GamePlayScreen.js - Complete fixed version
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useGameContext } from '../context/GameContext';
import GradientBackground from '../components/common/GradientBackground';

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

export default function GamePlayScreen({ navigation }) {
  const { activeGame, saveHoleScore } = useGameContext();
  
  const [currentHole, setCurrentHole] = useState(1);
  const [strokes, setStrokes] = useState([]);

  useEffect(() => {
    if (activeGame) {
      setCurrentHole(activeGame.currentHole);
      const existingScore = activeGame.scores?.find(s => s.hole === activeGame.currentHole);
      setStrokes(existingScore ? existingScore.strokes : []);

      if (activeGame.currentHole > activeGame.totalHoles) {
        navigation.navigate('GameSummary', { completedGame: activeGame });
      }
    }
  }, [activeGame]);

  if (!activeGame) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text>No active game. Start one from the Home screen!</Text>
        </View>
      </GradientBackground>
    );
  }

  const holeData = activeGame.holeData?.[currentHole - 1];
  const holePar = holeData?.par;

  const handleAddStroke = (playerId) => {
    const playerName = activeGame.players.find(p => p.id === playerId)?.name;
    if (!playerName) return;

    const newStroke = {
      number: strokes.length + 1,
      playerId,
      playerName,
    };
    setStrokes([...strokes, newStroke]);
  };
  
  const handleUndoStroke = () => {
    if (strokes.length > 0) {
      setStrokes(strokes.slice(0, -1));
    }
  };

  const handleNextHole = () => {
    if (strokes.length === 0) {
      Alert.alert("No strokes", "Please record at least one stroke for this hole.");
      return;
    }
    saveHoleScore(currentHole, strokes, holePar);
  };

  return (
    <GradientBackground>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.courseName}>{activeGame.courseName}</Text>
            <Text style={styles.holeDetails}>Hole {currentHole} • Par {holePar || 'N/A'}</Text>
        </View>
        
        <View style={styles.card}>
            <View style={styles.scoreControls}>
              <Text style={styles.label}>Team Score: {strokes.length}</Text>
              <TouchableOpacity onPress={handleUndoStroke}>
                <Ionicons name="arrow-undo-circle-outline" size={28} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.playerButtons}>
                {activeGame.players.map(player => (
                    <TouchableOpacity 
                        key={player.id} 
                        style={styles.playerButton} 
                        onPress={() => handleAddStroke(player.id)}
                    >
                        <Text style={styles.playerButtonText}>+ {player.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
        
        <View style={styles.strokesSection}>
            <Text style={styles.label}>Strokes Recorded:</Text>
            {strokes.length === 0 ? (
              <Text style={styles.noStrokesText}>Tap a player to add a stroke.</Text>
            ) : (
              strokes.map((stroke, index) => (
                  <View key={index} style={styles.strokeItem}>
                      <Text>Stroke {stroke.number}: {stroke.playerName}</Text>
                  </View>
              ))
            )}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNextHole}>
            <Text style={styles.nextButtonText}>
              {currentHole >= activeGame.totalHoles ? 'Finish Game' : 'Save & Next Hole'}
            </Text>
        </TouchableOpacity>

        {activeGame.scores && activeGame.scores.length > 0 && (
          <View style={styles.scorecardSection}>
            <Text style={styles.label}>Scorecard</Text>
            <View style={styles.scorecardGrid}>
              {activeGame.scores.map((holeScore) => (
                <View key={holeScore.hole} style={styles.scorecardItem}>
                  <Text style={styles.scorecardHole}>Hole {holeScore.hole}</Text>
                  <Text style={styles.scorecardPar}>Par {holeScore.par}</Text>
                  <Text style={styles.scorecardScore}>
                    {holeScore.totalStrokes} {getScoreEmoji(holeScore.totalStrokes, holeScore.par)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 60, padding: 20, alignItems: 'center' },
  courseName: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  holeDetails: { fontSize: 18, color: '#fff', opacity: 0.9, marginTop: 4 },
  card: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 8 },
  scoreControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 16, fontWeight: 'bold' },
  playerButtons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  playerButton: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, margin: 4 },
  playerButtonText: { color: '#fff', fontWeight: 'bold' },
  strokesSection: { marginHorizontal: 16, marginBottom: 16 },
  noStrokesText: { fontStyle: 'italic', color: COLORS.textLight, textAlign: 'center', paddingVertical: 10 },
  strokeItem: { backgroundColor: '#fff', padding: 8, borderRadius: 4, marginTop: 4, borderWidth: 1, borderColor: '#eee' },
  scorecardSection: { marginHorizontal: 16, marginTop: 8 },
  scorecardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  scorecardItem: { 
    width: '48%', 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  scorecardHole: { fontSize: 14, fontWeight: 'bold' },
  scorecardPar: { fontSize: 12, color: COLORS.textLight },
  scorecardScore: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  nextButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, margin: 16, alignItems: 'center' },
  nextButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});