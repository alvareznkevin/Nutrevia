import { useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { ActivityIndicator, TextInput, TouchableOpacity, View } from 'react-native';

import { addLocalMeal } from '@/api/localDiaryStore';
import { getFoodByBarcode, type BarcodeFood } from '@/api/realClient';
import type { Meal } from '@/api/types';
import { AppScreen } from '@/components/app-screen';
import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MEAL_TYPES: Meal['type'][] = ['desayuno', 'almuerzo', 'cena', 'snack'];

export default function BarcodeScanScreen() {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [product, setProduct] = useState<BarcodeFood | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [grams, setGrams] = useState('100');
  const [mealType, setMealType] = useState<Meal['type']>('snack');
  const scanLocked = useRef(false);

  const portion = Number(grams.replace(',', '.'));
  const validPortion = Number.isFinite(portion) && portion > 0 && portion <= 10000;

  const totals = product && validPortion
    ? {
        calories: Math.round(product.calories_per_100g * portion / 100),
        protein: Number((product.protein_per_100g * portion / 100).toFixed(1)),
        carbs: Number((product.carbs_per_100g * portion / 100).toFixed(1)),
        fat: Number((product.fat_per_100g * portion / 100).toFixed(1)),
      }
    : null;

  async function handleScan(code: string) {
    if (scanLocked.current) return;

    scanLocked.current = true;
    setLoading(true);
    setError('');

    try {
      setProduct(await getFoodByBarcode(code));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo buscar el producto.');
    } finally {
      setLoading(false);
    }
  }

  function scanAgain() {
    setProduct(null);
    setError('');
    setGrams('100');
    scanLocked.current = false;
  }

  function saveMeal() {
    if (!product || !totals) return;

    addLocalMeal({
      id: Date.now().toString(),
      type: mealType,
      time: new Intl.DateTimeFormat('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()),
      calories: totals.calories,
      description: `${product.name} (${portion} g)`,
      proteinGrams: totals.protein,
      carbGrams: totals.carbs,
      fatGrams: totals.fat,
    });

    router.replace({ pathname: '/(tabs)/diary', params: { saved: '1' } });
  }

  if (!permission?.granted) {
    return (
      <AppScreen contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
        <BrandMark centered compact />
        <Card style={{ marginTop: Spacing.four, alignItems: 'center' }}>
          <ThemedText style={{ textAlign: 'center', marginBottom: Spacing.three }}>
            Necesitamos permiso para escanear códigos de barras.
          </ThemedText>
          <PrimaryButton label="Dar permiso a la cámara" onPress={requestPermission} />
        </Card>
      </AppScreen>
    );
  }

  if (!loading && !product && !error) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a'] }}
          onBarcodeScanned={({ data }) => void handleScan(data)}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: Spacing.six,
            left: Spacing.four,
            right: Spacing.four,
            backgroundColor: 'rgba(6, 29, 22, 0.88)',
            borderRadius: Spacing.three,
            padding: Spacing.three,
          }}
        >
          <ThemedText type="smallBold" style={{ textAlign: 'center' }}>
            Escanea el código del envase
          </ThemedText>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={{ textAlign: 'center', marginTop: Spacing.one }}
          >
            Mantén el código dentro de la imagen hasta que se detecte.
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <AppScreen scroll keyboardShouldPersistTaps="handled">
      <BrandMark centered compact />

      {loading && (
        <Card style={{ marginTop: Spacing.four, alignItems: 'center' }}>
          <ActivityIndicator color={theme.accent} />
          <ThemedText style={{ marginTop: Spacing.two }}>Buscando producto...</ThemedText>
        </Card>
      )}

      {!!error && (
        <Card style={{ marginTop: Spacing.four }}>
          <ThemedText type="title">No pudimos consultar el producto</ThemedText>
          <ThemedText style={{ marginTop: Spacing.two, color: '#f5a3a3' }}>
            {error}
          </ThemedText>
        </Card>
      )}

      {product && (
        <>
          <ThemedText
            themeColor="accent"
            type="smallBold"
            style={{ marginTop: Spacing.four }}
          >
            PRODUCTO ENCONTRADO
          </ThemedText>
          <ThemedText type="title" style={{ marginTop: Spacing.two }}>
            {product.name}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.one }}>
            {product.brand} · Código {product.barcode}
          </ThemedText>

          <Card style={{ marginTop: Spacing.four }}>
            <ThemedText type="smallBold">Cantidad consumida</ThemedText>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: Spacing.three,
                marginTop: Spacing.three,
              }}
            >
              <TextInput
                value={grams}
                onChangeText={setGrams}
                keyboardType="decimal-pad"
                placeholder="100"
                placeholderTextColor={theme.textSecondary}
                style={{
                  minWidth: 110,
                  color: theme.text,
                  fontSize: 22,
                  fontWeight: '700',
                  borderColor: theme.border,
                  borderWidth: 1,
                  borderRadius: Spacing.two,
                  paddingHorizontal: Spacing.three,
                  paddingVertical: Spacing.two,
                }}
              />
              <ThemedText themeColor="textSecondary">gramos</ThemedText>
            </View>
            {!validPortion && (
              <ThemedText style={{ color: '#f5a3a3', marginTop: Spacing.two }}>
                Ingresa una cantidad válida.
              </ThemedText>
            )}
          </Card>

          <ThemedText type="smallBold" style={{ marginTop: Spacing.four }}>
            Tipo de comida
          </ThemedText>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: Spacing.two,
              marginTop: Spacing.two,
            }}
          >
            {MEAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setMealType(type)}
                style={{
                  width: '48%',
                  borderWidth: 1,
                  borderColor: mealType === type ? theme.accent : theme.border,
                  backgroundColor: mealType === type ? theme.accent : theme.backgroundElement,
                  borderRadius: Spacing.two,
                  paddingVertical: Spacing.two,
                  alignItems: 'center',
                }}
              >
                <ThemedText
                  type="smallBold"
                  style={{
                    textTransform: 'capitalize',
                    color: mealType === type ? '#061D16' : theme.text,
                  }}
                >
                  {type}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <Card style={{ marginTop: Spacing.four }}>
            <ThemedText themeColor="accent" type="smallBold">
              TOTAL DE TU PORCIÓN
            </ThemedText>
            <ThemedText type="title" style={{ marginTop: Spacing.two }}>
              {totals ? `${totals.calories} kcal` : '— kcal'}
            </ThemedText>
            <View style={{ marginTop: Spacing.three, gap: Spacing.two }}>
              <ThemedText>Proteínas: {totals ? `${totals.protein} g` : '—'}</ThemedText>
              <ThemedText>Carbohidratos: {totals ? `${totals.carbs} g` : '—'}</ThemedText>
              <ThemedText>Grasas: {totals ? `${totals.fat} g` : '—'}</ThemedText>
            </View>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={{ marginTop: Spacing.three }}
            >
              Calculado a partir de los datos por 100 g de Open Food Facts.
            </ThemedText>
          </Card>

          <PrimaryButton
            label="Agregar al diario"
            disabled={!totals}
            onPress={saveMeal}
            style={{ marginTop: Spacing.four }}
          />
        </>
      )}

      {!loading && (
        <TouchableOpacity onPress={scanAgain} style={{ marginTop: Spacing.four }}>
          <ThemedText themeColor="accent" style={{ textAlign: 'center' }}>
            Escanear otro producto
          </ThemedText>
        </TouchableOpacity>
      )}
    </AppScreen>
  );
}