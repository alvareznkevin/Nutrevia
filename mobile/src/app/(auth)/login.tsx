import { useState } from 'react';
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Link, router } from 'expo-router';

import { api } from '@/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';


export default function LoginScreen() {
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMessage('Completa el correo y la contraseña.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await api.login({
  email: normalizedEmail,
  password,
});

const destination = await api.getStartupDestination();
router.replace(destination);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible iniciar sesión.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four }}>
      <ThemedText type="title">
        Bienvenido a Nutrevia
      </ThemedText>

      <ThemedText
        type="small"
        themeColor="accent"
        style={{ marginTop: Spacing.two }}
      >
        Registra tu alimentación de forma simple e inteligente.
      </ThemedText>

      <TouchableOpacity
        disabled
        style={{
          backgroundColor: '#fff',
          padding: Spacing.four,
          borderRadius: Spacing.three,
          marginTop: Spacing.six,
          opacity: 0.5,
        }}
      >
        <ThemedText
          style={{
            textAlign: 'center',
            fontWeight: '600',
            color: '#000',
          }}
        >
          Continuar con Google — próximamente
        </ThemedText>
      </TouchableOpacity>

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
        placeholder="Ingresa tu contraseña"
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
        onPress={handleLogin}
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
            Iniciar sesión
          </ThemedText>
        )}
      </TouchableOpacity>

      <Link
        href="/(auth)/register"
        style={{
          marginTop: Spacing.three,
          textAlign: 'center',
        }}
      >
        <ThemedText themeColor="accent">
          ¿No tienes una cuenta? Regístrate
        </ThemedText>
      </Link>
    </ThemedView>
  );
}