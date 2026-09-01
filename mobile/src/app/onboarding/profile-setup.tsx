import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';

import { api } from '@/api';
import {
  ActivityLevel,
  CalculationSex,
} from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';


const activityOptions: {
  value: ActivityLevel;
  title: string;
  description: string;
}[] = [
  {
    value: 'sedentary',
    title: 'Sedentaria',
    description: 'Poca o ninguna actividad física',
  },
  {
    value: 'light',
    title: 'Ligera',
    description: 'Actividad física 1–2 días por semana',
  },
  {
    value: 'moderate',
    title: 'Moderada',
    description: 'Actividad física 3–4 días por semana',
  },
  {
    value: 'active',
    title: 'Alta',
    description: 'Actividad física 5–6 días por semana',
  },
  {
    value: 'very_active',
    title: 'Muy alta',
    description: 'Actividad física intensa todos los días',
  },
];

const calculationSexOptions: {
  value: CalculationSex;
  title: string;
}[] = [
  {
    value: 'male',
    title: 'Masculino',
  },
  {
    value: 'female',
    title: 'Femenino',
  },
];


export default function ProfileSetupScreen() {
  const theme = useTheme();

  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] =
    useState<ActivityLevel | null>(null);
  const [calculationSex, setCalculationSex] =
    useState<CalculationSex | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (
      !age ||
      !height ||
      !weight ||
      !activityLevel ||
      !calculationSex
    ) {
      Alert.alert(
        'Información incompleta',
        'Completa todos los datos antes de continuar.',
      );
      return;
    }

    const parsedAge = Number(age);
    const parsedHeight = Number(height.replace(',', '.'));
    const parsedWeight = Number(weight.replace(',', '.'));

    if (
      !Number.isFinite(parsedAge) ||
      !Number.isFinite(parsedHeight) ||
      !Number.isFinite(parsedWeight)
    ) {
      Alert.alert(
        'Datos incorrectos',
        'Revisa la edad, altura y peso ingresados.',
      );
      return;
    }

    setIsLoading(true);

    try {
      await api.saveProfile({
        age: parsedAge,
        heightCm: parsedHeight,
        currentWeightKg: parsedWeight,
        activityLevel,
        calculationSex,
      });

      router.push('/onboarding/goal-selection');
    } catch (error) {
      Alert.alert(
        'No fue posible guardar el perfil',
        error instanceof Error
          ? error.message
          : 'Inténtalo nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: Spacing.four,
          paddingBottom: Spacing.six,
        }}
      >
        <ThemedText type="small" themeColor="accent">
          Paso 1 de 2
        </ThemedText>

        <ThemedText
          type="subtitle"
          style={{ marginTop: Spacing.two }}
        >
          Cuéntanos sobre ti
        </ThemedText>

        <ThemedText
          themeColor="textSecondary"
          style={{ marginTop: Spacing.four }}
        >
          Edad
        </ThemedText>

        <TextInput
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          placeholder="Ingresa tu edad"
          placeholderTextColor={theme.textSecondary}
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
          Altura (cm)
        </ThemedText>

        <TextInput
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
          placeholder="Ingresa tu altura"
          placeholderTextColor={theme.textSecondary}
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
          Peso actual (kg)
        </ThemedText>

        <TextInput
          keyboardType="decimal-pad"
          value={weight}
          onChangeText={setWeight}
          placeholder="Ingresa tu peso"
          placeholderTextColor={theme.textSecondary}
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
          style={{ marginTop: Spacing.four }}
        >
          Sexo utilizado para el cálculo energético
        </ThemedText>

        {calculationSexOptions.map((option) => {
          const selected = calculationSex === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              disabled={isLoading}
              onPress={() => setCalculationSex(option.value)}
              style={{
                borderWidth: 1,
                borderColor: selected
                  ? theme.accent
                  : theme.border,
                backgroundColor: selected
                  ? theme.accent
                  : 'transparent',
                borderRadius: Spacing.three,
                padding: Spacing.three,
                marginTop: Spacing.two,
              }}
            >
              <ThemedText
                style={{
                  fontWeight: '700',
                  color: selected ? '#000' : theme.text,
                }}
              >
                {option.title}
              </ThemedText>
            </TouchableOpacity>
          );
        })}

        <ThemedText
          themeColor="textSecondary"
          style={{ marginTop: Spacing.four }}
        >
          Nivel de actividad física
        </ThemedText>

        {activityOptions.map((option) => {
          const selected = activityLevel === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              disabled={isLoading}
              onPress={() => setActivityLevel(option.value)}
              style={{
                borderWidth: 1,
                borderColor: selected
                  ? theme.accent
                  : theme.border,
                backgroundColor: selected
                  ? theme.accent
                  : 'transparent',
                borderRadius: Spacing.three,
                padding: Spacing.three,
                marginTop: Spacing.two,
              }}
            >
              <ThemedText
                style={{
                  fontWeight: '700',
                  color: selected ? '#000' : theme.text,
                }}
              >
                {option.title}
              </ThemedText>

              <ThemedText
                type="small"
                style={{
                  marginTop: Spacing.one,
                  color: selected
                    ? '#000'
                    : theme.textSecondary,
                }}
              >
                {option.description}
              </ThemedText>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={handleContinue}
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
              Continuar
            </ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}