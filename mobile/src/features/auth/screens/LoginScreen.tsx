import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {TextInput} from '../../../components/ui/TextInput/TextInput';
import {Button} from '../../../components/ui/Button/Button';
import {useAuthContext} from '../../../contexts/AuthContext';
import {authService} from '../services/authService';

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

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.heading}>Welcome</Text>
          <Text style={styles.subtitle}>Sign in to continue shopping</Text>
        </View>

        <View style={styles.card}>
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

          <View style={styles.form}>
            <TextInput
              label="Username"
              placeholder="johndoe"
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

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {loading ? (
              <ActivityIndicator
                style={styles.loader}
                size="large"
                color="#39B78D"
              />
            ) : (
              <Button
                label={activeTab === 'login' ? 'Sign In' : 'Create Account'}
                onPress={handleSubmit}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

type LoginStyles = {
  root: ViewStyle;
  scroll: ViewStyle;
  header: ViewStyle;
  heading: TextStyle;
  subtitle: TextStyle;
  card: ViewStyle;
  tabStrip: ViewStyle;
  tab: ViewStyle;
  tabActive: ViewStyle;
  tabText: TextStyle;
  tabTextActive: TextStyle;
  form: ViewStyle;
  error: TextStyle;
  loader: ViewStyle;
};

const styles = StyleSheet.create<LoginStyles>({
  root: {flex: 1, backgroundColor: '#F0FAF6'},
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  header: {alignItems: 'center', marginBottom: 28},
  heading: {fontSize: 28, fontWeight: '700', color: '#1F2937'},
  subtitle: {fontSize: 15, color: '#6B7280', marginTop: 6},
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  tabStrip: {flexDirection: 'row'},
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    backgroundColor: '#F9FAFB',
  },
  tabActive: {
    borderBottomColor: '#39B78D',
    backgroundColor: '#fff',
  },
  tabText: {fontSize: 15, fontWeight: '600', color: '#9CA3AF'},
  tabTextActive: {color: '#39B78D'},
  form: {padding: 20},
  error: {
    color: '#e53935',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  loader: {marginVertical: 12},
});

export {LoginScreen};
