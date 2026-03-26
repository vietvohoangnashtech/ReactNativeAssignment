import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Button} from './Button';

// ─── Mock native dependencies ────────────────────────────────────────────────

jest.mock('react-native-vector-icons/Feather', () => 'Feather');

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Button component', () => {
  describe('rendering', () => {
    it('should render the label text', () => {
      const {getByText} = render(<Button label="Press Me" onPress={jest.fn()} />);
      expect(getByText('Press Me')).toBeTruthy();
    });

    it('should show ActivityIndicator when loading=true and hide label', () => {
      const {queryByText, UNSAFE_getByType} = render(
        <Button label="Submit" onPress={jest.fn()} loading />,
      );
      // label text should not be visible when loading
      expect(queryByText('Submit')).toBeNull();
      // An ActivityIndicator should be rendered
       
      const {ActivityIndicator} = require('react-native');
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('should render an icon alongside the label when icon prop is provided', () => {
      const icon = <></>;
      const {getByText} = render(
        <Button label="With Icon" onPress={jest.fn()} icon={icon} />,
      );
      expect(getByText('With Icon')).toBeTruthy();
    });

    it('should apply outline variant styles without crashing', () => {
      const {getByText} = render(
        <Button label="Outline" onPress={jest.fn()} variant="outline" />,
      );
      expect(getByText('Outline')).toBeTruthy();
    });

    it('should apply ghost variant styles without crashing', () => {
      const {getByText} = render(
        <Button label="Ghost" onPress={jest.fn()} variant="ghost" />,
      );
      expect(getByText('Ghost')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onPress when tapped', () => {
      const handlePress = jest.fn();
      const {getByText} = render(<Button label="Tap Me" onPress={handlePress} />);
      fireEvent.press(getByText('Tap Me'));
      expect(handlePress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled=true', () => {
      const handlePress = jest.fn();
      const {getByText} = render(
        <Button label="Disabled" onPress={handlePress} disabled />,
      );
      fireEvent.press(getByText('Disabled'));
      expect(handlePress).not.toHaveBeenCalled();
    });

    it('should not call onPress when loading=true', () => {
      const handlePress = jest.fn();
      const {UNSAFE_getByType} = render(
        <Button label="Loading" onPress={handlePress} loading />,
      );
       
      const {ActivityIndicator} = require('react-native');
      fireEvent.press(UNSAFE_getByType(ActivityIndicator));
      expect(handlePress).not.toHaveBeenCalled();
    });
  });
});
