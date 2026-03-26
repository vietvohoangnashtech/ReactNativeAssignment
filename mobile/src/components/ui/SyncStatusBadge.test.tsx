import React from 'react';
import {render} from '@testing-library/react-native';
import {SyncStatusBadge} from './SyncStatusBadge';

// ─── Mock ────────────────────────────────────────────────────────────────────

jest.mock('react-native-vector-icons/Feather', () => {
  const {Text} = require('react-native');
  return (props: any) => <Text testID="feather-icon">{props.name}</Text>;
});

jest.mock('../../theme', () => ({
  colors: {},
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SyncStatusBadge', () => {
  it('should render nothing for synced status', () => {
    const {toJSON} = render(<SyncStatusBadge status="synced" />);
    expect(toJSON()).toBeNull();
  });

  it('should render clock icon for pending status', () => {
    const {getByText} = render(<SyncStatusBadge status="pending" />);
    expect(getByText('clock')).toBeTruthy();
  });

  it('should render refresh-cw icon for syncing status', () => {
    const {getByText} = render(<SyncStatusBadge status="syncing" />);
    expect(getByText('refresh-cw')).toBeTruthy();
  });

  it('should render alert-triangle icon for failed status', () => {
    const {getByText} = render(<SyncStatusBadge status="failed" />);
    expect(getByText('alert-triangle')).toBeTruthy();
  });
});
