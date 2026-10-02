import { toDateKey } from './localDiaryStore';

export interface WellbeingEntry {
  date: string; 
  sleepHours?: number;
  stressLevel?: number; // escala 1-5
  fatigueLevel?: number; // escala 1-5
}

type Listener = () => void;
let localWellbeingEntries: WellbeingEntry[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function addLocalWellbeingEntry(entry: Omit<WellbeingEntry, 'date'>, date: Date = new Date()) {
  const dateKey = toDateKey(date);

  // Si ya existe un registro para hoy, lo reemplaza en vez de duplicarlo
  // (mismo criterio que usamos con el peso).
  const withoutSameDate = localWellbeingEntries.filter((existing) => existing.date !== dateKey);
  localWellbeingEntries = [...withoutSameDate, { date: dateKey, ...entry }];
  notify();
}

export function removeLocalWellbeingEntry(date: string) {
  localWellbeingEntries = localWellbeingEntries.filter((entry) => entry.date !== date);
  notify();
}

export function getLocalWellbeingEntries(): WellbeingEntry[] {
  return [...localWellbeingEntries].sort((a, b) => a.date.localeCompare(b.date));
}

export function getMostRecentWellbeingEntry(): WellbeingEntry | null {
  const entries = getLocalWellbeingEntries();
  return entries.length > 0 ? entries[entries.length - 1] : null;
}

export function subscribeToLocalWellbeingEntries(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}