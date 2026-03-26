import React, {useCallback, useState} from 'react';
import {
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
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {TextInput} from '../../../components/ui/TextInput/TextInput';
import {Button} from '../../../components/ui/Button/Button';
import {authService} from '../services/authService';
import {colors} from '../../../theme';
import type {AuthStackParamList} from '../../../navigation/types';

type NavProp = NativeStackNavigationProp<AuthStackParamList>;

const ForgotPasswordScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavProp>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!email.trim()) {
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={24} color={colors.textHeading} />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Feather name="lock" size={32} color={colors.primary} />
          </View>

          <Text style={styles.heading}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            {sent
              ? 'If an account with that email exists, a reset link has been sent.'
              : 'Enter your email and we\'ll send you a reset link.'}
          </Text>

          {!sent ? (
            <View style={styles.form}>
              <TextInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Button
                label={loading ? 'Sending...' : 'Send Reset Link'}
                onPress={handleSubmit}
                disabled={loading || !email.trim()}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Button
                label="Back to Login"
                onPress={() => navigation.goBack()}
              />
            </View>
          )}
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
    paddingTop: 16,
    paddingBottom: 24,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
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
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  form: {paddingHorizontal: 24},
});

export {ForgotPasswordScreen};
