export interface DailyGoal {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  type: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
  time: string;
  calories: number;
  description: string;
}

export interface DailySummary {
  date: string;
  consumedCalories: number;
  goal: DailyGoal;
  consumedMacros: { protein: number; carbs: number; fat: number };
  meals: Meal[];
}

export interface WeightEntry {
  date: string;
  weightKg: number;
}

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  goalWeightKg: number;
}