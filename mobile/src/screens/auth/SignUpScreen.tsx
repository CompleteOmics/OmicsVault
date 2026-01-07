import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, TextInput, Button, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../context/AuthContext';
import { RootStackParamList } from '../../types';
import { colors, spacing, borderRadius, shadows } from '../../utils/theme';

type SignUpScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

export function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuthStore();

  const passwordStrength = useMemo(() => {
    if (password.length === 0) return { score: 0, label: '', color: colors.slate[200] };
    if (password.length < 6) return { score: 0.25, label: 'Too short', color: colors.danger[500] };
    if (password.length < 8) return { score: 0.5, label: 'Weak', color: colors.warning[500] };
    if (
      password.length < 12 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      return { score: 0.75, label: 'Good', color: colors.primary[500] };
    }
    if (
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    ) {
      return { score: 1, label: 'Strong', color: colors.success[500] };
    }
    return { score: 0.5, label: 'Moderate', color: colors.warning[500] };
  }, [password]);

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signUp(name, email, password);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="cube" size={32} color={colors.white} />
              </View>
            </View>
            <Text style={styles.logoText}>OmicsVault</Text>
            <Text style={styles.tagline}>Join the modern lab inventory platform</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Get started with your lab inventory
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={colors.danger[600]} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                mode="outlined"
                value={name}
                onChangeText={setName}
                placeholder="Dr. Jane Smith"
                autoCapitalize="words"
                autoComplete="name"
                left={<TextInput.Icon icon="account-outline" color={colors.slate[400]} />}
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={colors.slate[200]}
                activeOutlineColor={colors.primary[500]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                left={<TextInput.Icon icon="email-outline" color={colors.slate[400]} />}
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={colors.slate[200]}
                activeOutlineColor={colors.primary[500]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a strong password"
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                left={<TextInput.Icon icon="lock-outline" color={colors.slate[400]} />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    color={colors.slate[400]}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={colors.slate[200]}
                activeOutlineColor={colors.primary[500]}
              />
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <ProgressBar
                    progress={passwordStrength.score}
                    color={passwordStrength.color}
                    style={styles.strengthBar}
                  />
                  <Text
                    style={[
                      styles.strengthLabel,
                      { color: passwordStrength.color },
                    ]}
                  >
                    {passwordStrength.label}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                mode="outlined"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                left={<TextInput.Icon icon="shield-check-outline" color={colors.slate[400]} />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    color={colors.slate[400]}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                style={styles.input}
                outlineStyle={[
                  styles.inputOutline,
                  confirmPassword.length > 0 && !passwordsMatch && styles.inputError,
                ]}
                outlineColor={
                  confirmPassword.length > 0 && !passwordsMatch
                    ? colors.danger[500]
                    : colors.slate[200]
                }
                activeOutlineColor={
                  confirmPassword.length > 0 && !passwordsMatch
                    ? colors.danger[500]
                    : colors.primary[500]
                }
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <Text style={styles.errorHint}>Passwords do not match</Text>
              )}
            </View>

            <Button
              mode="contained"
              onPress={handleSignUp}
              loading={loading}
              disabled={loading}
              style={styles.signUpButton}
              contentStyle={styles.signUpButtonContent}
              labelStyle={styles.signUpButtonLabel}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.signInSection}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.signInLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoContainer: {
    marginBottom: spacing.md,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.slate[900],
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: colors.slate[500],
    marginTop: 4,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.slate[100],
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.slate[900],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.slate[500],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger[50],
    borderWidth: 1,
    borderColor: colors.danger[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    marginLeft: spacing.sm,
    color: colors.danger[700],
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.slate[700],
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
  },
  inputOutline: {
    borderRadius: borderRadius.md,
  },
  inputError: {
    borderColor: colors.danger[500],
  },
  strengthContainer: {
    marginTop: spacing.xs,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.slate[200],
  },
  strengthLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  errorHint: {
    fontSize: 12,
    color: colors.danger[600],
    marginTop: 4,
  },
  signUpButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
  },
  signUpButtonContent: {
    height: 52,
  },
  signUpButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    marginVertical: spacing.lg,
  },
  dividerLine: {
    height: 1,
    backgroundColor: colors.slate[200],
  },
  signInSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: colors.slate[500],
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.slate[400],
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
});
