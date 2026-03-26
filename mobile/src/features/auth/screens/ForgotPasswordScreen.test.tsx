import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Alert} from 'react-native';
import {ForgotPasswordScreen} from './ForgotPasswordScreen';
import {authService} from '../services/authService';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: mockGoBack}),
}));

jest.mock('react-native-vector-icons/Feather', () => {
  const {Text} = require('react-native');
  return (props: any) => <Text>{props.name}</Text>;
});

jest.mock('../services/authService');
const mockedAuthService = authService as jest.Mocked<typeof authService>;

jest.mock('../../../components/ui/TextInput/TextInput', () => ({
  TextInput: (props: any) => {
    const {TextInput: RNTextInput} = require('react-native');
    return (
      <RNTextInput
        testID="email-input"
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
      />
    );
  },
}));

jest.mock('../../../components/ui/Button/Button', () => ({
  Button: (props: any) => {
    const {TouchableOpacity, Text} = require('react-native');
    return (
      <TouchableOpacity testID="submit-btn" onPress={props.onPress} disabled={props.disabled}>
        <Text>{props.label}</Text>
      </TouchableOpacity>
    );
  },
}));

jest.mock('../../../theme', () => ({
  colors: {
    background: '#fff',
    surface: '#fff',
    primary: '#000',
    primaryLight: '#eee',
    border: '#ddd',
    textHeading: '#000',
    textMuted: '#888',
    black: '#000',
  },
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the form', () => {
    const {getByText, getByTestId} = render(<ForgotPasswordScreen />);
    expect(getByText('Forgot Password')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByText('Send Reset Link')).toBeTruthy();
  });

  it('should not submit if email is empty', () => {
    const {getByTestId} = render(<ForgotPasswordScreen />);
    const submitBtn = getByTestId('submit-btn');
    fireEvent.press(submitBtn);
    expect(mockedAuthService.forgotPassword).not.toHaveBeenCalled();
  });

  it('should show invalid email alert for malformed emails', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const {getByTestId} = render(<ForgotPasswordScreen />);
    fireEvent.changeText(getByTestId('email-input'), 'bad-email');
    fireEvent.press(getByTestId('submit-btn'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Invalid Email',
      'Please enter a valid email address.',
    );
    alertSpy.mockRestore();
  });

  it('should call forgotPassword and show success message', async () => {
    mockedAuthService.forgotPassword.mockResolvedValue(undefined);
    const {getByTestId, getByText} = render(<ForgotPasswordScreen />);
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.press(getByTestId('submit-btn'));
    await waitFor(() => {
      expect(getByText(/reset link has been sent/)).toBeTruthy();
    });
    expect(mockedAuthService.forgotPassword).toHaveBeenCalledWith('test@example.com');
  });

  it('should show error alert on API failure', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    mockedAuthService.forgotPassword.mockRejectedValue(new Error('fail'));
    const {getByTestId} = render(<ForgotPasswordScreen />);
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.press(getByTestId('submit-btn'));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Error',
        'Something went wrong. Please try again.',
      );
    });
    alertSpy.mockRestore();
  });

  it('should navigate back when back button is pressed', () => {
    const {getAllByText} = render(<ForgotPasswordScreen />);
    const backBtn = getAllByText('chevron-left')[0];
    fireEvent.press(backBtn);
    expect(mockGoBack).toHaveBeenCalled();
  });
});
