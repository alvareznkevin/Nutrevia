import { mockDailySummary, mockWeightHistory, mockUserProfile } from './mockData';
import { DailySummary, WeightEntry, UserProfile } from './types';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getDailySummary(): Promise<DailySummary> {
  await delay(400);
  return mockDailySummary;
}

export async function getWeightHistory(): Promise<WeightEntry[]> {
  await delay(400);
  return mockWeightHistory;
}

export async function getUserProfile(): Promise<UserProfile> {
  await delay(400);
  return mockUserProfile;
} 