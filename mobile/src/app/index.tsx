import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { api } from '@/api';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('🔵 WELCOME (index.tsx) SE MONTÓ');
  }, []);

  const handleContinue = async () => {
    setIsLoading(true);

    try {
      const destination = await api.getStartupDestination();
      router.replace(destination);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.four,
      }}
    >
      <ThemedText
        themeColor="accent"
        style={{ fontSize: 34, fontWeight: '800', letterSpacing: 3, textAlign: 'center' }}
      >
        NUTREVIA
      </ThemedText>

      <ThemedText
        themeColor="textSecondary"
        type="small"
        style={{ marginTop: Spacing.one, textAlign: 'center' }}
      >
        Nutrición inteligente
      </ThemedText>

      <PrimaryButton
        label={isLoading ? '' : 'Comenzar'}
        loading={isLoading}
        onPress={handleContinue}
        style={{ marginTop: Spacing.six, width: '100%' }}
      />
    </ThemedView>
  );
} 