import { fetch as expoFetch } from 'expo/fetch';
import { File } from 'expo-file-system';

import {
  AccountProfile,
  AuthCredentials,
  AuthResponse,
  AuthUser,
  DailySummary,
  FoodImageResult,
  GoalType,
  NutritionGoalResult,
  ProfileInput,
  ProfileResult,
} from './types';

import {
  getAccessToken,
  removeAccessToken,
  saveAccessToken,
} from './tokenStorage';


const API_URL = process.env.EXPO_PUBLIC_API_URL;


interface BackendUser {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}


interface BackendAuthResponse {
  access_token: string;
  token_type: string;
  user: BackendUser;
}


interface BackendProfile {
  id: number;
  user_id: number;
  age: number;
  height_cm: number;
  current_weight_kg: number;
  activity_level: ProfileResult['activityLevel'];
  calculation_sex: ProfileResult['calculationSex'];
}


interface BackendNutritionGoal {
  id: number;
  user_id: number;
  goal_type: GoalType;
  daily_calories: number;
  protein_grams: number;
  carbohydrate_grams: number;
  fat_grams: number;
}


interface BackendFoodImageResult {
  filename: string;
  content_type: string;
  size_bytes: number;
  width: number;
  height: number;
  status: string;
  message: string;
}


export type StartupDestination =
  | '/login'
  | '/onboarding/profile-setup'
  | '/onboarding/goal-selection'
  | '/home';


function getApiUrl(): string {
  if (!API_URL) {
    throw new Error(
      'Falta configurar EXPO_PUBLIC_API_URL en mobile/.env',
    );
  }

  return API_URL.replace(/\/$/, '');
}


function mapUser(user: BackendUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    isActive: user.is_active,
    createdAt: user.created_at,
  };
}


function mapProfile(
  profile: BackendProfile,
): ProfileResult {
  return {
    id: profile.id,
    userId: profile.user_id,
    age: profile.age,
    heightCm: profile.height_cm,
    currentWeightKg: profile.current_weight_kg,
    activityLevel: profile.activity_level,
    calculationSex: profile.calculation_sex,
  };
}


function mapNutritionGoal(
  goal: BackendNutritionGoal,
): NutritionGoalResult {
  return {
    id: goal.id,
    userId: goal.user_id,
    goalType: goal.goal_type,
    dailyCalories: goal.daily_calories,
    proteinGrams: goal.protein_grams,
    carbohydrateGrams: goal.carbohydrate_grams,
    fatGrams: goal.fat_grams,
  };
}


async function getErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const body = await response.json();

    if (typeof body.detail === 'string') {
      return body.detail;
    }
  } catch {
    // La respuesta no contenía JSON válido.
  }

  return `La solicitud falló con código ${response.status}.`;
}


