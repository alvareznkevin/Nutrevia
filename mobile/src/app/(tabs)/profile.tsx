import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { api } from '@/api';
import { AccountProfile } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';


const activityLabels = {
  sedentary: 'Sedentaria',
  light: 'Ligera',
  moderate: 'Moderada',
  active: 'Alta',
  very_active: 'Muy alta',
};

const calculationSexLabels = {
  male: 'Masculino',
  female: 'Femenino',
};


export default function ProfileScreen() {
  const theme = useTheme();

  const [profile, setProfile] =
    useState<AccountProfile | null>(null);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loadProfile = async () => {
    setErrorMessage(null);

    try {
      const result = await api.getAccountProfile();
      setProfile(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible cargar el perfil.',
      );
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await api.logout();
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!profile && !errorMessage) {
    return (
      <ActivityIndicator
        style={{ flex: 1 }}
        color={theme.accent}
      />
    );
  }

  if (!profile) {
    return (
      <ThemedView
        style={{
          flex: 1,
          padding: Spacing.four,
          justifyContent: 'center',
        }}
      >
        <ThemedText
          style={{
            color: '#ef4444',
            textAlign: 'center',
          }}
        >
          {errorMessage}
        </ThemedText>

        <TouchableOpacity
          onPress={loadProfile}
          style={{
            backgroundColor: theme.accent,
            padding: Spacing.four,
            borderRadius: Spacing.three,
            marginTop: Spacing.four,
          }}
        >
          <ThemedText
            style={{
              color: '#000',
              fontWeight: '700',
              textAlign: 'center',
            }}
          >
            Intentar nuevamente
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={{
        flex: 1,
        padding: Spacing.four,
      }}
    >
      <ThemedText type="title">
        Perfil
      </ThemedText>

      <ThemedView
        type="backgroundElement"
        style={{
          borderRadius: Spacing.four,
          padding: Spacing.four,
          marginTop: Spacing.four,
        }}
      >
        <ThemedText
          themeColor="textSecondary"
          type="small"
        >
          Cuenta
        </ThemedText>

        <ThemedText
          type="smallBold"
          style={{ marginTop: Spacing.one }}
        >
          {profile.email}
        </ThemedText>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: Spacing.four,
          }}
        >
          <View>
            <ThemedText themeColor="accent" type="small">
              Edad
            </ThemedText>
            <ThemedText type="small">
              {profile.age} años
            </ThemedText>
          </View>

          <View>
            <ThemedText themeColor="accent" type="small">
              Altura
            </ThemedText>
            <ThemedText type="small">
              {profile.heightCm} cm
            </ThemedText>
          </View>

          <View>
            <ThemedText themeColor="accent" type="small">
              Peso actual
            </ThemedText>
            <ThemedText type="small">
              {profile.currentWeightKg} kg
            </ThemedText>
          </View>
        </View>

        <View style={{ marginTop: Spacing.four }}>
          <ThemedText themeColor="accent" type="small">
            Actividad física
          </ThemedText>
          <ThemedText type="small">
            {activityLabels[profile.activityLevel]}
          </ThemedText>
        </View>

        <View style={{ marginTop: Spacing.three }}>
          <ThemedText themeColor="accent" type="small">
            Sexo para cálculo energético
          </ThemedText>
          <ThemedText type="small">
            {calculationSexLabels[profile.calculationSex]}
          </ThemedText>
        </View>
      </ThemedView>

      <TouchableOpacity
        onPress={handleLogout}
        disabled={isLoggingOut}
        style={{
          borderWidth: 1,
          borderColor: '#e57373',
          padding: Spacing.four,
          borderRadius: Spacing.three,
          marginTop: Spacing.six,
          opacity: isLoggingOut ? 0.6 : 1,
        }}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="#e57373" />
        ) : (
          <ThemedText
            style={{
              textAlign: 'center',
              color: '#e57373',
              fontWeight: '700',
            }}
          >
            Cerrar sesión
          </ThemedText>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
}