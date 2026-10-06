import { getLocalMeals, toDateKey } from './localDiaryStore';
import { getLocalWeightEntries, formatWeightDate } from './localWeightStore';

export interface DaySummary {
  date: Date;
  shortLabel: string; // L, M, M, J, V, S, D
  hasRegistry: boolean;
  calories: number;
  proteinGrams: number;
  weightKg: number | null;
}

export interface WeeklyStats {
  days: DaySummary[];
  daysWithRegistry: number;
  avgCalories: number;
  avgProtein: number;
  weightChange: number | null; // null si no hay al menos 2 registros de peso esta semana
}

const SHORT_DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function getMondayOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day; // domingo (0) cuenta como fin de la semana anterior
  result.setDate(result.getDate() + diff);
  return result;
}

export function getWeeklyStats(): WeeklyStats {
  const monday = getMondayOfWeek(new Date());
  const meals = getLocalMeals();
  const weightEntries = getLocalWeightEntries();

  const days: DaySummary[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    // Mismo truco que ya usamos en diary.tsx: comparar por la clave de
    // fecha ISO que genera localDiaryStore.
    const mealsForDay = meals.filter((meal) => meal.date === toDateKey(date));
    const calories = mealsForDay.reduce((total, meal) => total + meal.calories, 0);
    const proteinGrams = mealsForDay.reduce((total, meal) => total + (meal.proteinGrams ?? 0), 0);

    // El peso usa su propio formato de texto ("29 sep"); lo generamos para
    // este día puntual y buscamos si existe un registro que calce.
    const weightLabel = formatWeightDate(date);
    const weightEntry = weightEntries.find((entry) => entry.date === weightLabel);

    return {
      date,
      shortLabel: SHORT_DAY_LABELS[index],
      hasRegistry: mealsForDay.length > 0,
      calories,
      proteinGrams,
      weightKg: weightEntry?.weightKg ?? null,
    };
  });

  const daysWithRegistry = days.filter((day) => day.hasRegistry).length;

  const avgCalories = daysWithRegistry > 0
    ? Math.round(days.reduce((total, day) => total + day.calories, 0) / daysWithRegistry)
    : 0;

  const avgProtein = daysWithRegistry > 0
    ? Math.round(days.reduce((total, day) => total + day.proteinGrams, 0) / daysWithRegistry)
    : 0;

  const weekWeightEntries = days.filter((day) => day.weightKg !== null);
  const weightChange = weekWeightEntries.length >= 2
    ? Math.round((weekWeightEntries[weekWeightEntries.length - 1].weightKg! - weekWeightEntries[0].weightKg!) * 10) / 10
    : null;

  return { days, daysWithRegistry, avgCalories, avgProtein, weightChange };
}