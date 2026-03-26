import React from 'react';
import {render} from '@testing-library/react-native';
import {Background} from './Background';
import {Text} from 'react-native';

describe('Background component', () => {
  it('should render without crashing', () => {
    const {toJSON} = render(
      <Background>
        <Text>Hello</Text>
      </Background>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should render children', () => {
    const {getByText} = render(
      <Background>
        <Text>Test Child</Text>
      </Background>,
    );
    expect(getByText('Test Child')).toBeTruthy();
  });

  it('should render multiple children', () => {
    const {getByText} = render(
      <Background>
        <Text>First</Text>
        <Text>Second</Text>
      </Background>,
    );
    expect(getByText('First')).toBeTruthy();
    expect(getByText('Second')).toBeTruthy();
  });
});
