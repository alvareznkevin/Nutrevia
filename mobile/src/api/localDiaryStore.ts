import { Meal } from './types';

type Listener = () => void;

// Almacén temporal en memoria, solo para esta sesión de la app.
// TODO: eliminar este archivo cuando el backend tenga un endpoint real
// para guardar y consultar comidas (api.addMeal / api.getDailySummary con historial).
let localMeals: Meal[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

// Clave de fecha local (no UTC) en formato YYYY-MM-DD, para filtrar
// las comidas guardadas localmente por día.
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addLocalMeal(meal: Meal) {
  const mealWithDate: Meal = { date: toDateKey(new Date()), ...meal };
  localMeals = [...localMeals, mealWithDate];
  notify();
}

export function removeLocalMeal(mealId: string) {
  localMeals = localMeals.filter((meal) => meal.id !== mealId);
  notify();
}

export function getLocalMeals(): Meal[] {
  return localMeals;
}

export function subscribeToLocalMeals(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}