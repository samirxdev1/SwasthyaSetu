import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, MinTapTarget } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import SwasthyaButton from '@/components/ui/SwasthyaButton';
import SwasthyaCard from '@/components/ui/SwasthyaCard';

const LoginScreen: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const { t } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    clearError?.();
    setLocalError(null);
    if (!identifier.trim()) {
      setLocalError('Please enter your email or phone number.');
      return;
    }
    if (!password.trim()) {
      setLocalError('Please enter your password.');
      return;
    }
    const res = await login(identifier.trim(), password.trim());
    if (!res.success) {
      setLocalError(res.message);
    }
  };

  const combinedError = localError || error;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Ionicons name="heart-outline" size={42} color={Colors.primary} />
            </View>
            <Text style={styles.brandTitle}>{t.appName}</Text>
            <Text style={styles.brandTagline}>Your trusted health companion</Text>
          </View>

          <SwasthyaCard variant="elevated" style={styles.formCard}>
            <Text style={styles.welcomeTitle}>{t.welcomeBack}</Text>
            <Text style={styles.welcomeSubtitle}>{t.loginSubtitle}</Text>

            {combinedError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={Colors.alert} />
                <Text style={styles.errorText}>{combinedError}</Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>{t.emailOrPhone}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
                <TextInput
                  value={identifier}
                  onChangeText={(v) => {
                    setIdentifier(v);
                    if (localError) setLocalError(null);
                    if (error) clearError?.();
                  }}
                  placeholder="email@example.com or +919876543210"
                  placeholderTextColor={Colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="default"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t.password}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} />
                <TextInput
                  ref={passwordRef}
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    if (localError) setLocalError(null);
                    if (error) clearError?.();
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textSecondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  style={[styles.input, { flex: 1 }]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((s) => !s)}
                  style={{ padding: Spacing.xs, minWidth: MinTapTarget, alignItems: 'center' }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Account Access',
                  'Please contact your healthcare provider to reset your password or request a new account.',
                  [{ text: 'OK' }]
                )
              }
              style={{ alignSelf: 'flex-end', paddingVertical: Spacing.xs }}
            >
              <Text style={styles.forgotText}>{t.forgotPassword}</Text>
            </TouchableOpacity>

            <SwasthyaButton
              title={t.login}
              onPress={handleSubmit}
              loading={isLoading}
              fullWidth
              size="lg"
            />

            <View style={styles.helpBox}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.helpText}>
                Patient accounts are created by your clinic. If you don't have login credentials, please contact your healthcare provider.
              </Text>
            </View>
          </SwasthyaCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  brandTagline: {
    marginTop: Spacing.xs,
    fontSize: Typography.small.fontSize,
    color: Colors.textSecondary,
  },
  formCard: {
    marginTop: Spacing.md,
  },
  welcomeTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '700',
    color: Colors.text,
  },
  welcomeSubtitle: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    lineHeight: Typography.body.lineHeight,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: '#FFF3EC',
    borderWidth: 1,
    borderColor: '#F8D6BE',
    marginBottom: Spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.small.fontSize,
    fontWeight: '500',
    color: Colors.alert,
    lineHeight: Typography.small.lineHeight,
  },
  field: { marginBottom: Spacing.md },
  label: {
    fontSize: Typography.smallBold.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'web' ? Spacing.sm + 2 : Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    minHeight: MinTapTarget,
  },
  input: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    padding: 0,
    minHeight: MinTapTarget - Spacing.sm,
  },
  forgotText: {
    fontSize: Typography.small.fontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  helpBox: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.softSage,
  },
  helpText: {
    flex: 1,
    fontSize: Typography.small.fontSize,
    color: Colors.textSecondary,
    lineHeight: Typography.small.lineHeight,
  },
});

export default LoginScreen;
