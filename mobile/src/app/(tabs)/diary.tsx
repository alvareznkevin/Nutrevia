import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { api } from '@/api';
import { DailySummary } from '@/api/types';
import { AppScreen } from '@/components/app-screen';
import { BrandMark } from '@/components/brand-mark';
import { DateNavigator } from '@/components/ui/DateNavigator';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DiaryScreen() {
  const theme = useTheme();

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [summary, setSummary] =
    useState<DailySummary | null>(null);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadSummary = async () => {
    setErrorMessage(null);

    try {
      const result = await api.getDailySummary();
      setSummary(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible cargar el diario.',
      );
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const isToday = isSameDay(selectedDate, new Date());

  if (!summary && !errorMessage) {
    return (
      <ActivityIndicator
        style={{ flex: 1 }}
        color={theme.accent}
      />
    );
  }

  if (!summary) {
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
          onPress={loadSummary}
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
    <AppScreen scroll>
      <BrandMark compact />

      <ThemedText type="subtitle" style={{ marginTop: Spacing.four }}>
        Diario nutricional
      </ThemedText>

      <View style={{ marginTop: Spacing.four }}>
        <DateNavigator
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </View>

      {!isToday ? (
        <ThemedView
          type="backgroundElement"
          style={{
            borderRadius: Spacing.three,
            padding: Spacing.four,
            marginTop: Spacing.four,
          }}
        >
          <ThemedText
            themeColor="textSecondary"
            style={{ textAlign: 'center' }}
          >
            La consulta de días anteriores estará disponible cuando el
            historial de comidas se encuentre conectado.
          </ThemedText>
        </ThemedView>
      ) : (
        <>
          <ThemedView
            type="backgroundElement"
            style={{
              borderRadius: Spacing.four,
              padding: Spacing.four,
              marginTop: Spacing.four,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <ThemedText>
              Resumen del día — {summary.date}
            </ThemedText>

            <ThemedText
              style={{
                fontSize: 34,
                lineHeight: 42,
                fontWeight: '700',
                marginTop: Spacing.two,
              }}
            >
              {summary.consumedCalories} / {summary.goal.calories} kcal
            </ThemedText>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: Spacing.three,
              }}
            >
              <View>
                <ThemedText themeColor="accent" type="small">
                  Proteínas
                </ThemedText>
                <ThemedText type="small">
                  {summary.consumedMacros.protein} / {summary.goal.protein} g
                </ThemedText>
              </View>

              <View>
                <ThemedText themeColor="accent" type="small">
                  Carbohidratos
                </ThemedText>
                <ThemedText type="small">
                  {summary.consumedMacros.carbs} / {summary.goal.carbs} g
                </ThemedText>
              </View>

              <View>
                <ThemedText themeColor="accent" type="small">
                  Grasas
                </ThemedText>
                <ThemedText type="small">
                  {summary.consumedMacros.fat} / {summary.goal.fat} g
                </ThemedText>
              </View>
            </View>
          </ThemedView>

          <ThemedText
            type="smallBold"
            style={{ marginTop: Spacing.four }}
          >
            Comidas registradas
          </ThemedText>

          {summary.meals.length === 0 ? (
            <ThemedView
              type="backgroundElement"
              style={{
                borderRadius: Spacing.three,
                padding: Spacing.four,
                marginTop: Spacing.two,
              }}
            >
              <ThemedText
                themeColor="textSecondary"
                style={{ textAlign: 'center' }}
              >
                Todavía no has registrado comidas hoy.
              </ThemedText>
            </ThemedView>
          ) : (
            summary.meals.map((meal) => (
              <ThemedView
                key={meal.id}
                type="backgroundElement"
                style={{
                  borderRadius: Spacing.three,
                  padding: Spacing.three,
                  marginTop: Spacing.two,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <View>
                  <ThemedText
                    type="smallBold"
                    style={{ textTransform: 'capitalize' }}
                  >
                    {meal.type}
                  </ThemedText>

                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                  >
                    {meal.time} · {meal.description}
                  </ThemedText>
                </View>

                <ThemedText type="smallBold">
                  {meal.calories} kcal
                </ThemedText>
              </ThemedView>
            ))
          )}

          <TouchableOpacity
            onPress={() => router.push('/camera')}
            style={{
              backgroundColor: theme.accent,
              padding: Spacing.four,
              borderRadius: Spacing.three,
              marginTop: Spacing.four,
            }}
          >
            <ThemedText
              style={{
                textAlign: 'center',
                fontWeight: '700',
                color: '#000',
              }}
            >
              + Registrar comida
            </ThemedText>
          </TouchableOpacity>
        </>
      )}
    </AppScreen>
  );
}
