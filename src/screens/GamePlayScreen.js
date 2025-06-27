// src/screens/GamePlayScreen.js - Complete fixed version
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useGameContext } from '../context/GameContext';
import GradientBackground from '../components/common/GradientBackground';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    const player = activeGame.players.find(p => p.id === playerId);
    if (!player) return;

    const newStroke = {
      number: strokes.length + 1,
      playerId,
      playerName: player.name,
      user_id: player.user_id || null,
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
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Course Title */}
          <Text style={styles.screenTitle}>{activeGame.courseName}</Text>

          {/* Box 1: Hole/Team Score and player buttons */}
          <View style={styles.elevatedCard}>
            <Text style={styles.holeDetailsCentered}>Hole {currentHole} • Par {holePar || 'N/A'}</Text>
            <View style={styles.scoreControlsRow}>
              <Text style={styles.label}>Hole Score: {strokes.length}</Text>
              <Text style={styles.teamScoreLabel}>
                {(() => {
                  const totalStrokes = activeGame.scores.reduce((sum, h) => sum + (h.totalStrokes || 0), 0);
                  const totalPar = activeGame.scores.reduce((sum, h) => sum + (h.par || 0), 0);
                  const diff = totalStrokes - totalPar;
                  let diffStr = '';
                  if (diff === 0) diffStr = '(E)';
                  else if (diff > 0) diffStr = `(+${diff})`;
                  else diffStr = `(${diff})`;
                  return `Team Score: ${totalStrokes} ${diffStr}`;
                })()}
              </Text>
            </View>
            <View style={styles.playerButtonsRow}>
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

          {/* Box 2: Strokes Recorded + Save & Next Hole */}
          <View style={styles.elevatedCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.label}>Strokes Recorded:</Text>
              <TouchableOpacity onPress={handleUndoStroke}>
                <Ionicons name="arrow-undo-circle-outline" size={28} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
            {strokes.length === 0 ? (
              <Text style={styles.noStrokesText}>Tap a player to add a stroke.</Text>
            ) : (
              <View style={styles.strokesPillGrid}>
                {strokes.map((stroke, index) => (
                  <View key={index} style={styles.strokesPill}>
                    <Text style={styles.strokesPillName}>{stroke.playerName}</Text>
                    <Text style={styles.strokesPillShot}>Shot {stroke.number}</Text>
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity style={[styles.nextButton, { marginTop: 18 }]} onPress={handleNextHole}>
              <Text style={styles.nextButtonText}>
                {currentHole >= activeGame.totalHoles ? 'Finish Game' : 'Save & Next Hole'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Box 3: Scorecard */}
          {activeGame.scores && activeGame.scores.length > 0 && (
            <View style={styles.elevatedCard}>
              <Text style={styles.label}>Scorecard</Text>
              <View style={styles.scorecardGrid}>
                {activeGame.scores.map((holeScore) => (
                  <View key={holeScore.hole} style={styles.scorecardItem}>
                    <Text style={styles.scorecardHole}>{holeScore.hole}</Text>
                    <Text style={styles.scorecardPar}>Par {holeScore.par}</Text>
                    <Text style={styles.scorecardScore}>
                      {getScoreEmoji(holeScore.totalStrokes, holeScore.par)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screenTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.2,
  },
  elevatedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  holeDetailsCentered: {
    fontSize: 18,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 10,
  },
  scoreControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  label: { fontSize: 16, fontWeight: 'bold' },
  teamScoreLabel: { fontSize: 17, fontWeight: 'bold', color: COLORS.primary, marginLeft: 12 },
  playerButtons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  playerButton: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, margin: 4 },
  playerButtonText: { color: '#fff', fontWeight: 'bold' },
  strokesSection: { marginHorizontal: 16, marginBottom: 16 },
  noStrokesText: { fontStyle: 'italic', color: COLORS.textLight, textAlign: 'center', paddingVertical: 10 },
  strokesPillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  strokesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f8fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  strokesPillName: {
    fontWeight: 'bold',
    color: COLORS.text,
    fontSize: 14,
    marginRight: 6,
  },
  strokesPillShot: {
    color: COLORS.textLight,
    fontSize: 13,
  },
  scorecardSection: { marginHorizontal: 16, marginTop: 8 },
  scorecardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -2,
    paddingHorizontal: 0,
  },
  scorecardItem: { 
    width: '11.1%',
    backgroundColor: '#fff', 
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderRadius: 6, 
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 0,
  },
  scorecardHole: { fontSize: 12, fontWeight: 'bold' },
  scorecardPar: { fontSize: 11, color: COLORS.textLight },
  scorecardScore: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  nextButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, margin: 16, alignItems: 'center' },
  nextButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});