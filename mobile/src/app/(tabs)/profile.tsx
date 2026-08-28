import { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { api } from '@/api';
import { UserProfile } from '@/api/types';

export default function ProfileScreen() {
  const theme = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    api.getUserProfile().then(setProfile);
  }, []);

  if (!profile) {
    return <ActivityIndicator style={{ flex: 1 }} color={theme.accent} />;
  }

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four }}>
      <ThemedText type="title">Perfil</ThemedText>

      <ThemedView type="backgroundElement" style={{ borderRadius: Spacing.four, padding: Spacing.four, marginTop: Spacing.four }}>
        <ThemedText type="smallBold">{profile.name}</ThemedText>
        <ThemedText themeColor="textSecondary" type="small">{profile.email}</ThemedText>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.three }}>
          <View>
            <ThemedText themeColor="accent" type="small">Edad</ThemedText>
            <ThemedText type="small">{profile.age} años</ThemedText>
          </View>
          <View>
            <ThemedText themeColor="accent" type="small">Altura</ThemedText>
            <ThemedText type="small">{profile.heightCm} cm</ThemedText>
          </View>
          <View>
            <ThemedText themeColor="accent" type="small">Peso actual</ThemedText>
            <ThemedText type="small">{profile.currentWeightKg} kg</ThemedText>
          </View>
        </View>
      </ThemedView>

      <TouchableOpacity
        onPress={() => router.replace('/login')}
        style={{ borderWidth: 1, borderColor: '#e57373', padding: Spacing.four, borderRadius: Spacing.three, marginTop: Spacing.six }}
      >
        <ThemedText style={{ textAlign: 'center', color: '#e57373', fontWeight: '700' }}>Cerrar sesión</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}