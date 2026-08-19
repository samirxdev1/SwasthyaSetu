import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Colors, Typography, Spacing, Radius, BottomTabInset, Fonts } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import SwasthyaButton from '@/components/ui/SwasthyaButton';
import SwasthyaCard from '@/components/ui/SwasthyaCard';
import SwasthyaBadge from '@/components/ui/SwasthyaBadge';
import {
  LoadingState,
  EmptyState,
  ErrorState,
  ScreenHeader,
  Separator,
  SectionTitle,
} from '@/components/ui/ScreenComponents';
import { aiApi, ScanPrescriptionResult, ScannedMedicine } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';

const AiPrescriptionScannerScreen: React.FC = () => {
  const { t } = useLanguage();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanPrescriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setImageUri(null);
    setFileName('');
    setResult(null);
    setError(null);
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true;
    try {
      const camera = await ImagePicker.requestCameraPermissionsAsync();
      const library = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!camera.granted && !library.granted) {
        Alert.alert(
          'Permissions Required',
          'Please allow access to your camera or photo library to scan a prescription.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch {
      return true;
    }
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    const ok = await requestPermissions();
    if (!ok) return;
    reset();
    try {
      let res;
      const opts: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.85,
        base64: Platform.OS === 'web',
      };
      if (source === 'camera') {
        res = await ImagePicker.launchCameraAsync(opts);
      } else {
        res = await ImagePicker.launchImageLibraryAsync(opts);
      }
      if (!res.canceled && res.assets && res.assets[0]) {
        const asset = res.assets[0];
        setImageUri(asset.uri);
        const parts = (asset.uri || '').split('/');
        setFileName(parts[parts.length - 1] || 'prescription.jpg');
        handleScan(asset.uri, parts[parts.length - 1] || 'prescription.jpg', asset.base64);
      }
    } catch (e: any) {
      setError(e.message || 'Could not select image.');
    }
  };

  const handleScan = async (uri: string, name: string, base64?: string) => {
    setAnalyzing(true);
    setError(null);
    try {
      let formData: FormData;
      if (Platform.OS === 'web') {
        formData = new FormData();
        if (base64) {
          const blob = base64ToBlob(base64, inferMimeType(name));
          formData.append('file', blob, name);
        } else {
          const resp = await fetch(uri);
          const blob = await resp.blob();
          formData.append('file', blob, name);
        }
      } else {
        formData = {
          append: (field: string, value: any, filename?: string) => {
            (formData as any)._parts = (formData as any)._parts || [];
            (formData as any)._parts.push([field, value, filename]);
          },
        } as any;
        const uriParts = (uri || '').split('.');
        const ext = uriParts[uriParts.length - 1]?.toLowerCase() || 'jpg';
        const mime =
          ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        (formData as any).append('file', {
          uri,
          name: name || `prescription.${ext}`,
          type: mime,
        } as any);
      }

      const res = await aiApi.scanPrescription(formData as any);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.message || 'Could not analyze prescription.');
      }
    } catch (e: any) {
      setError(getErrorMessage(e));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          title={t.scanTitle}
          subtitle="Upload or take a photo of your prescription — AI will read and explain it clearly"
        />

        {!imageUri ? (
          !analyzing ? (
            <View>
              <View style={styles.captureHero}>
                <View style={styles.captureInner}>
                  <View style={styles.captureIcon}>
                    <Ionicons name="scan-outline" size={52} color={Colors.primary} />
                  </View>
                  <Text style={styles.captureTitle}>Ready to scan</Text>
                  <Text style={styles.captureSubtitle}>
                    Ensure the prescription text is clear, flat, and well-lit for best results.
                  </Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <SwasthyaButton
                  title={t.takePhoto}
                  icon={<Ionicons name="camera-outline" size={18} color="#fff" />}
                  fullWidth
                  size="lg"
                  onPress={() => pickImage('camera')}
                  style={{ flex: 1 }}
                />
                <View style={{ width: Spacing.md }} />
                <SwasthyaButton
                  title={t.pickFromGallery}
                  variant="secondary"
                  icon={<Ionicons name="images-outline" size={18} color={Colors.primary} />}
                  fullWidth
                  size="lg"
                  onPress={() => pickImage('gallery')}
                  style={{ flex: 1 }}
                />
              </View>

              {error ? (
                <View style={{ marginTop: Spacing.lg }}>
                  <ErrorState title="Scan Failed" subtitle={error} onRetry={reset} retryLabel="Try again" />
                </View>
              ) : null}
            </View>
          ) : (
            <LoadingState label="Warming up..." />
          )
        ) : (
          <View>
            <SwasthyaCard variant="soft" style={{ padding: Spacing.sm, marginBottom: Spacing.md }}>
              <View style={styles.imageCardHeader}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                  <Ionicons name="image-outline" size={18} color={Colors.primary} />
                  <Text style={styles.imageFilename} numberOfLines={1}>
                    {fileName || 'Prescription image'}
                  </Text>
                </View>
                <TouchableOpacity onPress={reset} style={styles.replaceBtn}>
                  <Ionicons name="refresh-outline" size={16} color={Colors.primary} />
                  <Text style={styles.replaceText}>Replace</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.previewWrap}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} contentFit="contain" />
              </View>
            </SwasthyaCard>

            {analyzing ? (
              <AnalyzingState />
            ) : result ? (
              <ResultsView result={result} onAgain={reset} />
            ) : error ? (
              <ErrorState
                title="Scan Failed"
                subtitle={error}
                onRetry={reset}
                retryLabel="Try a different image"
              />
            ) : null}
          </View>
        )}

        <View style={{ height: BottomTabInset + Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const AnalyzingState: React.FC = () => {
  return (
    <View style={{ paddingVertical: Spacing.xxl, alignItems: 'center' }}>
      <View style={styles.pulseBox}>
        <View style={[styles.pulseCircle, styles.pulseOuter]} />
        <View style={styles.pulseInner}>
          <Ionicons name="sparkles-outline" size={36} color={Colors.primary} />
        </View>
      </View>
      <Text style={styles.analyzingTitle}>Analyzing Prescription</Text>
      <Text style={styles.analyzingSubtitle}>
        Our AI is reading your prescription carefully. This may take a moment.
      </Text>
      <View style={{ marginTop: Spacing.lg, width: '100%', paddingHorizontal: Spacing.lg }}>
        {[90, 70, 85, 60].map((w, i) => (
          <View
            key={i}
            style={{
              height: Spacing.lg,
              width: `${w}%`,
              backgroundColor: Colors.softSage,
              borderRadius: Radius.md,
              marginBottom: Spacing.md,
              opacity: 0.5 + (i % 2) * 0.3,
            }}
          />
        ))}
      </View>
    </View>
  );
};

const ResultsView: React.FC<{ result: ScanPrescriptionResult; onAgain: () => void }> = ({
  result,
  onAgain,
}) => {
  const { t } = useLanguage();
  return (
    <View>
      <View style={styles.successChip}>
        <Ionicons name="checkmark-circle" size={18} color={Colors.honeyGold} />
        <Text style={styles.successText}>Scan complete</Text>
      </View>

      <SectionTitle>{t.medicinesFound}</SectionTitle>
      {result.medicines && result.medicines.length > 0 ? (
        <View style={{ gap: Spacing.md, marginBottom: Spacing.md }}>
          {result.medicines.map((m: ScannedMedicine, i: number) => (
            <MedicineCard key={i} index={i} med={m} />
          ))}
        </View>
      ) : (
        <EmptyState
          title="No medicines detected"
          subtitle="The AI didn't identify any medicines. Try a clearer photo."
          icon="medkit-outline"
        />
      )}

      {result.explanation ? (
        <View style={{ marginBottom: Spacing.md }}>
          <SectionTitle>{t.explanation}</SectionTitle>
          <SwasthyaCard variant="soft">
            <Text style={styles.explanationText}>{result.explanation}</Text>
          </SwasthyaCard>
        </View>
      ) : null}

      {result.disclaimer ? (
        <SwasthyaCard
          style={{
            backgroundColor: '#FFF8E1',
            borderColor: '#FFE082',
            marginBottom: Spacing.md,
          }}
        >
          <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' }}>
            <Ionicons name="shield-checkmark-outline" size={22} color={Colors.honeyGold} />
            <View style={{ flex: 1 }}>
              <Text style={styles.disclaimerTitle}>{t.disclaimer}</Text>
              <Text style={styles.disclaimerText}>{result.disclaimer}</Text>
            </View>
          </View>
        </SwasthyaCard>
      ) : null}

      <SwasthyaButton
        title={t.scanAgain}
        icon={<Ionicons name="scan-outline" size={18} color="#fff" />}
        fullWidth
        size="lg"
        onPress={onAgain}
      />
    </View>
  );
};

const MedicineCard: React.FC<{ med: ScannedMedicine; index: number }> = ({ med, index }) => {
  return (
    <SwasthyaCard>
      <View style={styles.medHead}>
        <View style={styles.medIndex}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.medName}>{med.name}</Text>
          <Text
            style={{
              fontFamily: Platform.select({ web: (Fonts as any).web.mono }),
              fontSize: Typography.small.fontSize,
              fontWeight: '600',
              color: med.dosage === 'unclear' ? Colors.alert : Colors.primary,
              marginTop: 2,
            }}
          >
            {med.dosage === 'unclear' ? 'Dosage unclear' : med.dosage}
            {med.frequency ? `  •  ${med.frequency}` : ''}
          </Text>
        </View>
        {med.dosage === 'unclear' ? (
          <SwasthyaBadge tone="warning" label="Verify" />
        ) : null}
      </View>
      {med.instructions ? (
        <>
          <Separator style={{ marginVertical: Spacing.md }} />
          <Text style={styles.instructionsLabel}>How to take</Text>
          <Text style={styles.instructionsText}>{med.instructions}</Text>
        </>
      ) : null}
    </SwasthyaCard>
  );
};

const base64ToBlob = (b64: string, mime: string) => {
  const byteCharacters = atob(b64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
};

const inferMimeType = (name: string) => {
  const n = name.toLowerCase();
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.md },
  content: { paddingTop: Spacing.sm },
  captureHero: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  captureInner: { alignItems: 'center' },
  captureIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  captureTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  captureSubtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: Typography.body.lineHeight,
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  imageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  imageFilename: {
    flex: 1,
    fontSize: Typography.smallBold.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  replaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    backgroundColor: '#fff',
  },
  replaceText: {
    fontSize: Typography.smallBold.fontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  previewWrap: {
    marginHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: '#111',
    overflow: 'hidden',
    minHeight: 220,
    maxHeight: 360,
  },
  previewImage: { width: '100%', height: 280, backgroundColor: '#111' },
  pulseBox: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  pulseOuter: { opacity: 0.35 },
  pulseCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.softSage,
  },
  pulseInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  analyzingTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  analyzingSubtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: Typography.body.lineHeight,
  },
  successChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
    marginBottom: Spacing.md,
  },
  successText: {
    fontSize: Typography.smallBold.fontSize,
    fontWeight: '700',
    color: Colors.honeyGold,
  },
  medHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  medIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medName: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.text,
  },
  instructionsLabel: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  instructionsText: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    lineHeight: Typography.body.lineHeight,
  },
  explanationText: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    lineHeight: Typography.body.lineHeight,
  },
  disclaimerTitle: {
    fontSize: Typography.smallBold.fontSize,
    fontWeight: '700',
    color: Colors.honeyGold,
    marginBottom: 2,
  },
  disclaimerText: {
    fontSize: Typography.small.fontSize,
    color: Colors.text,
    lineHeight: Typography.small.lineHeight,
  },
});

export default AiPrescriptionScannerScreen;
