import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TeamLogo from './TeamLogo';

interface GameCardProps {
  game: {
    id: number;
    homeTeam: string;
    awayTeam: string;
    homeTeamId: number;
    awayTeamId: number;
    gameTime: string;
    status: string;
    homeScore?: number;
    awayScore?: number;
  };
  selectedTeamId?: number;
  onSelectTeam: (teamId: number) => void;
  disabled?: boolean;
}

export default function GameCard({ game, selectedTeamId, onSelectTeam, disabled }: GameCardProps) {
  const isFinished = game.status === 'finished';
  const isInProgress = game.status === 'in_progress';
  const canSelect = !disabled && game.status === 'scheduled';

  return (
    <View style={styles.card}>
      <Text style={styles.gameTime}>
        {new Date(game.gameTime).toLocaleDateString('es-ES', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>

      <View style={styles.teamsContainer}>
        {/* Away Team */}
        <TouchableOpacity
          style={[
            styles.teamButton,
            selectedTeamId === game.awayTeamId && styles.teamButtonSelected,
            !canSelect && styles.teamButtonDisabled,
          ]}
          onPress={() => canSelect && onSelectTeam(game.awayTeamId)}
          disabled={!canSelect}
        >
          <TeamLogo teamName={game.awayTeam} size={48} />
          <Text
            style={[
              styles.teamName,
              selectedTeamId === game.awayTeamId && styles.teamNameSelected,
            ]}
          >
            {game.awayTeam}
          </Text>
          {game.awayScore !== null && game.awayScore !== undefined && (
            <Text style={styles.score}>{game.awayScore}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.vsSymbol}>@</Text>

        {/* Home Team */}
        <TouchableOpacity
          style={[
            styles.teamButton,
            selectedTeamId === game.homeTeamId && styles.teamButtonSelected,
            !canSelect && styles.teamButtonDisabled,
          ]}
          onPress={() => canSelect && onSelectTeam(game.homeTeamId)}
          disabled={!canSelect}
        >
          <TeamLogo teamName={game.homeTeam} size={48} />
          <Text
            style={[
              styles.teamName,
              selectedTeamId === game.homeTeamId && styles.teamNameSelected,
            ]}
          >
            {game.homeTeam}
          </Text>
          {game.homeScore !== null && game.homeScore !== undefined && (
            <Text style={styles.score}>{game.homeScore}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Status Badge */}
      {(isInProgress || isFinished) && (
        <View style={[styles.statusBadge, isInProgress && styles.statusLive]}>
          <Text style={styles.statusText}>
            {isInProgress ? '🔴 EN VIVO' : '✓ Finalizado'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameTime: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  teamButtonSelected: {
    borderColor: '#002C5F',
    backgroundColor: '#002C5F',
  },
  teamButtonDisabled: {
    opacity: 0.6,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  teamNameSelected: {
    color: '#fff',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#002C5F',
    marginTop: 4,
  },
  vsSymbol: {
    marginHorizontal: 12,
    fontSize: 16,
    color: '#999',
  },
  statusBadge: {
    marginTop: 12,
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
  },
  statusLive: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});
