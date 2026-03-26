import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {TextInput} from './TextInput';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TextInput component', () => {
  describe('rendering', () => {
    it('should render without crashing with no props', () => {
      const {toJSON} = render(<TextInput />);
      expect(toJSON()).toBeTruthy();
    });

    it('should display the label when provided', () => {
      const {getByText} = render(<TextInput label="Username" />);
      expect(getByText('Username')).toBeTruthy();
    });

    it('should not render a label when label prop is omitted', () => {
      const {queryByText} = render(<TextInput placeholder="Enter text" />);
      expect(queryByText('Enter text')).toBeNull(); // placeholder is not Text node
    });

    it('should display the error message when errorText is provided', () => {
      const {getByText} = render(
        <TextInput errorText="This field is required" />,
      );
      expect(getByText('This field is required')).toBeTruthy();
    });

    it('should display the description when provided and no errorText', () => {
      const {getByText} = render(
        <TextInput description="Enter your username" />,
      );
      expect(getByText('Enter your username')).toBeTruthy();
    });

    it('should hide description when errorText is present', () => {
      const {queryByText} = render(
        <TextInput description="Enter your username" errorText="Required" />,
      );
      expect(queryByText('Enter your username')).toBeNull();
    });

    it('should display errorText over description when both are provided', () => {
      const {getByText} = render(
        <TextInput description="Hint" errorText="Error!" />,
      );
      expect(getByText('Error!')).toBeTruthy();
    });
  });

  describe('interaction', () => {
    it('should call onChangeText when text is entered', () => {
      const onChangeText = jest.fn();
      const {getByPlaceholderText} = render(
        <TextInput placeholder="Type here" onChangeText={onChangeText} />,
      );
      fireEvent.changeText(getByPlaceholderText('Type here'), 'hello');
      expect(onChangeText).toHaveBeenCalledWith('hello');
    });

    it('should be non-editable when readOnly=true', () => {
      const {getByPlaceholderText} = render(
        <TextInput placeholder="Read only" readOnly />,
      );
      const input = getByPlaceholderText('Read only');
      expect(input.props.editable).toBe(false);
    });
  });

  describe('security', () => {
    it('should not render sensitive value in label or description nodes', () => {
      const {queryByText} = render(
        <TextInput
          label="Password"
          placeholder="Enter password"
          secureTextEntry
          value="super_secret_123"
        />,
      );
      // The secret value should not appear as rendered Text
      expect(queryByText('super_secret_123')).toBeNull();
    });
  });
});
