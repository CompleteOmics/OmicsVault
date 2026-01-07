import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuthStore } from '../../context/AuthContext';
import { RootStackParamList } from '../../types';
import { colors, spacing, borderRadius, shadows, typography } from '../../utils/theme';

WebBrowser.maybeCompleteAuthSession();

type SignInScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignIn'>;
};

export function SignInScreen({ navigation }: SignInScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuthStore();

  // Google OAuth configuration
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // TODO: Replace with actual client ID
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSignIn(response.params.id_token);
    }
  }, [response]);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (idToken: string) => {
    setError('');
    setLoading(true);

    try {
      // TODO: Call backend API to verify Google token and sign in
      Alert.alert(
        'Google Sign-In',
        'Google OAuth is not fully configured yet. Please add your Google Client ID and set up the backend endpoint.',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      setError('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePress = () => {
    Alert.alert(
      'Setup Required',
      'To enable Google Sign-In:\n\n1. Create a Google Cloud project\n2. Enable Google Sign-In API\n3. Add your OAuth Client ID to the app\n4. Configure the backend\n\nFor now, please use email/password sign-in.',
      [{ text: 'OK' }]
    );
    // Uncomment when Google OAuth is configured:
    // promptAsync();
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
            <Text style={styles.tagline}>Lab Inventory Management</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.title}>Sign in to your account</Text>
            <Text style={styles.subtitle}>
              Enter your credentials to access your labs
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={colors.danger[600]} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

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
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoComplete="password"
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
            </View>

            <Button
              mode="contained"
              onPress={handleSignIn}
              loading={loading}
              disabled={loading}
              style={styles.signInButton}
              contentStyle={styles.signInButtonContent}
              labelStyle={styles.signInButtonLabel}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              mode="outlined"
              onPress={handleGooglePress}
              disabled={loading}
              style={styles.googleButton}
              contentStyle={styles.googleButtonContent}
              labelStyle={styles.googleButtonLabel}
              icon={() => (
                <Ionicons name="logo-google" size={20} color={colors.slate[700]} />
              )}
            >
              Continue with Google
            </Button>

            <View style={styles.signUpSection}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpLink}>Create an account</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>
            By signing in, you agree to our Terms of Service and Privacy Policy
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
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
  signInButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
  },
  signInButtonContent: {
    height: 52,
  },
  signInButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.slate[200],
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.slate[400],
  },
  googleButton: {
    marginBottom: spacing.md,
    borderColor: colors.slate[300],
    borderWidth: 1.5,
  },
  googleButtonContent: {
    height: 48,
  },
  googleButtonLabel: {
    color: colors.slate[700],
    fontSize: 15,
    fontWeight: '600',
  },
  signUpSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: colors.slate[500],
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.slate[400],
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
