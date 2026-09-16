import { DetectedFood, FoodDetection } from './types';

interface DetectionNutrition {
  name: string;
  suggestedGrams: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

// Valores referenciales por 100 g para el prototipo. El usuario confirma y
// corrige la porción antes de guardar la comida.
const DETECTION_NUTRITION: Record<string, DetectionNutrition> = {
  rice: {
    name: 'Arroz blanco cocido',
    suggestedGrams: 150,
    caloriesPer100g: 130,
    proteinPer100g: 2.4,
    carbsPer100g: 28,
    fatPer100g: 0.3,
  },
  pasta: {
    name: 'Fideos cocidos',
    suggestedGrams: 180,
    caloriesPer100g: 158,
    proteinPer100g: 5.8,
    carbsPer100g: 30.9,
    fatPer100g: 0.9,
  },
  chicken: {
    name: 'Pechuga de pollo',
    suggestedGrams: 150,
    caloriesPer100g: 165,
    proteinPer100g: 31,
    carbsPer100g: 0,
    fatPer100g: 3.6,
  },
  potato: {
    name: 'Papa cocida',
    suggestedGrams: 150,
    caloriesPer100g: 87,
    proteinPer100g: 1.9,
    carbsPer100g: 20.1,
    fatPer100g: 0.1,
  },
  tomato: {
    name: 'Tomate',
    suggestedGrams: 120,
    caloriesPer100g: 18,
    proteinPer100g: 0.9,
    carbsPer100g: 3.9,
    fatPer100g: 0.2,
  },
  egg: {
    name: 'Huevo',
    suggestedGrams: 50,
    caloriesPer100g: 155,
    proteinPer100g: 13,
    carbsPer100g: 1.1,
    fatPer100g: 11,
  },
};

function confidenceLabel(score: number): DetectedFood['confidence'] {
  if (score >= 0.65) return 'alta';
  if (score >= 0.4) return 'media';
  return 'baja';
}

function nutritionFor(key: string, fallbackName: string): DetectionNutrition {
  return DETECTION_NUTRITION[key] ?? {
    name: fallbackName,
    suggestedGrams: 100,
    caloriesPer100g: 0,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 0,
  };
}

export function recalculateDetectedFood(
  food: DetectedFood,
  grams: number,
): DetectedFood {
  const nutrition = nutritionFor(food.key, food.name);
  const factor = grams / 100;

  return {
    ...food,
    grams,
    kcal: Math.round(nutrition.caloriesPer100g * factor),
    proteinGrams: Math.round(nutrition.proteinPer100g * factor),
    carbGrams: Math.round(nutrition.carbsPer100g * factor),
    fatGrams: Math.round(nutrition.fatPer100g * factor),
  };
}

export function detectionToEditableFood(
  detection: FoodDetection,
  index: number,
): DetectedFood {
  const nutrition = nutritionFor(detection.key, detection.name);

  return recalculateDetectedFood(
    {
      id: `${detection.key}-${index}`,
      key: detection.key,
      name: nutrition.name,
      grams: nutrition.suggestedGrams,
      kcal: 0,
      proteinGrams: 0,
      carbGrams: 0,
      fatGrams: 0,
      confidence: confidenceLabel(detection.confidence),
      confidenceScore: detection.confidence,
    },
    nutrition.suggestedGrams,
  );
}
