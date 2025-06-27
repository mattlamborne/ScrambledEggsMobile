import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useGameContext } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { getWelcomeMessage } from '../utils/welcomeMessages';
import GradientBackground from '../components/common/GradientBackground';
import { LineChart } from 'react-native-chart-kit';

// Add this helper to generate the last 4 weeks grid
function getLast4WeeksGrid(games) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (7 * 4 - 1));
  // Build a Set of YYYY-MM-DD strings for played days
  const playedDays = new Set(
    games.map(g => new Date(g.created_at).toISOString().slice(0, 10))
  );
  const grid = [];
  for (let week = 0; week < 4; week++) {
    for (let day = 0; day < 7; day++) {
      const d = new Date(start);
      d.setDate(start.getDate() + week * 7 + day);
      grid.push({
        date: d,
        played: playedDays.has(d.toISOString().slice(0, 10)),
        key: d.toISOString().slice(0, 10),
      });
    }
  }
  return grid;
}

function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function HomeScreen({ navigation }) {
  const { activeGame, games } = useGameContext();
  const { profile, user } = useAuth();
  const [welcomeMessage, setWelcomeMessage] = useState('Track your scramble games');

  const last4WeeksGrid = useMemo(() => getLast4WeeksGrid(games), [games]);

  // Calculate user contribution for last 10 games
  const contributionData = useMemo(() => {
    if (!games || games.length === 0) return [];
    
    const validGames = games
      .slice(0, 10)
      .reverse()
      .filter(game => 
        game.user_contribution !== null && 
        game.user_contribution !== undefined && 
        !isNaN(game.user_contribution) &&
        isFinite(game.user_contribution)
      )
      .map(game => Math.max(0, Math.min(100, game.user_contribution))); // Ensure values are between 0-100
    
    return validGames;
  }, [games]);

  // Check if we have valid contribution data
  const hasValidContributionData = contributionData.length > 0 && contributionData.length >= 2;

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
        <View style={styles.headerContainer}>
          <View style={styles.greetingRow}>
            <View style={styles.greetingTextWrap}>
              <Text style={styles.greetingText}>Hello{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}</Text>
              <Text style={styles.insultText}>{welcomeMessage}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileIconRight}>
              {profile?.full_name || profile?.username ? (
                <View style={styles.profileIconCircle}>
                  <Text style={styles.profileIconInitials}>{getInitials(profile?.full_name || profile?.username)}</Text>
                </View>
              ) : (
                <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.elevatedCard, { marginTop: 24 }]}> 
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
              <Text style={styles.noGameEmoji}>⛳️</Text>
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
        </View>

        {/* Contribution Line Graph */}
        <View style={[styles.elevatedCard, { marginTop: 24, alignItems: 'center' }]}> 
          <Text style={styles.contributionTitle}>Your Contribution (Last 10 Games)</Text>
          {hasValidContributionData ? (
            <LineChart
              data={{
                labels: contributionData.map((_, i) => `${i + 1}`),
                datasets: [
                  {
                    data: contributionData,
                  },
                ],
              }}
              width={Dimensions.get('window').width - 64}
              height={180}
              yAxisSuffix="%"
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: COLORS.primary,
                },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
              withDots={true}
              withShadow={false}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataEmoji}>📊</Text>
              <Text style={styles.noDataText}>No recent games!</Text>
              <Text style={styles.noDataSubtext}>Play some games to see your contribution trends</Text>
            </View>
          )}
        </View>

        {/* Calendar Heatmap */}
        <View style={[styles.calendarCard, { marginTop: 24, marginHorizontal: 16 }]}>
          <Text style={styles.calendarTitle}>Last 4 Weeks</Text>
          <View style={styles.calendarGrid}>
            {/* Day labels */}
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <Text key={d + i} style={styles.calendarDayLabel}>{d}</Text>
            ))}
            {/* 4x7 grid */}
            {last4WeeksGrid.map((cell, i) => {
              const isToday = cell.date.toDateString() === new Date().toDateString();
              return (
                <View key={cell.key} style={styles.calendarCellWrap}>
                  <View
                    style={[
                      styles.calendarCell,
                      cell.played && styles.calendarCellPlayed,
                      cell.played && isToday && styles.calendarCellToday,
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  greetingTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 36,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 2,
    textAlign: 'left',
  },
  insultText: {
    fontSize: 20,
    color: COLORS.textLight,
    textAlign: 'left',
    fontWeight: '300',
  },
  profileIconRight: {
    marginLeft: 14,
  },
  profileIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  profileIconInitials: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 0,
    textAlign: 'center',
    letterSpacing: 0.1,
    lineHeight: 34,
    fontFamily: 'System',
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
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 18,
    marginTop: 24,
    fontFamily: 'System',
    letterSpacing: 0.15,
    lineHeight: 28,
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
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
  calendarCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  calendarTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '400',
    marginBottom: 10,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 7 * 36,
    marginTop: 2,
    marginBottom: 2,
  },
  calendarDayLabel: {
    width: 36,
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginBottom: 8,
  },
  calendarCellWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCell: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCellPlayed: {
    backgroundColor: COLORS.primary,
  },
  calendarCellToday: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  elevatedCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginHorizontal: 16,
  },
  noGameEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 8,
  },
  contributionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 18,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  noDataSubtext: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    fontWeight: '300',
  },
});
