import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {TextInput} from '../../../components/ui/TextInput/TextInput';
import {Button} from '../../../components/ui/Button/Button';
import {useAuthContext} from '../../../contexts/AuthContext';
import {authService} from '../services/authService';
import {colors} from '../../../theme';

type Tab = 'login' | 'signup';

const LoginScreen = (): React.JSX.Element => {
  const {login} = useAuthContext();
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }
    if (activeTab === 'signup') {
      if (!email.trim() || !firstName.trim() || !lastName.trim() || !age.trim()) {
        setError('All fields are required for sign up');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError('Please enter a valid email address');
        return;
      }
      const parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
        setError('Please enter a valid age');
        return;
      }
    }

    setLoading(true);
    try {
      if (activeTab === 'login') {
        const data = await authService.login({username: username.trim(), password});
        await login(data.token, data.user);
      } else {
        const data = await authService.register({
          username: username.trim(),
          email: email.trim(),
          password,
          age: parseInt(age, 10),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        await login(data.token, data.user);
      }
    } catch (err: unknown) {
      const axiosErr = err as {response?: {data?: {message?: string | string[]}}};
      const msg = axiosErr.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] ?? 'Authentication failed' : msg ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, [activeTab, username, password, email, firstName, lastName, age, login]);

  const handleComingSoon = useCallback((feature: string) => {
    Alert.alert('Coming Soon', `${feature} will be available in a future update.`);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Header Icon */}
          <View style={styles.iconCircle}>
            <Feather name="shopping-bag" size={32} color={colors.primary} />
          </View>

          {/* Welcome Text */}
          <Text style={styles.heading}>Welcome Back</Text>
          <Text style={styles.subtitle}>Please enter your details</Text>

          {/* Tab Toggle */}
          <View style={styles.tabStrip}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'login' && styles.tabActive]}
              onPress={() => switchTab('login')}>
              <Text
                style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'signup' && styles.tabActive]}
              onPress={() => switchTab('signup')}>
              <Text
                style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Username"
              placeholder="johndoe123"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {activeTab === 'signup' && (
              <>
                <TextInput
                  label="First Name"
                  placeholder="John"
                  value={firstName}
                  onChangeText={setFirstName}
                />
                <TextInput
                  label="Last Name"
                  placeholder="Doe"
                  value={lastName}
                  onChangeText={setLastName}
                />
                <TextInput
                  label="Email"
                  placeholder="john@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TextInput
                  label="Age"
                  placeholder="25"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                />
              </>
            )}

            <TextInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Forgot Password */}
            {activeTab === 'login' && (
              <TouchableOpacity
                style={styles.forgotRow}
                onPress={() => handleComingSoon('Password recovery')}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {/* Biometrics Checkbox — visual only */}
            {activeTab === 'login' && (
              <View style={styles.checkboxRow}>
                <View style={styles.checkbox} />
                <Text style={styles.checkboxLabel}>
                  Use biometrics for faster login
                </Text>
              </View>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {loading ? (
              <ActivityIndicator
                style={styles.loader}
                size="large"
                color={colors.primary}
              />
            ) : (
              <Button
                label={activeTab === 'login' ? 'Sign In' : 'Create Account'}
                onPress={handleSubmit}
              />
            )}

            {/* Biometrics Button — TODO */}
            {activeTab === 'login' && (
              <Button
                label="Sign in with Biometrics"
                variant="outline"
                icon={
                  <Feather name="smartphone" size={20} color={colors.primary} />
                }
                onPress={() => handleComingSoon('Biometric sign in')}
              />
            )}
          </View>

          {/* Social Auth Divider */}
          {activeTab === 'login' && (
            <View style={styles.socialSection}>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <View style={styles.dividerTextWrap}>
                  <Text style={styles.dividerText}>Or continue with</Text>
                </View>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={() => handleComingSoon('Google sign in')}>
                  <Text style={styles.socialBtnText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={() => handleComingSoon('Facebook sign in')}>
                  <Text style={styles.socialBtnText}>Facebook</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Footer */}
          <Text style={styles.footer}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text>
            {'\n'}and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingTop: 32,
    paddingBottom: 24,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textHeading,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  tabStrip: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {fontSize: 14, fontWeight: '500', color: colors.textMuted},
  tabTextActive: {color: colors.textHeading, fontWeight: '600'},
  form: {paddingHorizontal: 24, paddingTop: 8},
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 4,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    backgroundColor: colors.surface,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.textBody,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  loader: {marginVertical: 12},
  socialSection: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerTextWrap: {
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
  },
  dividerText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  socialBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLabel,
  },
  footer: {
    fontSize: 12,
    color: colors.textDisabled,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 16,
    paddingHorizontal: 24,
  },
  footerLink: {
    textDecorationLine: 'underline',
  },
});

export {LoginScreen};
