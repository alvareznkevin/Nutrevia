import { WeightEntry } from './types';

type Listener = () => void;

// Almacén temporal en memoria, solo para esta sesión de la app.
// TODO: eliminar este archivo cuando el backend tenga un endpoint real
// para guardar y consultar el historial de peso (api.addWeightEntry /
// api.getWeightHistory con persistencia real).
//
// IMPORTANTE: mockWeightHistory (en mockData.ts) usa fechas como texto
// libre en español, sin año, formato "día mes-abreviado" (ej. "24 jul").
// Los registros nuevos generan la fecha con el mismo formato exacto, para
// poder combinar y ordenar ambas fuentes sin tocar el tipo compartido
// WeightEntry (usado también por mockClient/realClient).

const MONTH_LABELS_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

let localWeightEntries: WeightEntry[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function formatWeightDate(date: Date): string {
  return `${date.getDate()} ${MONTH_LABELS_ES[date.getMonth()]}`;
}

export function weightDateSortValue(dateLabel: string): number {
  const [dayText, monthText] = dateLabel.split(' ');
  const day = Number(dayText) || 0;
  const monthIndex = MONTH_LABELS_ES.indexOf(monthText);
  return (monthIndex === -1 ? 0 : monthIndex) * 31 + day;
}

export function addLocalWeightEntry(weightKg: number, date: Date = new Date()) {
  const label = formatWeightDate(date);
  const withoutSameDate = localWeightEntries.filter((existing) => existing.date !== label);
  localWeightEntries = [...withoutSameDate, { date: label, weightKg }];
  notify();
}

export function removeLocalWeightEntry(date: string) {
  localWeightEntries = localWeightEntries.filter((entry) => entry.date !== date);
  notify();
}

export function getLocalWeightEntries(): WeightEntry[] {
  return localWeightEntries;
}

export function subscribeToLocalWeightEntries(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}