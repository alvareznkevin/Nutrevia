import { mockDailySummary } from './mockData';
import { DailySummary } from './types';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getDailySummary(): Promise<DailySummary> {
  await delay(400);
  return mockDailySummary;
}
