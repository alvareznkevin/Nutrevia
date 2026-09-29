import { useCallback, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { MoreVertical, Trash2 } from 'lucide-react-native';

import { api } from '@/api';
import { DailySummary } from '@/api/types';
import { toLocalDateKey } from '@/api/weightDate';
import { AppScreen } from '@/components/app-screen';
import { BrandMark } from '@/components/brand-mark';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
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

function formatSelectedDate(date: Date) {
  return new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long' }).format(date);
}

function MealOptionsMenu({ onDelete }: { onDelete: () => void }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity onPress={() => setOpen((value) => !value)}>
        <MoreVertical color={theme.textSecondary} size={18} />
      </TouchableOpacity>

      {open && (
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: 24,
            backgroundColor: theme.backgroundElement,
            borderRadius: Spacing.two,
            borderWidth: 1,
            borderColor: theme.border,
            paddingVertical: Spacing.one,
            minWidth: 160,
            zIndex: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setOpen(false);
              onDelete();
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two, paddingHorizontal: Spacing.three }}
          >
            <Trash2 color="#ef4444" size={16} />
            <ThemedText type="small" style={{ color: '#ef4444' }}>Eliminar comida</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function DiaryScreen() {
  const theme = useTheme();

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { saved } = useLocalSearchParams<{ saved?: string }>();
  const selectedDateKey = toLocalDateKey(selectedDate);

  const loadSummary = useCallback(async () => {
    setErrorMessage(null);

    try {
      const result = await api.getDailySummary(selectedDateKey);
      setSummary(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible cargar el diario.');
    }
  }, [selectedDateKey]);

  useFocusEffect(useCallback(() => {
    setSummary(null);
    void loadSummary();
  }, [loadSummary]));

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await api.deleteMeal(mealId);
      await loadSummary();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible eliminar la comida.');
    }
  };

  const isToday = isSameDay(selectedDate, new Date());

  if (!summary && !errorMessage) {
    return <ActivityIndicator style={{ flex: 1 }} color={theme.accent} />;
  }

  if (!summary) {
    return (
      <ThemedView style={{ flex: 1, padding: Spacing.four, justifyContent: 'center' }}>
        <ThemedText style={{ color: '#ef4444', textAlign: 'center' }}>{errorMessage}</ThemedText>
        <PrimaryButton label="Intentar nuevamente" onPress={loadSummary} style={{ marginTop: Spacing.four }} />
      </ThemedView>
    );
  }

  return (
    <AppScreen scroll>
      <BrandMark compact />

      <ThemedText type="subtitle" style={{ marginTop: Spacing.four }}>
        Diario nutricional
      </ThemedText>

      {saved === '1' && (
        <ThemedView
          type="backgroundElement"
          style={{ borderRadius: Spacing.three, padding: Spacing.three, marginTop: Spacing.three, backgroundColor: theme.accent }}
        >
          <ThemedText style={{ color: '#000', fontWeight: '700', textAlign: 'center' }}>
            ✓ Comida guardada correctamente
          </ThemedText>
        </ThemedView>
      )}
      {errorMessage && <ThemedText style={{ color: '#ef4444', marginTop: Spacing.two }}>{errorMessage}</ThemedText>}

      <View style={{ marginTop: Spacing.four }}>
        <DateNavigator selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </View>

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
        <ThemedText>Resumen del día — {formatSelectedDate(selectedDate)}</ThemedText>

        <ThemedText style={{ fontSize: 34, lineHeight: 42, fontWeight: '700', marginTop: Spacing.two }}>
          {summary.consumedCalories} / {summary.goal.calories} kcal
        </ThemedText>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.three }}>
          <View>
            <ThemedText themeColor="accent" type="small">Proteínas</ThemedText>
            <ThemedText type="small">{summary.consumedMacros.protein} / {summary.goal.protein} g</ThemedText>
          </View>
          <View>
            <ThemedText themeColor="accent" type="small">Carbohidratos</ThemedText>
            <ThemedText type="small">{summary.consumedMacros.carbs} / {summary.goal.carbs} g</ThemedText>
          </View>
          <View>
            <ThemedText themeColor="accent" type="small">Grasas</ThemedText>
            <ThemedText type="small">{summary.consumedMacros.fat} / {summary.goal.fat} g</ThemedText>
          </View>
        </View>
      </ThemedView>

      <ThemedText type="smallBold" style={{ marginTop: Spacing.four }}>Comidas registradas</ThemedText>

      {summary.meals.length === 0 ? (
        <ThemedView
          type="backgroundElement"
          style={{ borderRadius: Spacing.three, padding: Spacing.four, marginTop: Spacing.two }}
        >
          <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
            Todavía no hay comidas registradas para este día.
          </ThemedText>
        </ThemedView>
      ) : (
        summary.meals.map((meal) => (
          <ThemedView
            key={meal.id}
            type="backgroundElement"
            style={{ borderRadius: Spacing.three, padding: Spacing.three, marginTop: Spacing.two, flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View style={{ flex: 1, minWidth: 0, paddingRight: Spacing.two }}>
              <ThemedText type="smallBold" style={{ textTransform: 'capitalize' }}>{meal.type}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">{meal.time}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={3} ellipsizeMode="tail">
                {meal.description}
              </ThemedText>
            </View>

            <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: Spacing.one }}>
              <ThemedText type="smallBold">{meal.calories} kcal</ThemedText>
              <MealOptionsMenu onDelete={() => handleDeleteMeal(meal.id)} />
            </View>
          </ThemedView>
        ))
      )}

      {isToday && (
        <PrimaryButton
          label="+ Registrar comida"
          onPress={() => router.push('/camera')}
          style={{ marginTop: Spacing.four }}
        />
      )}
    </AppScreen>
  );
}
