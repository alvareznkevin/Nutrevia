import { useState } from 'react';
import {
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Link, router } from 'expo-router';
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { api } from '@/api';
import { AppScreen } from '@/components/app-screen';
import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';


const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;


if (GOOGLE_WEB_CLIENT_ID) {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
}


export default function LoginScreen() {
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const finishAuthentication = async () => {
    const destination =
      await api.getStartupDestination();

    router.replace(destination);
  };


  const handleGoogleLogin = async () => {
    if (!GOOGLE_WEB_CLIENT_ID) {
      setErrorMessage(
        'Falta configurar el Client ID de Google.',
      );
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await GoogleSignin.signIn();

      if (response.type === 'cancelled') {
        return;
      }

      const idToken = response.data.idToken;

      if (!idToken) {
        throw new Error(
          'Google no entregó un token de identidad.',
        );
      }

      await api.loginWithGoogle(idToken);
      await finishAuthentication();
    } catch (error) {
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.IN_PROGRESS) {
          setErrorMessage(
            'Ya existe un inicio de sesión en curso.',
          );
          return;
        }

        if (
          error.code ===
          statusCodes.PLAY_SERVICES_NOT_AVAILABLE
        ) {
          setErrorMessage(
            'Google Play Services no está disponible o necesita actualizarse.',
          );
          return;
        }
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible iniciar sesión con Google.',
      );
    } finally {
      setIsLoading(false);
    }
  };


  const handleLogin = async () => {
    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMessage(
        'Completa el correo y la contraseña.',
      );
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await api.login({
        email: normalizedEmail,
        password,
      });

      await finishAuthentication();
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

      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Light}
        onPress={handleGoogleLogin}
        disabled={isLoading}
        style={{
          width: '100%',
          height: 56,
          marginTop: Spacing.five,
        }}
      />

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
