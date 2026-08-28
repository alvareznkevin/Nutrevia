import * as mockClient from './mockClient';

// USE_MOCK = true mientras el backend no esté disponible localmente (no se pudo usar Docker).
// Cuando el endpoint real exista, crear realClient.ts con las mismas funciones y cambiar esto a false.
const USE_MOCK = true; 

export const api = USE_MOCK ? mockClient : mockClient;