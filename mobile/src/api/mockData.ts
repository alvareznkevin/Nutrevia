import { DailySummary, WeightEntry, UserProfile, FoodCatalogItem } from './types';

export const mockDailySummary: DailySummary = {
  date: '20 de agosto',
  consumedCalories: 1250,
  goal: { calories: 2200, protein: 140, carbs: 270, fat: 65 },
  consumedMacros: { protein: 82, carbs: 145, fat: 38 },
  meals: [
    { id: '1', type: 'desayuno', time: '08:15', calories: 420, description: 'Avena, leche y plátano' },
    { id: '2', type: 'almuerzo', time: '13:40', calories: 830, description: 'Arroz, pechuga de pollo y palta' },
  ],
};

export const mockWeightHistory: WeightEntry[] = [
  { date: '24 jul', weightKg: 77.0 },
  { date: '31 jul', weightKg: 76.6 },
  { date: '7 ago', weightKg: 76.2 },
  { date: '14 ago', weightKg: 75.8 },
  { date: '20 ago', weightKg: 75.8 },
];

export const mockUserProfile: UserProfile = {
  name: 'Anthon',
  email: 'anthon@example.com',
  age: 24,
  heightCm: 175,
  currentWeightKg: 75.8,
  goalWeightKg: 72.0,
};

export const mockFoodCatalog: FoodCatalogItem[] = [
  { id: 'f1', name: 'Pechuga de pollo', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
  { id: 'f2', name: 'Arroz blanco cocido', caloriesPer100g: 130, proteinPer100g: 2.4, carbsPer100g: 28, fatPer100g: 0.3 },
  { id: 'f3', name: 'Palta', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15 },
  { id: 'f4', name: 'Huevo', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11 },
  { id: 'f5', name: 'Plátano', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3 },
  { id: 'f6', name: 'Avena', caloriesPer100g: 389, proteinPer100g: 17, carbsPer100g: 66, fatPer100g: 7 },
  { id: 'f7', name: 'Leche entera', caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3 },
  { id: 'f8', name: 'Pan integral', caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 4.2 },
  { id: 'f9', name: 'Atún en agua', caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 1 },
  { id: 'f10', name: 'Lentejas cocidas', caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4 },
];