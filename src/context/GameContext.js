// src/context/GameContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const GameContext = createContext();

export function GameProvider({ children }) {
  const auth = useAuth() || {};
  const user = auth.user; 
  const [activeGame, setActiveGame] = useState(null);
  const [recentGames, setRecentGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draftGame, setDraftGame] = useState(null);

  // Fetch recent games when user changes
  useEffect(() => {
    if (user) {
      fetchRecentGames();
      fetchActiveGame();
      fetchDraftGame();
    } else {
      setRecentGames([]);
      setActiveGame(null);
      setDraftGame(null);
    }
  }, [user]);

  // Fetch recent completed games
  const fetchRecentGames = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          game_players (*)
        `)
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)  // Only completed games
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      // Transform the data to match your app's expected format
      const transformedGames = data.map(game => ({
        id: game.id,
        courseName: game.course_name,
        holeCount: game.hole_count || 18,
        totalScore: game.total_score,
        players: game.game_players || [],
        date: new Date(game.created_at),
        completed: true,
        completedAt: game.completed_at,
      }));
      
      setRecentGames(transformedGames);
    } catch (error) {
      console.error('Error fetching recent games:', error);
      Alert.alert('Error', 'Failed to load recent games');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active (incomplete) game
  const fetchActiveGame = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get the most recent incomplete game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select(`
          *,
          game_players (*)
        `)
        .eq('user_id', user.id)
        .is('completed_at', null)  // Only incomplete games
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();  // Returns null if no record found
      
      if (gameError) throw gameError;
      
      if (!gameData) {
        setActiveGame(null);
        return;
      }
      
      // Fetch hole scores for the game
      const { data: holeScores, error: holesError } = await supabase
        .from('hole_scores')
        .select(`
          *,
          strokes (*)
        `)
        .eq('game_id', gameData.id)
        .order('hole_number', { ascending: true });
      
      if (holesError) throw holesError;
      
      // Transform data to match app's expected format
      const transformedHoleScores = holeScores.map(hole => ({
        hole: hole.hole_number,
        totalStrokes: hole.total_strokes,
        strokes: hole.strokes.map(stroke => ({
          number: stroke.stroke_number,
          playerName: stroke.player_name,
        })).sort((a, b) => a.number - b.number),
      }));
      
      // Determine current hole (either the next incomplete hole or the last hole + 1)
      let currentHole = 1;
      if (transformedHoleScores.length > 0) {
        const lastHole = Math.max(...transformedHoleScores.map(h => h.hole));
        currentHole = lastHole + 1;
        if (currentHole > gameData.hole_count) {
          currentHole = gameData.hole_count; // Stay on last hole if all are complete
        }
      }
      
      const game = {
        id: gameData.id,
        courseName: gameData.course_name,
        holeCount: gameData.hole_count || 18,
        players: gameData.game_players.map(player => ({
          id: player.id,
          name: player.name,
        })),
        currentHole,
        holeScores: transformedHoleScores,
        date: new Date(gameData.created_at),
        completed: false,
      };
      
      setActiveGame(game);
    } catch (error) {
      console.error('Error fetching active game:', error);
      Alert.alert('Error', 'Failed to load active game');
    } finally {
      setLoading(false);
    }
  };

  // Fetch draft game (if exists)
  const fetchDraftGame = async () => {
    if (!user) return;
    
    try {
      // Get the most recent draft game
      const { data, error } = await supabase
        .from('draft_games')
        .select('*')
        .eq('user_id', user.id)
        .order('last_updated', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      setDraftGame(data ? data.game_data : null);
    } catch (error) {
      console.error('Error fetching draft game:', error);
    }
  };

  // Create a new game
  const createGame = async (gameData) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a game');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create the main game record
      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert([{
          user_id: user.id,
          course_name: gameData.courseName,
          hole_count: gameData.holeCount || 18,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (gameError) throw gameError;
      
      // Add players to the game
      const playerRecords = gameData.players.map(player => ({
        game_id: game.id,
        name: player.name,
      }));
      
      const { error: playersError } = await supabase
        .from('game_players')
        .insert(playerRecords);
      
      if (playersError) throw playersError;
      
      // Clear any draft game
      await clearDraftGame();
      
      // Refresh active game
      await fetchActiveGame();
      
      return game.id;
    } catch (error) {
      console.error('Error creating game:', error);
      Alert.alert('Error', 'Failed to create game');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save or update draft game
  const saveDraftGame = async (draftData) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('draft_games')
        .upsert([{
          user_id: user.id,
          game_data: draftData,
          last_updated: new Date().toISOString(),
        }], { onConflict: 'user_id' });
      
      if (error) throw error;
      
      setDraftGame(draftData);
    } catch (error) {
      console.error('Error saving draft game:', error);
    }
  };

  // Clear draft game
  const clearDraftGame = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('draft_games')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setDraftGame(null);
    } catch (error) {
      console.error('Error clearing draft game:', error);
    }
  };

  // Save hole score
  const saveHoleScore = async (gameId, holeNumber, strokes, totalStrokes) => {
    try {
      // First, check if a hole_score record already exists
      const { data: existingHole, error: checkError } = await supabase
        .from('hole_scores')
        .select('id')
        .eq('game_id', gameId)
        .eq('hole_number', holeNumber)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      let holeScoreId;
      
      if (existingHole) {
        // Update existing hole score
        const { error: updateError } = await supabase
          .from('hole_scores')
          .update({ total_strokes: totalStrokes })
          .eq('id', existingHole.id);
          
        if (updateError) throw updateError;
        
        holeScoreId = existingHole.id;
        
        // Delete existing strokes for this hole
        const { error: deleteError } = await supabase
          .from('strokes')
          .delete()
          .eq('hole_score_id', holeScoreId);
          
        if (deleteError) throw deleteError;
      } else {
        // Create new hole score
        const { data: newHole, error: insertError } = await supabase
          .from('hole_scores')
          .insert([{
            game_id: gameId,
            hole_number: holeNumber,
            total_strokes: totalStrokes,
          }])
          .select()
          .single();
          
        if (insertError) throw insertError;
        
        holeScoreId = newHole.id;
      }
      
      // Add strokes
      const strokeRecords = strokes.map(stroke => ({
        hole_score_id: holeScoreId,
        player_name: stroke.playerName,
        stroke_number: stroke.number,
      }));
      
      const { error: strokesError } = await supabase
        .from('strokes')
        .insert(strokeRecords);
        
      if (strokesError) throw strokesError;
      
      return true;
    } catch (error) {
      console.error('Error saving hole score:', error);
      Alert.alert('Error', 'Failed to save hole score');
      return false;
    }
  };

  // Complete a game
  const completeGame = async (gameId, totalScore) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('games')
        .update({ 
          total_score: totalScore,
          completed_at: new Date().toISOString(),
        })
        .eq('id', gameId);
        
      if (error) throw error;
      
      // Refresh game lists
      await fetchRecentGames();
      await fetchActiveGame();
      
      return true;
    } catch (error) {
      console.error('Error completing game:', error);
      Alert.alert('Error', 'Failed to complete game');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete a game
  const deleteGame = async (gameId) => {
    try {
      setLoading(true);
      
      // Due to cascade deletes in your schema, deleting the game
      // should also delete related records in other tables
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);
        
      if (error) throw error;
      
      // Update local state
      setRecentGames(recentGames.filter(game => game.id !== gameId));
      if (activeGame?.id === gameId) {
        setActiveGame(null);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting game:', error);
      Alert.alert('Error', 'Failed to delete game');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <GameContext.Provider
      value={{
        activeGame,
        recentGames,
        draftGame,
        loading,
        createGame,
        saveDraftGame,
        clearDraftGame,
        saveHoleScore,
        completeGame,
        deleteGame,
        refreshGames: () => {
          fetchRecentGames();
          fetchActiveGame();
        },
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGameContext = () => useContext(GameContext);