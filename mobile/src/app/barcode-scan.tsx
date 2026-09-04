import { useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { View, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function BarcodeScanScreen() {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission?.granted) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four }}>
        <ThemedText style={{ marginBottom: Spacing.three, textAlign: 'center' }}>
          Necesitamos permiso para usar la cámara
        </ThemedText>
        <TouchableOpacity onPress={requestPermission} style={{ backgroundColor: theme.accent, padding: Spacing.three, borderRadius: Spacing.two }}>
          <ThemedText style={{ color: '#000' }}>Dar permiso</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a'] }}
        onBarcodeScanned={(result) => {
          // TODO: buscar el producto por result.data en el backend cuando exista ese endpoint
          console.log('Código escaneado:', result.data);
        }}
      />
    </View>
  );
}