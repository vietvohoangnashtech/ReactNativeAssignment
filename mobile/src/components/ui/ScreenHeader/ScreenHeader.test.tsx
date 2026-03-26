import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Text, TouchableOpacity} from 'react-native';
import {ScreenHeader} from './ScreenHeader';

jest.mock('react-native-vector-icons/Feather', () => 'Feather');

describe('ScreenHeader component', () => {
  describe('rendering', () => {
    it('should render the title', () => {
      const {getByText} = render(<ScreenHeader title="My Screen" />);
      expect(getByText('My Screen')).toBeTruthy();
    });

    it('should render a TouchableOpacity back button when onBack is provided', () => {
      const {UNSAFE_getAllByType} = render(
        <ScreenHeader title="Back Screen" onBack={jest.fn()} />,
      );
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      expect(touchables.length).toBeGreaterThanOrEqual(1);
    });

    it('should not render a TouchableOpacity when onBack is not provided', () => {
      const {UNSAFE_queryAllByType} = render(<ScreenHeader title="No Back" />);
      const touchables = UNSAFE_queryAllByType(TouchableOpacity);
      expect(touchables).toHaveLength(0);
    });

    it('should render rightContent when provided', () => {
      const {getByText} = render(
        <ScreenHeader title="Header" rightContent={<Text>Edit</Text>} />,
      );
      expect(getByText('Edit')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onBack when back button is pressed', () => {
      const onBack = jest.fn();
      const {UNSAFE_getAllByType} = render(
        <ScreenHeader title="Back Screen" onBack={onBack} />,
      );
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      fireEvent.press(touchables[0]);
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });
});
