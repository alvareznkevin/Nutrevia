import { FoodImageResult } from './types';

// Mantiene el resultado solamente durante el flujo cámara -> revisión.
// Evita enviar el análisis completo como parámetros de navegación.
let pendingFoodAnalysis: FoodImageResult | null = null;

export function setPendingFoodAnalysis(result: FoodImageResult) {
  pendingFoodAnalysis = result;
}

export function getPendingFoodAnalysis(): FoodImageResult | null {
  return pendingFoodAnalysis;
}

export function clearPendingFoodAnalysis() {
  pendingFoodAnalysis = null;
}
