import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';

import { DetectedFood, Meal } from '@/api/types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { OutlineButton } from '@/components/ui/OutlineButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// TODO: reemplazar por los alimentos que devuelva el backend de Computer Vision
// (por ahora el backend solo confirma que recibió la imagen, no qué contiene).
const MOCK_DETECTED_FOODS: DetectedFood[] = [
  { id: '1', name: 'Arroz blanco', grams: 200, kcal: 260, proteinGrams: 5, carbGrams: 57, fatGrams: 0, confidence: 'alta' },
  { id: '2', name: 'Pechuga de pollo', grams: 180, kcal: 297, proteinGrams: 56, carbGrams: 0, fatGrams: 6, confidence: 'alta' },
  { id: '3', name: 'Palta', grams: 80, kcal: 128, proteinGrams: 2, carbGrams: 7, fatGrams: 12, confidence: 'media' },
];

const MEAL_TYPES: Meal['type'][] = ['desayuno', 'almuerzo', 'cena', 'snack'];

export default function ReviewMealScreen() {
  const theme = useTheme();
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [foods, setFoods] = useState<DetectedFood[]>([]);
  const [mealType, setMealType] = useState<Meal['type']>('almuerzo');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Simula el tiempo de análisis. Cuando exista el endpoint real,
    // acá se reemplaza por la respuesta de api.analyzeFoodImage / un endpoint de detección.
    const timeout = setTimeout(() => {
      setFoods(MOCK_DETECTED_FOODS);
      setIsAnalyzing(false);
    }, 800);

    return () => clearTimeout(timeout);
  }, []);

  const updateGrams = (id: string, grams: number) => {
    setFoods((current) =>
      current.map((food) => (food.id === id ? { ...food, grams } : food)),
    );
  };

  const removeFood = (id: string) => {
    setFoods((current) => current.filter((food) => food.id !== id));
  };

  const addFood = () => {
    setFoods((current) => [
      ...current,
      {
        id: Date.now().toString(),
        name: 'Nuevo alimento',
        grams: 100,
        kcal: 0,
        proteinGrams: 0,
        carbGrams: 0,
        fatGrams: 0,
        confidence: 'media',
      },
    ]);
  };

  const totals = foods.reduce(
    (acc, food) => ({
      kcal: acc.kcal + food.kcal,
      protein: acc.protein + food.proteinGrams,
      carbs: acc.carbs + food.carbGrams,
      fat: acc.fat + food.fatGrams,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // TODO: reemplazar por api.addMeal(...) cuando el backend tenga el endpoint
      // para guardar comidas individuales en el diario.
      router.replace({ pathname: '/(tabs)/diary', params: { saved: '1' } });
    } finally {
      setIsSaving(false);
    }
  };

 return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: Spacing.four, paddingBottom: Spacing.six }}>
        <ThemedText type="title">Revisar comida</ThemedText>
        <ThemedText themeColor="textSecondary" type="small" style={{ marginTop: Spacing.one }}>
          Confirma o corrige los resultados antes de guardar.
        </ThemedText>

        <Card style={{ marginTop: Spacing.four, flexDirection: 'row', gap: Spacing.three }}>
          {photoUri && (
            <Image
              source={{ uri: photoUri }}
              style={{ width: 72, height: 72, borderRadius: Spacing.two }}
            />
          )}

          <View style={{ flex: 1, justifyContent: 'center' }}>
            {isAnalyzing ? (
              <>
                <Badge label="Analizando..." tone="neutral" />
                <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.one }}>
                  Detectando alimentos en la imagen.
                </ThemedText>
              </>
            ) : (
              <>
                <Badge label="Análisis completado" />
                <ThemedText type="smallBold" style={{ marginTop: Spacing.one }}>
                  {foods.length} alimentos detectados
                </ThemedText>
              </>
            )}
          </View>
        </Card>

        {isAnalyzing ? (
          <ActivityIndicator style={{ marginTop: Spacing.six }} color={theme.accent} />
        ) : (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.four }}>
              <ThemedText type="smallBold">Alimentos detectados</ThemedText>

              <TouchableOpacity onPress={addFood} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.one }}>
                <Plus color={theme.accent} size={16} />
                <ThemedText type="small" themeColor="accent">Agregar</ThemedText>
              </TouchableOpacity>
            </View>

            {foods.map((food) => (
              <Card key={food.id} style={{ marginTop: Spacing.two }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <ThemedText type="smallBold">{food.name}</ThemedText>
                  <TouchableOpacity onPress={() => removeFood(food.id)} hitSlop={8}>
                    <Trash2 color="#ef4444" size={18} />
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.two }}>
                  <TextInput
                    value={String(food.grams)}
                    onChangeText={(value) => updateGrams(food.id, Number(value.replace(/[^0-9]/g, '')) || 0)}
                    keyboardType="numeric"
                    style={{
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: Spacing.two,
                      paddingHorizontal: Spacing.two,
                      paddingVertical: Spacing.one,
                      color: theme.text,
                      width: 70,
                    }}
                  />
                  <ThemedText type="small" themeColor="textSecondary">g</ThemedText>
                  <ThemedText type="small">{food.kcal} kcal</ThemedText>
                  <Badge
                    label={`Confianza ${food.confidence}`}
                    tone={food.confidence === 'alta' ? 'accent' : 'neutral'}
                  />
                </View>
              </Card>
            ))}

            <ThemedText themeColor="textSecondary" type="small" style={{ marginTop: Spacing.three }}>
              Las cantidades son aproximadas y puedes modificarlas.
            </ThemedText>

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
                  <ThemedText
                    type="small"
                    style={{ textTransform: 'capitalize', color: mealType === type ? '#000' : theme.text }}
                  >
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
              label="Guardar en el diario"
              loading={isSaving}
              onPress={handleSave}
              style={{ marginTop: Spacing.four }}
            />

            <OutlineButton
              label="Volver a tomar la foto"
              onPress={() => router.back()}
              style={{ marginTop: Spacing.two, borderWidth: 0 }}
            />
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}