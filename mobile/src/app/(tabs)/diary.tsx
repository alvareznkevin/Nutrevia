import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react-native';

import { api } from '@/api';
import { DailySummary } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { DateNavigator } from '@/components/ui/DateNavigator';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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

  const handleDeleteMeal = (mealId: string) => {
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: Spacing.four, paddingBottom: Spacing.six }}
    >
      <ThemedText type="title">Diario nutricional</ThemedText>

      {saved === '1' && (
       <Card style={{ marginTop: Spacing.three, backgroundColor: theme.accent }}>
       <ThemedText style={{ color: '#000', fontWeight: '700', textAlign: 'center' }}>
        ✓ Comida guardada correctamente
       </ThemedText>
       </Card>
      )}

      <View style={{ marginTop: Spacing.four }}>
        <DateNavigator selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </View>

      {!isToday ? (
        <Card style={{ marginTop: Spacing.four }}>
          <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
            La consulta de días anteriores todavía no está disponible — falta que el backend guarde el historial por fecha.
          </ThemedText>
        </Card>
      ) : (
        <>
          <Card style={{ marginTop: Spacing.four }}>
            <ThemedText>Resumen del día — {summary.date}</ThemedText>

            <ThemedText type="title" style={{ marginTop: Spacing.one }}>
              {summary.consumedCalories} / {summary.goal.calories} kcal
            </ThemedText>

            <View style={{ marginTop: Spacing.two }}>
              <ProgressBar value={summary.consumedCalories} max={summary.goal.calories} />
            </View>

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
          </Card>

          <ThemedText type="smallBold" style={{ marginTop: Spacing.four }}>Comidas registradas</ThemedText>

          {summary.meals.length === 0 ? (
            <Card style={{ marginTop: Spacing.two }}>
              <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
                Todavía no has registrado comidas hoy.
              </ThemedText>
            </Card>
          ) : (
            summary.meals.map((meal) => (
              <Card key={meal.id} style={{ marginTop: Spacing.two, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <ThemedText type="smallBold" style={{ textTransform: 'capitalize' }}>{meal.type}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">{meal.time} · {meal.description}</ThemedText>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                  <ThemedText type="smallBold">{meal.calories} kcal</ThemedText>
                  <MealOptionsMenu onDelete={() => handleDeleteMeal(meal.id)} />
                </View>
              </Card>
            ))
          )}

          <PrimaryButton
            label="+ Registrar comida"
            onPress={() => router.push('/camera')}
            style={{ marginTop: Spacing.four }}
          />
        </>
      )}
    </ScrollView>
  );
}