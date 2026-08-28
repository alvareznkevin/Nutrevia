import { useRef } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function CameraScreen() {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

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

  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync();
    // TODO: navegar a "Revisar comida" (sprint futuro) pasando photo.uri
    console.log(photo?.uri);
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
        <TouchableOpacity
          onPress={takePicture}
          style={{ position: 'absolute', bottom: 40, alignSelf: 'center', width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff' }}
        />
      </CameraView>
    </View>
  );
}