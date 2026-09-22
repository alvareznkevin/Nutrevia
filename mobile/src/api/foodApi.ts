import { FoodCatalogItem } from './types';

const SEARCH_URL = 'https://search.openfoodfacts.org/search';

interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  product_name_es?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
}

interface OpenFoodFactsResponse {
  hits: OpenFoodFactsProduct[];
}

export async function searchFoods(
  query: string
): Promise<FoodCatalogItem[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const params = new URLSearchParams({
    q: normalizedQuery,
    langs: 'es,en',
    page_size: '15',
    fields: 'code,product_name,product_name_es,nutriments',
  });

  const response = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    headers: {
      'User-Agent': 'Nutrevia/0.1.0',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Open Food Facts respondió con HTTP ${response.status}`
    );
  }

  const data: OpenFoodFactsResponse = await response.json();

  return data.hits
    .filter((product) => {
      const name =
        product.product_name_es || product.product_name;

      return (
        Boolean(name) &&
        typeof product.nutriments?.['energy-kcal_100g'] === 'number'
      );
    })
    .map((product) => ({
      id: product.code,
      name:
        product.product_name_es ||
        product.product_name ||
        'Producto sin nombre',

      caloriesPer100g: Math.round(
        product.nutriments?.['energy-kcal_100g'] ?? 0
      ),

      proteinPer100g:
        Math.round(
          (product.nutriments?.proteins_100g ?? 0) * 10
        ) / 10,

      carbsPer100g:
        Math.round(
          (product.nutriments?.carbohydrates_100g ?? 0) * 10
        ) / 10,

      fatPer100g:
        Math.round(
          (product.nutriments?.fat_100g ?? 0) * 10
        ) / 10,
    }));
}