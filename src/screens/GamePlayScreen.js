// src/screens/GamePlayScreen.js - Correct React imports
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useGameContext } from '../context/GameContext';
import { useFocusEffect } from '@react-navigation/native';

export default function GamePlayScreen({ navigation }) {
  // Get the active game from context
  const { activeGame, fetchActiveGame, updateGame, saveHoleScore, completeGame } = useGameContext();
  
  useFocusEffect(
    useCallback(() => {
      console.log("GamePlay screen focused, refreshing active game");
      fetchActiveGame();
    }, [fetchActiveGame])
  );
  
  // Rest of your component...

  // If there's no active game, show a message
  if (!activeGame) {
    return (
      <View style={styles.noGameContainer}>
        <Ionicons name="golf-outline" size={64} color={COLORS.disabled} />
        <Text style={styles.noGameText}>No active game</Text>
        <TouchableOpacity 
          style={styles.newGameButton}
          onPress={() => navigation.navigate('New Game')}
        >
          <Text style={styles.newGameText}>Start a New Game</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Set up local state for gameplay
  const [currentHole, setCurrentHole] = useState(activeGame.currentHole || 1);
  const [holePar, setHolePar] = useState(null);
  const [currentStroke, setCurrentStroke] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [strokes, setStrokes] = useState([]);
  const [holeScores, setHoleScores] = useState(activeGame.holeScores || []);
  const [totalScore, setTotalScore] = useState(0);
  const [relativeToPar, setRelativeToPar] = useState(0);
  
  // Calculate running total score
  useEffect(() => {
    const total = holeScores.reduce((sum, hole) => sum + (hole?.strokes?.length || 0), 0);
    setTotalScore(total);
    
    // Calculate relative to par
    const parDiff = holeScores.reduce((diff, hole) => {
      if (hole?.par && hole?.strokes) {
        return diff + (hole.strokes.length - hole.par);
      }
      return diff;
    }, 0);
    setRelativeToPar(parDiff);
  }, [holeScores]);
  
  // Load existing hole data if available
  useEffect(() => {
    if (activeGame.holeScores && activeGame.holeScores[currentHole - 1]) {
      const holeData = activeGame.holeScores[currentHole - 1];
      if (holeData.par) {
        setHolePar(holeData.par);
      }
      if (holeData.strokes) {
        setStrokes(holeData.strokes);
        setCurrentStroke(holeData.strokes.length + 1);
      }
    }
  }, [currentHole, activeGame]);
  
  // Function to handle selecting hole par
  const handleSelectPar = (par) => {
    setHolePar(par);
    
    // Update the hole scores with the selected par
    const newHoleScores = [...holeScores];
    if (!newHoleScores[currentHole - 1]) {
      newHoleScores[currentHole - 1] = { hole: currentHole, par, strokes: [] };
    } else {
      newHoleScores[currentHole - 1].par = par;
    }
    
    setHoleScores(newHoleScores);
    
    // Update game in context
    updateGame({
      ...activeGame,
      holeScores: newHoleScores
    });
  };
  
  // Function to handle player selection for current stroke
  const handleSelectPlayer = (playerId) => {
    // Find player name for the selected ID
    const player = activeGame.players.find(p => p.id === playerId);
    
    // Add the stroke with player info
    const newStrokes = [...strokes, { 
      number: currentStroke, 
      playerId, 
      playerName: player?.name || 'Unknown'
    }];
    
    setStrokes(newStrokes);
    setCurrentStroke(currentStroke + 1);
    setSelectedPlayer(null); // Reset selection for next stroke
    
    // Update the hole scores with the new stroke
    const newHoleScores = [...holeScores];
    if (!newHoleScores[currentHole - 1]) {
      newHoleScores[currentHole - 1] = { 
        hole: currentHole, 
        par: holePar || 4, // Default to par 4 if not set
        strokes: newStrokes 
      };
    } else {
      newHoleScores[currentHole - 1].strokes = newStrokes;
    }
    
    setHoleScores(newHoleScores);
    
    // Update game in context
    updateGame({
      ...activeGame,
      holeScores: newHoleScores,
      currentHole
    });
  };
  
  // Function to delete the last stroke
  const handleDeleteLastStroke = () => {
    if (strokes.length === 0) return;
    
    const newStrokes = [...strokes];
    newStrokes.pop();
    setStrokes(newStrokes);
    setCurrentStroke(currentStroke - 1);
    
    // Update the hole scores
    const newHoleScores = [...holeScores];
    if (newHoleScores[currentHole - 1]) {
      newHoleScores[currentHole - 1].strokes = newStrokes;
    }
    
    setHoleScores(newHoleScores);
    
    // Update game in context
    updateGame({
      ...activeGame,
      holeScores: newHoleScores
    });
  };
  
  // Function to save current hole and move to next hole
  const handleNextHole = async () => {
    if (strokes.length === 0) {
      Alert.alert('No Strokes', 'Please record at least one stroke before proceeding.');
      return;
    }
    
    // Ensure hole par is set
    if (!holePar) {
      Alert.alert('Missing Par', 'Please select a par value for this hole.');
      return;
    }
    
    // Save the current hole to Supabase
    const success = await saveHoleScore(
      activeGame.id,
      currentHole,
      strokes,
      strokes.length
    );
    
    if (!success) {
      return; // Error was already shown by the saveHoleScore function
    }
    
    // Check if game is complete
    if (currentHole === activeGame.holeCount) {
      // Calculate total score
      const updatedScores = [...holeScores, { 
        hole: currentHole, 
        strokes: strokes,
        totalStrokes: strokes.length
      }];
      
      const totalStrokeCount = updatedScores.reduce(
        (total, hole) => total + (hole.totalStrokes || hole.strokes.length), 
        0
      );
      
      Alert.alert(
        'Game Complete',
        `You've completed all ${activeGame.holeCount} holes with a total score of ${totalStrokeCount}!`,
        [
          { 
            text: 'View Scorecard', 
            onPress: () => {
              // Navigate to scorecard view (to be implemented)
              Alert.alert('Scorecard', 'Scorecard view coming soon');
            } 
          },
          { 
            text: 'Finish Game', 
            onPress: async () => {
              // Complete the game in Supabase
              const completed = await completeGame(activeGame.id, totalStrokeCount);
              if (completed) {
                navigation.navigate('Home');
              }
            }
          }
        ]
      );
    } else {
      // Move to next hole
      setCurrentHole(currentHole + 1);
      setHolePar(null);
      setCurrentStroke(1);
      setStrokes([]);
      setSelectedPlayer(null);
      
      // Update game in context
      updateGame({
        ...activeGame,
        currentHole: currentHole + 1,
        holeScores: [...holeScores, { 
          hole: currentHole, 
          strokes: strokes,
          totalStrokes: strokes.length
        }],
      });
    }
  };
  
  // Format relative score for display (E for even, +/- for over/under)
  const formatRelativeScore = (score, par) => {
    const diff = score - par;
    if (diff === 0) return `${score} (E)`;
    return `${score} (${diff > 0 ? '+' : ''}${diff})`;
  };
  
  // Get GPS coordinates (mock for now)
  const gpsCoordinates = {
    latitude: 37.785834 + (Math.random() * 0.01).toFixed(6),
    longitude: -122.406417 + (Math.random() * 0.01).toFixed(6)
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hole {currentHole}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={styles.card}>
        <View style={styles.courseInfo}>
          <Text style={styles.courseName}>{activeGame.courseName}</Text>
          <View style={styles.coursePar}>
            <Text style={styles.courseParText}>
              Course Par: {activeGame.coursePar} {relativeToPar !== 0 && `(${relativeToPar > 0 ? '+' : ''}${relativeToPar})`}
            </Text>
          </View>
        </View>
        
        <View style={styles.gpsInfo}>
          <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.gpsText}>
            GPS: {gpsCoordinates.latitude}, {gpsCoordinates.longitude}
          </Text>
        </View>
        
        {!holePar ? (
          // Par selection view
          <View>
            <Text style={styles.parQuestion}>What is the par for hole {currentHole}?</Text>
            <View style={styles.parButtons}>
              <TouchableOpacity 
                style={styles.parButton} 
                onPress={() => handleSelectPar(3)}
              >
                <Text style={styles.parButtonText}>3</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.parButton} 
                onPress={() => handleSelectPar(4)}
              >
                <Text style={styles.parButtonText}>4</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.parButton} 
                onPress={() => handleSelectPar(5)}
              >
                <Text style={styles.parButtonText}>5</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Stroke tracking view
          <View>
            <View style={styles.holeInfo}>
              <View style={styles.currentStrokeInfo}>
                <Text style={styles.currentStrokeLabel}>Current stroke: {currentStroke}</Text>
                <Text style={styles.selectPlayerPrompt}>Select whose shot to use:</Text>
              </View>
              
              <View style={styles.scoreDisplay}>
                <Text style={styles.scoreNumber}>{strokes.length}</Text>
                <Text style={styles.scoreLabel}>Strokes</Text>
              </View>
            </View>
            
            <View style={styles.playerButtons}>
              {activeGame.players.map(player => (
                <TouchableOpacity 
                  key={player.id}
                  style={[
                    styles.playerButton,
                    selectedPlayer === player.id && styles.playerButtonSelected
                  ]}
                  onPress={() => handleSelectPlayer(player.id)}
                >
                  <Text style={[
                    styles.playerButtonText,
                    selectedPlayer === player.id && styles.playerButtonTextSelected
                  ]}>
                    {player.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {strokes.length > 0 && (
              <View style={styles.strokesSection}>
                <View style={styles.strokesHeader}>
                  <Text style={styles.strokesRecorded}>Strokes recorded:</Text>
                  <TouchableOpacity onPress={handleDeleteLastStroke}>
                    <View style={styles.deleteButton}>
                      <Ionicons name="trash-outline" size={18} color="#fff" />
                      <Text style={styles.deleteButtonText}>Delete Last</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.strokesList}>
                  {strokes.map((stroke, index) => (
                    <View key={index} style={styles.strokeItem}>
                      <Text style={styles.strokeNumber}>Stroke {stroke.number}</Text>
                      <Text style={styles.strokePlayer}>{stroke.playerName}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={handleNextHole}
            >
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.nextButtonText}>
                Save & Next Hole
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Previous Holes Section */}
      {holeScores.length > 0 && (
        <View style={styles.previousHolesSection}>
          <Text style={styles.previousHolesTitle}>Previous Holes:</Text>
          
          {holeScores.map((hole, index) => {
            if (!hole || index >= currentHole - 1) return null;
            
            return (
              <View key={index} style={styles.previousHoleCard}>
                <View style={styles.previousHoleHeader}>
                  <Text style={styles.previousHoleName}>
                    Hole {hole.hole} <Text style={styles.previousHolePar}>Par {hole.par}</Text>
                  </Text>
                  
                  <Text style={styles.previousHoleScore}>
                    {formatRelativeScore(hole.strokes?.length || 0, hole.par)}
                  </Text>
                </View>
                
                {hole.strokes && (
                  <Text style={styles.previousHoleStrokes}>
                    {hole.strokes.map((stroke, i) => (
                      `${i + 1}: ${stroke.playerName} `
                    ))}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  noGameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
  },
  noGameText: {
    fontSize: 18,
    color: COLORS.textLight,
    marginVertical: 16,
  },
  newGameButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
  },
  newGameText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  courseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  coursePar: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  courseParText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  gpsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gpsText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  parQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: 16,
  },
  parButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  parButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    margin: 4,
    borderRadius: 8,
  },
  parButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  holeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  currentStrokeInfo: {
    flex: 3,
  },
  currentStrokeLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectPlayerPrompt: {
    fontSize: 14,
    color: COLORS.text,
  },
  scoreDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scoreLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  playerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  playerButton: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    width: '48%',
    alignItems: 'center',
  },
  playerButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  playerButtonText: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  playerButtonTextSelected: {
    color: '#fff',
  },
  strokesSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  strokesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  strokesRecorded: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  strokesList: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  strokeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  strokeNumber: {
    color: COLORS.text,
  },
  strokePlayer: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  previousHolesSection: {
    padding: 16,
    paddingTop: 0,
    marginBottom: 24,
  },
  previousHolesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  previousHoleCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  previousHoleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  previousHoleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  previousHolePar: {
    fontWeight: 'normal',
    color: COLORS.textLight,
  },
  previousHoleScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  previousHoleStrokes: {
    fontSize: 14,
    color: COLORS.text,
  },
});