import React from 'react';
import {render} from '@testing-library/react-native';
import {OfflineIndicator} from './OfflineIndicator';

// ─── Mock ────────────────────────────────────────────────────────────────────

jest.mock('react-native-vector-icons/Feather', () => {
  const {Text} = require('react-native');
  return (props: any) => <Text testID="feather-icon">{props.name}</Text>;
});

jest.mock('../../theme', () => ({
  colors: {
    textMuted: '#888',
    inputBg: '#f0f0f0',
  },
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('OfflineIndicator', () => {
  it('should render nothing when lastUpdatedAt is null', () => {
    const {toJSON} = render(<OfflineIndicator lastUpdatedAt={null} />);
    expect(toJSON()).toBeNull();
  });

  it('should show "just now" for recent timestamps', () => {
    const {getByText} = render(
      <OfflineIndicator lastUpdatedAt={Date.now()} />,
    );
    expect(getByText('Last updated just now')).toBeTruthy();
  });

  it('should show minutes ago', () => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    const {getByText} = render(
      <OfflineIndicator lastUpdatedAt={fiveMinAgo} />,
    );
    expect(getByText('Last updated 5m ago')).toBeTruthy();
  });

  it('should show hours ago', () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const {getByText} = render(
      <OfflineIndicator lastUpdatedAt={twoHoursAgo} />,
    );
    expect(getByText('Last updated 2h ago')).toBeTruthy();
  });

  it('should show days ago', () => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const {getByText} = render(
      <OfflineIndicator lastUpdatedAt={threeDaysAgo} />,
    );
    expect(getByText('Last updated 3d ago')).toBeTruthy();
  });

  it('should render wifi-off icon', () => {
    const {getByText} = render(
      <OfflineIndicator lastUpdatedAt={Date.now()} />,
    );
    expect(getByText('wifi-off')).toBeTruthy();
  });
});
