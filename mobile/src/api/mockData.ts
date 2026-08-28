import { DailySummary, WeightEntry, UserProfile } from './types';

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