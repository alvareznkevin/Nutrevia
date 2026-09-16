import { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react-native';

import { api } from '@/api';
import { DailySummary } from '@/api/types';
import { addLocalMeal, getLocalMeals, removeLocalMeal, subscribeToLocalMeals } from '@/api/localDiaryStore';
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
            onPress={() => setOpen(false)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two, paddingHorizontal: Spacing.three }}
          >
            <Pencil color={theme.text} size={16} />
            <ThemedText type="small">Editar comida</ThemedText>
          </TouchableOpacity>

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
  const [localMeals, setLocalMeals] = useState(() => getLocalMeals());
  const { saved } = useLocalSearchParams<{ saved?: string }>();

  const loadSummary = async () => {
    setErrorMessage(null);

    try {
      const result = await api.getDailySummary();
      setSummary(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible cargar el diario.');
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    return subscribeToLocalMeals(() => setLocalMeals(getLocalMeals()));
  }, []);

  const handleDeleteMeal = (mealId: string) => {
    const isLocal = localMeals.some((meal) => meal.id === mealId);

    if (isLocal) {
      removeLocalMeal(mealId);
      return;
    }

    // TODO: reemplazar por api.deleteMeal(mealId) cuando el backend tenga el endpoint.
    setSummary((current) => (current ? { ...current, meals: current.meals.filter((meal) => meal.id !== mealId) } : current));
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

  const localCalories = localMeals.reduce((total, meal) => total + meal.calories, 0);
  const localMacros = localMeals.reduce(
    (totals, meal) => ({
      protein: totals.protein + (meal.proteinGrams ?? 0),
      carbs: totals.carbs + (meal.carbGrams ?? 0),
      fat: totals.fat + (meal.fatGrams ?? 0),
    }),
    { protein: 0, carbs: 0, fat: 0 },
  );
  const combinedMeals = [...summary.meals, ...localMeals];
  const combinedConsumedCalories = summary.consumedCalories + localCalories;
  const combinedConsumedMacros = {
    protein: summary.consumedMacros.protein + localMacros.protein,
    carbs: summary.consumedMacros.carbs + localMacros.carbs,
    fat: summary.consumedMacros.fat + localMacros.fat,
  };

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

      <View style={{ marginTop: Spacing.four }}>
        <DateNavigator selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </View>

      {!isToday ? (
        <ThemedView
          type="backgroundElement"
          style={{ borderRadius: Spacing.three, padding: Spacing.four, marginTop: Spacing.four }}
        >
          <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
            La consulta de días anteriores estará disponible cuando el historial de comidas se encuentre conectado.
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
            <ThemedText>Resumen del día — {summary.date}</ThemedText>

            <ThemedText style={{ fontSize: 34, lineHeight: 42, fontWeight: '700', marginTop: Spacing.two }}>
              {combinedConsumedCalories} / {summary.goal.calories} kcal
            </ThemedText>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.three }}>
              <View>
                <ThemedText themeColor="accent" type="small">Proteínas</ThemedText>
                <ThemedText type="small">{combinedConsumedMacros.protein} / {summary.goal.protein} g</ThemedText>
              </View>
              <View>
                <ThemedText themeColor="accent" type="small">Carbohidratos</ThemedText>
                <ThemedText type="small">{combinedConsumedMacros.carbs} / {summary.goal.carbs} g</ThemedText>
              </View>
              <View>
                <ThemedText themeColor="accent" type="small">Grasas</ThemedText>
                <ThemedText type="small">{combinedConsumedMacros.fat} / {summary.goal.fat} g</ThemedText>
              </View>
            </View>
          </ThemedView>

          <ThemedText type="smallBold" style={{ marginTop: Spacing.four }}>Comidas registradas</ThemedText>

          {combinedMeals.length === 0 ? (
            <ThemedView
              type="backgroundElement"
              style={{ borderRadius: Spacing.three, padding: Spacing.four, marginTop: Spacing.two }}
            >
              <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
                Todavía no has registrado comidas hoy.
              </ThemedText>
            </ThemedView>
          ) : (
            combinedMeals.map((meal) => (
              <ThemedView
                key={meal.id}
                type="backgroundElement"
                style={{ borderRadius: Spacing.three, padding: Spacing.three, marginTop: Spacing.two, flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <View>
                  <ThemedText type="smallBold" style={{ textTransform: 'capitalize' }}>{meal.type}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">{meal.time} · {meal.description}</ThemedText>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                  <ThemedText type="smallBold">{meal.calories} kcal</ThemedText>
                  <MealOptionsMenu onDelete={() => handleDeleteMeal(meal.id)} />
                </View>
              </ThemedView>
            ))
          )}

          <PrimaryButton
            label="+ Registrar comida"
            onPress={() => router.push('/camera')}
            style={{ marginTop: Spacing.four }}
          />
        </>
      )}
    </AppScreen>
  );
}
