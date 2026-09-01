import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

import { api } from '@/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';


export default function CameraScreen() {
  const theme = useTheme();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] =
    useCameraPermissions();
  const [photoUri, setPhotoUri] =
    useState<string | null>(null);
  const [isTakingPicture, setIsTakingPicture] =
    useState(false);
  const [isUploading, setIsUploading] =
    useState(false);

  if (!permission) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={theme.accent} />

        <ThemedText style={styles.loadingText}>
          Preparando cámara...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.permissionContainer}>
        <ThemedText
          type="subtitle"
          style={styles.permissionTitle}
        >
          Acceso a la cámara
        </ThemedText>

        <ThemedText
          themeColor="textSecondary"
          style={styles.permissionText}
        >
          Nutrevia necesita permiso para fotografiar los alimentos.
        </ThemedText>

        <TouchableOpacity
          onPress={requestPermission}
          style={[
            styles.permissionButton,
            {
              backgroundColor: theme.accent,
            },
          ]}
        >
          <ThemedText style={styles.darkButtonText}>
            Dar permiso
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || isTakingPicture) {
      return;
    }

    try {
      setIsTakingPicture(true);

      const photo =
        await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });

      if (photo?.uri) {
        setPhotoUri(photo.uri);
      }
    } catch {
      Alert.alert(
        'No se pudo tomar la fotografía',
        'Inténtalo nuevamente.',
      );
    } finally {
      setIsTakingPicture(false);
    }
  };

  const confirmPicture = async () => {
    if (!photoUri || isUploading) {
      return;
    }

    setIsUploading(true);

    try {
      const result =
        await api.analyzeFoodImage(photoUri);

      Alert.alert(
        'Imagen recibida',
        `${result.message}\n\nDimensiones: ${result.width} × ${result.height}`,
        [
          {
            text: 'Volver al inicio',
            onPress: () => router.replace('/home'),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        'No fue posible enviar la imagen',
        error instanceof Error
          ? error.message
          : 'Inténtalo nuevamente.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: photoUri }}
          style={styles.preview}
          resizeMode="cover"
        />

        <View style={styles.previewOverlay}>
          <ThemedText type="subtitle">
            Revisa la fotografía
          </ThemedText>

          <ThemedText
            themeColor="textSecondary"
            style={styles.previewDescription}
          >
            Asegúrate de que los alimentos se vean claramente.
          </ThemedText>

          <View style={styles.actions}>
            <TouchableOpacity
              disabled={isUploading}
              onPress={() => setPhotoUri(null)}
              style={[
                styles.actionButton,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                  opacity: isUploading ? 0.5 : 1,
                },
              ]}
            >
              <ThemedText style={styles.actionText}>
                Repetir
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isUploading}
              onPress={confirmPicture}
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.accent,
                  opacity: isUploading ? 0.6 : 1,
                },
              ]}
            >
              {isUploading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <ThemedText style={styles.darkButtonText}>
                  Usar fotografía
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      />

      <View
        pointerEvents="none"
        style={styles.cameraInstructions}
      >
        <ThemedText style={styles.instructionsText}>
          Centra los alimentos dentro de la imagen
        </ThemedText>
      </View>

      <TouchableOpacity
        disabled={isTakingPicture}
        onPress={takePicture}
        style={[
          styles.captureButtonOuter,
          {
            opacity: isTakingPicture ? 0.5 : 1,
          },
        ]}
      >
        {isTakingPicture ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.captureButtonInner} />
        )}
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  camera: {
    flex: 1,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: Spacing.two,
  },

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },

  permissionTitle: {
    textAlign: 'center',
  },

  permissionText: {
    textAlign: 'center',
    marginTop: Spacing.two,
  },

  permissionButton: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginTop: Spacing.four,
  },

  cameraInstructions: {
    position: 'absolute',
    top: 50,
    left: Spacing.four,
    right: Spacing.four,
    alignItems: 'center',
  },

  instructionsText: {
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    textAlign: 'center',
  },

  captureButtonOuter: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },

  preview: {
    flex: 1,
  },

  previewOverlay: {
    padding: Spacing.four,
  },

  previewDescription: {
    marginTop: Spacing.one,
  },

  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },

  actionButton: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionText: {
    fontWeight: '700',
  },

  darkButtonText: {
    color: '#000',
    fontWeight: '700',
    textAlign: 'center',
  },
});