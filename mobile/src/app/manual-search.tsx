import { useEffect, useState } from 'react';
import { ActivityIndicator, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';

import { searchFoods } from '@/api/foodApi';
import { FoodCatalogItem, Meal } from '@/api/types';
import { AppScreen } from '@/components/app-screen';
import { BrandMark } from '@/components/brand-mark';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { addLocalMeal } from '@/api/localDiaryStore';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MEAL_TYPES: Meal['type'][] = ['desayuno', 'almuerzo', 'cena', 'snack'];

// Porciones rápidas de referencia. Son genéricas (no dependen del alimento
// elegido); el usuario siempre puede ajustar el valor exacto en gramos.
const PORTION_PRESETS: { id: string; label: string; grams: number }[] = [
  { id: 'small', label: 'Chica', grams: 80 },
  { id: 'medium', label: 'Media', grams: 150 },
  { id: 'large', label: 'Grande', grams: 250 },
];

export default function ManualSearchScreen() {
  const theme = useTheme();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodCatalogItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodCatalogItem | null>(null);
  const [grams, setGrams] = useState('100');
  const [portionId, setPortionId] = useState<string>('custom');
  const [mealType, setMealType] = useState<Meal['type']>('almuerzo');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    // Debounce: espera 400ms desde la última letra escrita antes de buscar,
    // para no disparar una llamada a la API por cada tecla presionada.
    const timeout = setTimeout(async () => {
      try {
        const foods = await searchFoods(trimmedQuery);
        setResults(foods);
      } catch (error) {
        setSearchError(
          error instanceof Error ? error.message : 'No fue posible buscar alimentos.',
        );
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const selectPortion = (preset: (typeof PORTION_PRESETS)[number]) => {
    setPortionId(preset.id);
    setGrams(String(preset.grams));
  };

  const handleGramsChange = (value: string) => {
    setPortionId('custom');
    setGrams(value);
  };

  const parsedGrams = Number(grams.replace(/[^0-9]/g, '')) || 0;

  const totals = selectedFood
    ? {
        kcal: Math.round((selectedFood.caloriesPer100g * parsedGrams) / 100),
        protein: Math.round((selectedFood.proteinPer100g * parsedGrams) / 100),
        carbs: Math.round((selectedFood.carbsPer100g * parsedGrams) / 100),
        fat: Math.round((selectedFood.fatPer100g * parsedGrams) / 100),
      }
    : null;

  const handleSave = async () => {
    if (!selectedFood || !totals) return;

    setIsSaving(true);

    try {
      addLocalMeal({
        id: Date.now().toString(),
        type: mealType,
        time: new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
        calories: totals.kcal,
        description: `${selectedFood.name} (${parsedGrams} g)`,
        proteinGrams: totals.protein,
        carbGrams: totals.carbs,
        fatGrams: totals.fat,
      });

      router.replace({ pathname: '/(tabs)/diary', params: { saved: '1' } });
    } finally {
      setIsSaving(false);
    }
  };

  if (selectedFood && totals) {
    return (
      <AppScreen scroll>
        <BrandMark centered compact />

        <ThemedText type="title" style={{ marginTop: Spacing.three }}>{selectedFood.name}</ThemedText>
        <ThemedText themeColor="textSecondary" type="small" style={{ marginTop: Spacing.one }}>
          Ajusta la cantidad y confirma para agregarlo a tu diario.
        </ThemedText>

        <ThemedText type="smallBold" style={{ marginTop: Spacing.four }}>Porción</ThemedText>
        <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two }}>
          {PORTION_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              onPress={() => selectPortion(preset)}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: portionId === preset.id ? theme.accent : theme.border,
                backgroundColor: portionId === preset.id ? theme.accent : 'transparent',
                borderRadius: Spacing.two,
                paddingVertical: Spacing.two,
                alignItems: 'center',
              }}
            >
              <ThemedText
                type="small"
                style={{ color: portionId === preset.id ? '#000' : theme.text }}
              >
                {preset.label}
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: portionId === preset.id ? '#000' : theme.textSecondary }}
              >
                {preset.grams} g
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={{ marginTop: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
          <TextInput
            value={grams}
            onChangeText={handleGramsChange}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: portionId === 'custom' ? theme.accent : theme.border,
              borderRadius: Spacing.two,
              paddingHorizontal: Spacing.three,
              paddingVertical: Spacing.two,
              color: theme.text,
              width: 90,
            }}
          />
          <ThemedText themeColor="textSecondary">gramos (personalizado)</ThemedText>
        </Card>

        <ThemedText type="smallBold" style={{ marginTop: Spacing.four }}>Tipo de comida</ThemedText>
        <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two }}>
          {MEAL_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setMealType(type)}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: mealType === type ? theme.accent : theme.border,
                backgroundColor: mealType === type ? theme.accent : 'transparent',
                borderRadius: Spacing.two,
                paddingVertical: Spacing.two,
                alignItems: 'center',
              }}
            >
              <ThemedText type="small" style={{ textTransform: 'capitalize', color: mealType === type ? '#000' : theme.text }}>
                {type}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={{ marginTop: Spacing.four }}>
          <ThemedText themeColor="accent" type="small">Total estimado</ThemedText>
          <ThemedText type="title" style={{ marginTop: Spacing.one }}>{totals.kcal} kcal</ThemedText>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.three }}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">Proteínas</ThemedText>
              <ThemedText type="smallBold">{totals.protein} g</ThemedText>
            </View>
            <View>
              <ThemedText type="small" themeColor="textSecondary">Carbohidratos</ThemedText>
              <ThemedText type="smallBold">{totals.carbs} g</ThemedText>
            </View>
            <View>
              <ThemedText type="small" themeColor="textSecondary">Grasas</ThemedText>
              <ThemedText type="smallBold">{totals.fat} g</ThemedText>
            </View>
          </View>
        </Card>

        <PrimaryButton
          label="Confirmar y registrar"
          loading={isSaving}
          onPress={handleSave}
          style={{ marginTop: Spacing.four }}
        />

        <TouchableOpacity
          onPress={() => {
            setSelectedFood(null);
            setPortionId('custom');
            setGrams('100');
          }}
          style={{ marginTop: Spacing.three }}
        >
          <ThemedText themeColor="accent" style={{ textAlign: 'center' }}>Elegir otro alimento</ThemedText>
        </TouchableOpacity>
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll>
      <BrandMark centered compact />

      <ThemedText type="title" style={{ marginTop: Spacing.three }}>Búsqueda manual</ThemedText>
      <ThemedText themeColor="textSecondary" type="small" style={{ marginTop: Spacing.two }}>
        Busca un alimento por nombre para agregarlo a tu diario.
      </ThemedText>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.two,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: Spacing.three,
          paddingHorizontal: Spacing.three,
          marginTop: Spacing.four,
        }}
      >
        <Search color={theme.textSecondary} size={18} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ej: pechuga de pollo, arroz, palta..."
          placeholderTextColor={theme.textSecondary}
          style={{ flex: 1, paddingVertical: Spacing.three, color: theme.text }}
        />
      </View>

      {isSearching && (
        <ActivityIndicator style={{ marginTop: Spacing.four }} color={theme.accent} />
      )}

      {searchError && (
        <Card style={{ marginTop: Spacing.four }}>
          <ThemedText style={{ color: '#ef4444', textAlign: 'center' }}>{searchError}</ThemedText>
        </Card>
      )}

      {!isSearching && !searchError && query.trim().length > 0 && results.length === 0 && (
        <Card style={{ marginTop: Spacing.four }}>
          <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
            No encontramos alimentos con ese nombre.
          </ThemedText>
        </Card>
      )}

      {!isSearching && results.map((food) => (
        <TouchableOpacity key={food.id} onPress={() => setSelectedFood(food)}>
          <Card style={{ marginTop: Spacing.two, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemedText type="smallBold">{food.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{food.caloriesPer100g} kcal / 100g</ThemedText>
          </Card>
        </TouchableOpacity>
      ))}
    </AppScreen>
  );
}