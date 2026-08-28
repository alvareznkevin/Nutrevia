import { useState } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const theme = useTheme();

  const handleLogin = () => {
    router.push('/onboarding/profile-setup');
  };

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four }}>
      <ThemedText type="title">Bienvenido a Nutrevia</ThemedText>
      <ThemedText type="small" themeColor="accent" style={{ marginTop: Spacing.two }}>
        Registra tu alimentación de forma simple e inteligente.
      </ThemedText>

      <TouchableOpacity style={{ backgroundColor: '#fff', padding: Spacing.four, borderRadius: Spacing.three, marginTop: Spacing.six }}>
        <ThemedText style={{ textAlign: 'center', fontWeight: '600', color: '#000' }}>
          Continuar con Google
        </ThemedText>
      </TouchableOpacity>

      <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.four }}>Correo electrónico</ThemedText>
      <TextInput
        placeholder="Ingresa tu correo electrónico"
        placeholderTextColor={theme.textSecondary}
        style={{ borderWidth: 1, borderColor: theme.border, borderRadius: Spacing.three, padding: Spacing.three, color: theme.text, marginTop: Spacing.one }}
      />

      <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.three }}>Contraseña</ThemedText>
      <TextInput
        placeholder="Ingresa tu contraseña"
        placeholderTextColor={theme.textSecondary}
        secureTextEntry
        style={{ borderWidth: 1, borderColor: theme.border, borderRadius: Spacing.three, padding: Spacing.three, color: theme.text, marginTop: Spacing.one }}
      />

      <TouchableOpacity onPress={handleLogin} style={{ backgroundColor: theme.accent, padding: Spacing.four, borderRadius: Spacing.three, marginTop: Spacing.four }}>
        <ThemedText style={{ textAlign: 'center', fontWeight: '700', color: '#000' }}>Iniciar sesión</ThemedText>
      </TouchableOpacity>

      <Link href="/(auth)/register" style={{ marginTop: Spacing.three, textAlign: 'center' }}>
        <ThemedText themeColor="accent">¿No tienes una cuenta? Regístrate</ThemedText>
      </Link>
    </ThemedView>
  );
}