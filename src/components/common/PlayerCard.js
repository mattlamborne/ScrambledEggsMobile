import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PlayerCard({
  name,
  avatarUrl,
  onRemove,
  isHost,
  isRegistered,
  isGuest,
  editable,
  value,
  onChangeText,
  placeholder
}) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatarWrapper}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
            </View>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            style={styles.nameInput}
            value={value}
            onChangeText={onChangeText}
            editable={editable}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textLight}
          />
          <View style={styles.labelRow}>
            {isRegistered && <Text style={styles.registeredLabel}>Registered</Text>}
            {isGuest && <Text style={styles.guestLabel}>Guest</Text>}
          </View>
        </View>
        {onRemove && (
          <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
            <Ionicons name="remove-circle-outline" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    marginRight: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarInitials: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    backgroundColor: 'transparent',
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  labelRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  registeredLabel: {
    backgroundColor: COLORS.secondary,
    color: '#fff',
    borderRadius: 6,
    paddingHorizontal: 6,
    fontSize: 12,
    marginRight: 4,
  },
  guestLabel: {
    backgroundColor: '#eee',
    color: COLORS.text,
    borderRadius: 6,
    paddingHorizontal: 6,
    fontSize: 12,
  },
  removeBtn: {
    marginLeft: 8,
  },
}); 