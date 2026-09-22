import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, TextInput, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';

import { DetectedFood, Meal } from '@/api/types';
import { detectionToEditableFood, recalculateDetectedFood } from '@/api/detectedFoodNutrition';
import { clearPendingFoodAnalysis, getPendingFoodAnalysis } from '@/api/pendingFoodAnalysisStore';
import { AppScreen } from '@/components/app-screen';
import { BrandMark } from '@/components/brand-mark';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { OutlineButton } from '@/components/ui/OutlineButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { addLocalMeal } from '@/api/localDiaryStore';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MEAL_TYPES: Meal['type'][] = ['desayuno', 'almuerzo', 'cena', 'snack'];

const smallInputStyle = {
  borderWidth: 1,
  borderRadius: Spacing.two,
  paddingHorizontal: Spacing.two,
  paddingVertical: Spacing.one,
  width: 60,
};

export default function ReviewMealScreen() {
  const theme = useTheme();
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [foods, setFoods] = useState<DetectedFood[]>([]);
  const [mealType, setMealType] = useState<Meal['type']>('almuerzo');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const analysis = getPendingFoodAnalysis();
    setFoods(analysis?.detections.map(detectionToEditableFood) ?? []);
    setIsAnalyzing(false);
  }, []);

  const updateGrams = (id: string, grams: number) => {
    setFoods((current) =>
      current.map((food) => {
        if (food.id !== id) return food;

        if (food.key === 'custom') {
          // Los alimentos agregados a mano no tienen tabla nutricional asociada;
          // solo actualizamos los gramos, sin recalcular kcal/macros.
          return { ...food, grams };
        }

        return recalculateDetectedFood(food, grams);
      }),
    );
  };

  const updateCustomFoodField = (
    id: string,
    field: 'kcal' | 'proteinGrams' | 'carbGrams' | 'fatGrams',
    value: string,
  ) => {
    const parsed = Number(value.replace(/[^0-9]/g, '')) || 0;

    setFoods((current) =>
      current.map((food) => (food.id === id ? { ...food, [field]: parsed } : food)),
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
        key: 'custom',
        name: 'Nuevo alimento',
        grams: 100,
        kcal: 0,
        proteinGrams: 0,
        carbGrams: 0,
        fatGrams: 0,
        confidence: 'media',
        confidenceScore: 0,
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
      addLocalMeal({
        id: Date.now().toString(),
        type: mealType,
        time: new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
        calories: totals.kcal,
        description: foods.map((food) => food.name).join(', '),
        proteinGrams: totals.protein,
        carbGrams: totals.carbs,
        fatGrams: totals.fat,
      });

      clearPendingFoodAnalysis();
      router.replace({ pathname: '/(tabs)/diary', params: { saved: '1' } });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppScreen scroll>
      <BrandMark centered compact />

      <ThemedText type="title" style={{ marginTop: Spacing.three }}>Revisar comida</ThemedText>
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
                {foods.length === 1 ? '1 alimento detectado' : `${foods.length} alimentos detectados`}
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

          {foods.map((food) => {
            const hasNoNutritionData = food.kcal === 0 && food.confidenceScore > 0;
            const isCustom = food.key === 'custom';

            return (
              <Card key={food.id} style={{ marginTop: Spacing.two }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <ThemedText type="smallBold">{food.name}</ThemedText>
                  <TouchableOpacity onPress={() => removeFood(food.id)} hitSlop={8}>
                    <Trash2 color="#ef4444" size={18} />
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.two, flexWrap: 'wrap' }}>
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

                  {isCustom ? (
                    <>
                      <TextInput
                        value={String(food.kcal)}
                        onChangeText={(value) => updateCustomFoodField(food.id, 'kcal', value)}
                        keyboardType="numeric"
                        style={{ ...smallInputStyle, borderColor: theme.accent, color: theme.text }}
                      />
                      <ThemedText type="small" themeColor="textSecondary">kcal</ThemedText>
                    </>
                  ) : (
                    <ThemedText type="small">{food.kcal} kcal</ThemedText>
                  )}

                  <Badge
                    label={`Confianza ${food.confidence}`}
                    tone={food.confidence === 'alta' ? 'accent' : 'neutral'}
                  />

                  {hasNoNutritionData && (
                    <Badge label="Sin datos nutricionales" tone="neutral" />
                  )}
                </View>

                {isCustom && (
                  <View style={{ flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.two, flexWrap: 'wrap' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.one }}>
                      <ThemedText type="small" themeColor="textSecondary">Prot.</ThemedText>
                      <TextInput
                        value={String(food.proteinGrams)}
                        onChangeText={(value) => updateCustomFoodField(food.id, 'proteinGrams', value)}
                        keyboardType="numeric"
                        style={{ ...smallInputStyle, borderColor: theme.border, color: theme.text }}
                      />
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.one }}>
                      <ThemedText type="small" themeColor="textSecondary">Carb.</ThemedText>
                      <TextInput
                        value={String(food.carbGrams)}
                        onChangeText={(value) => updateCustomFoodField(food.id, 'carbGrams', value)}
                        keyboardType="numeric"
                        style={{ ...smallInputStyle, borderColor: theme.border, color: theme.text }}
                      />
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.one }}>
                      <ThemedText type="small" themeColor="textSecondary">Grasa</ThemedText>
                      <TextInput
                        value={String(food.fatGrams)}
                        onChangeText={(value) => updateCustomFoodField(food.id, 'fatGrams', value)}
                        keyboardType="numeric"
                        style={{ ...smallInputStyle, borderColor: theme.border, color: theme.text }}
                      />
                    </View>
                  </View>
                )}

                {hasNoNutritionData && (
                  <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.one }}>
                    Detectamos este alimento, pero aún no tenemos su información nutricional. Puedes eliminarlo o dejarlo con 0 kcal.
                  </ThemedText>
                )}
              </Card>
            );
          })}

          {foods.length === 0 && (
            <Card style={{ marginTop: Spacing.two }}>
              <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
                No se detectaron alimentos de la lista inicial. Puedes repetir la foto.
              </ThemedText>
            </Card>
          )}

          <ThemedText themeColor="textSecondary" type="small" style={{ marginTop: Spacing.three }}>
            Las cantidades y los valores nutricionales son referenciales. Puedes modificar la porción antes de guardar.
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
            disabled={foods.length === 0}
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
    </AppScreen>
  );
}