import {useCallback, useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '../../../store/store';
import {fetchProfile, updateProfile} from '../store/profileSlice';
import type {UpdateProfilePayload} from '../types/profile.types';

const useProfile = () => {
  const dispatch = useAppDispatch();
  const {data, loading, saving, error, isOffline} = useAppSelector(
    state => state.profile,
  );

  const loadProfile = useCallback(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = useCallback(
    (payload: UpdateProfilePayload) => {
      return dispatch(updateProfile(payload)).unwrap();
    },
    [dispatch],
  );

  return {profile: data, loading, saving, error, isOffline, refetch: loadProfile, saveProfile};
};

export {useProfile};