async function sendAuthenticationRequest(
  path: string,
  credentials: AuthCredentials,
): Promise<AuthResponse> {
  const response = await fetch(
    `${getApiUrl()}${path}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: BackendAuthResponse =
    await response.json();

  await saveAccessToken(result.access_token);

  return {
    accessToken: result.access_token,
    tokenType: result.token_type,
    user: mapUser(result.user),
  };
}


export async function register(
  credentials: AuthCredentials,
): Promise<AuthResponse> {
  return sendAuthenticationRequest(
    '/auth/register',
    credentials,
  );
}


export async function login(
  credentials: AuthCredentials,
): Promise<AuthResponse> {
  return sendAuthenticationRequest(
    '/auth/login',
    credentials,
  );
}


export async function getCurrentUser(): Promise<AuthUser> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error('No existe una sesión iniciada.');
  }

  const response = await fetch(
    `${getApiUrl()}/auth/me`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      await removeAccessToken();
    }

    throw new Error(await getErrorMessage(response));
  }

  const user: BackendUser = await response.json();

  return mapUser(user);
}


export async function logout(): Promise<void> {
  await removeAccessToken();
}


export async function saveProfile(
  profile: ProfileInput,
): Promise<ProfileResult> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error('Debes iniciar sesión nuevamente.');
  }

  const body = {
    age: profile.age,
    height_cm: profile.heightCm,
    current_weight_kg: profile.currentWeightKg,
    activity_level: profile.activityLevel,
    calculation_sex: profile.calculationSex,
  };

  let response = await fetch(
    `${getApiUrl()}/profile`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  if (response.status === 409) {
    response = await fetch(
      `${getApiUrl()}/profile/me`,
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: BackendProfile =
    await response.json();

  return mapProfile(result);
}


export async function getProfile(): Promise<ProfileResult> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error('Debes iniciar sesión nuevamente.');
  }

  const response = await fetch(
    `${getApiUrl()}/profile/me`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: BackendProfile =
    await response.json();

  return mapProfile(result);
}


export async function getAccountProfile(): Promise<AccountProfile> {
  const [user, profile] = await Promise.all([
    getCurrentUser(),
    getProfile(),
  ]);

  return {
    email: user.email,
    age: profile.age,
    heightCm: profile.heightCm,
    currentWeightKg: profile.currentWeightKg,
    activityLevel: profile.activityLevel,
    calculationSex: profile.calculationSex,
  };
}


export async function saveNutritionGoal(
  goalType: GoalType,
): Promise<NutritionGoalResult> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error('Debes iniciar sesión nuevamente.');
  }

  const response = await fetch(
    `${getApiUrl()}/nutrition-goal/me`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        goal_type: goalType,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: BackendNutritionGoal =
    await response.json();

  return mapNutritionGoal(result);
}


export async function getNutritionGoal(): Promise<NutritionGoalResult> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error('Debes iniciar sesión nuevamente.');
  }

  const response = await fetch(
    `${getApiUrl()}/nutrition-goal/me`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: BackendNutritionGoal =
    await response.json();

  return mapNutritionGoal(result);
}


export async function getDailySummary(): Promise<DailySummary> {
  const goal = await getNutritionGoal();

  return {
    date: new Intl.DateTimeFormat('es-CL').format(
      new Date(),
    ),
    consumedCalories: 0,
    goal: {
      calories: goal.dailyCalories,
      protein: goal.proteinGrams,
      carbs: goal.carbohydrateGrams,
      fat: goal.fatGrams,
    },
    consumedMacros: {
      protein: 0,
      carbs: 0,
      fat: 0,
    },
    meals: [],
  };
}


export async function getStartupDestination(): Promise<StartupDestination> {
  const token = await getAccessToken();

  if (!token) {
    return '/login';
  }

  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const userResponse = await fetch(
    `${getApiUrl()}/auth/me`,
    { headers },
  );

  if (userResponse.status === 401) {
    await removeAccessToken();
    return '/login';
  }

  if (!userResponse.ok) {
    throw new Error(
      await getErrorMessage(userResponse),
    );
  }

  const profileResponse = await fetch(
    `${getApiUrl()}/profile/me`,
    { headers },
  );

  if (profileResponse.status === 401) {
    await removeAccessToken();
    return '/login';
  }

  if (profileResponse.status === 404) {
    return '/onboarding/profile-setup';
  }

  if (!profileResponse.ok) {
    throw new Error(
      await getErrorMessage(profileResponse),
    );
  }

  const goalResponse = await fetch(
    `${getApiUrl()}/nutrition-goal/me`,
    { headers },
  );

  if (goalResponse.status === 401) {
    await removeAccessToken();
    return '/login';
  }

  if (goalResponse.status === 404) {
    return '/onboarding/goal-selection';
  }

  if (!goalResponse.ok) {
    throw new Error(
      await getErrorMessage(goalResponse),
    );
  }

  return '/home';
}


export async function analyzeFoodImage(
  photoUri: string,
): Promise<FoodImageResult> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error('Debes iniciar sesión nuevamente.');
  }

  const imageFile = new File(photoUri);
  const formData = new FormData();

  formData.append('file', imageFile);

  const response = await expoFetch(
    `${getApiUrl()}/food-images/analyze`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: BackendFoodImageResult =
    await response.json();

  return {
    filename: result.filename,
    contentType: result.content_type,
    sizeBytes: result.size_bytes,
    width: result.width,
    height: result.height,
    status: result.status,
    message: result.message,
  };
}