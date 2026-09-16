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

export function addLocalMeal(meal: Meal) {
  localMeals = [...localMeals, meal];
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