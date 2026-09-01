import { useState } from 'react';
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';

import { api } from '@/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';


export default function RegisterScreen() {
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMessage('Completa el correo y la contraseña.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await api.register({
        email: normalizedEmail,
        password,
      });

      router.replace('/onboarding/profile-setup');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible crear la cuenta.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four }}>
      <ThemedText type="title">
        Crea tu cuenta
      </ThemedText>

      <ThemedText
        themeColor="textSecondary"
        style={{ marginTop: Spacing.four }}
      >
        Correo electrónico
      </ThemedText>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Ingresa tu correo electrónico"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        editable={!isLoading}
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: Spacing.three,
          padding: Spacing.three,
          color: theme.text,
          marginTop: Spacing.one,
        }}
      />

      <ThemedText
        themeColor="textSecondary"
        style={{ marginTop: Spacing.three }}
      >
        Contraseña
      </ThemedText>

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Mínimo 8 caracteres"
        placeholderTextColor={theme.textSecondary}
        secureTextEntry
        editable={!isLoading}
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: Spacing.three,
          padding: Spacing.three,
          color: theme.text,
          marginTop: Spacing.one,
        }}
      />

      {errorMessage && (
        <ThemedText
          style={{
            color: '#ef4444',
            marginTop: Spacing.three,
          }}
        >
          {errorMessage}
        </ThemedText>
      )}

      <TouchableOpacity
        onPress={handleRegister}
        disabled={isLoading}
        style={{
          backgroundColor: theme.accent,
          padding: Spacing.four,
          borderRadius: Spacing.three,
          marginTop: Spacing.four,
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <ThemedText
            style={{
              textAlign: 'center',
              fontWeight: '700',
              color: '#000',
            }}
          >
            Registrarse
          </ThemedText>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
}