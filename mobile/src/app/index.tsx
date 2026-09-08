import { useState } from 'react';
import { router } from 'expo-router';

import { api } from '@/api';
import { AppScreen } from '@/components/app-screen';
import { BrandMark } from '@/components/brand-mark';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  const [isLoading, setIsLoading] = useState(false);

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
    <AppScreen
      contentContainerStyle={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <BrandMark centered />

      <ThemedText
        themeColor="textSecondary"
        style={{ marginTop: Spacing.two, textAlign: 'center' }}
      >
        Nutrición inteligente
      </ThemedText>

      <PrimaryButton
        label={isLoading ? '' : 'Comenzar'}
        loading={isLoading}
        onPress={handleContinue}
        style={{ marginTop: Spacing.six, width: '100%', maxWidth: 560 }}
      />
    </AppScreen>
  );
}
