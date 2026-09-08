import { useState } from 'react';
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Link, router } from 'expo-router';

import { api } from '@/api';
import { AppScreen } from '@/components/app-screen';
import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';


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
    <AppScreen scroll keyboardShouldPersistTaps="handled">
      <BrandMark centered compact />

      <ThemedText type="title" style={{ marginTop: Spacing.five, textAlign: 'center' }}>
        Bienvenido a Nutrevia
      </ThemedText>

      <ThemedText
        type="small"
        themeColor="accent"
        style={{ marginTop: Spacing.two, textAlign: 'center' }}
      >
        Registra tu alimentación de forma simple e inteligente.
      </ThemedText>

      <TouchableOpacity
        disabled
        style={{
          backgroundColor: '#fff',
          minHeight: 58,
          justifyContent: 'center',
          paddingHorizontal: Spacing.four,
          borderRadius: 14,
          marginTop: Spacing.five,
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
          G  Continuar con Google — próximamente
        </ThemedText>
      </TouchableOpacity>

      <ThemedText
        themeColor="textSecondary"
        style={{ marginTop: Spacing.five }}
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
          borderRadius: 14,
          minHeight: 58,
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
          borderRadius: 14,
          minHeight: 58,
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

      <PrimaryButton
  label="Iniciar sesión"
  loading={isLoading}
  onPress={handleLogin}
  style={{ marginTop: Spacing.four }}
   />

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
    </AppScreen>
  );
}
