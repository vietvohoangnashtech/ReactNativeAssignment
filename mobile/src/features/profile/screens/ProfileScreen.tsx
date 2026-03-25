import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAuthContext } from '../../../contexts/AuthContext';
import { authService } from '../../auth/services/authService';
import { useProfile } from '../hooks/useProfile';
import { TextInput } from '../../../components/ui/TextInput/TextInput';
import { Button } from '../../../components/ui/Button/Button';
import { ScreenHeader } from '../../../components/ui/ScreenHeader/ScreenHeader';
import { colors } from '../../../theme';

const ProfileScreen = (): React.JSX.Element => {
  const { logout } = useAuthContext();
  const { profile, loading, saving, error, isOffline, saveProfile } = useProfile();

  const [isEdit, setIsEdit] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setAge(String(profile.age));
    }
  }, [profile]);

  const handleSave = useCallback(async () => {
    if (saving) return; // Prevent multiple concurrent saves

    setSaveError(null);
    const parsedAge = parseInt(age, 10);
    if (age.trim() && (isNaN(parsedAge) || parsedAge < 1)) {
      setSaveError('Please enter a valid age');
      return;
    }

    try {
      await saveProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: age.trim() ? parsedAge : undefined,
      });
      setIsEdit(false);
    } catch {
      setSaveError('Failed to save profile');
    }
  }, [firstName, lastName, age, saveProfile, saving]);

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.logout();
          } catch {
            // best effort
          }
          await logout();
        },
      },
    ]);
  }, [logout]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim() || profile.username
    : 'User';

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profile" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {isOffline || error ? (
          <View style={styles.offlineBanner}>
            <Feather name="wifi-off" size={14} color="#92400E" />
            <Text style={styles.offlineText}>
              {isOffline ? 'Showing cached profile (offline)' : error}
            </Text>
          </View>
        ) : null}

        {/* Identity Card */}
        <View style={styles.identityCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName[0]?.toUpperCase() ?? 'U'}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          {profile?.username ? (
            <Text style={styles.usernameHandle}>@{profile.username}</Text>
          ) : null}
          {profile?.email ? (
            <View style={styles.emailRow}>
              <Feather name="mail" size={14} color={colors.textMuted} />
              <Text style={styles.emailText}>{profile.email}</Text>
            </View>
          ) : null}
        </View>

        {/* Account Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Account Details</Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => {
                setIsEdit(e => !e);
                setSaveError(null);
              }}
            >
              <Feather name={isEdit ? 'x' : 'edit-2'} size={14} color={colors.primary} />
              <Text style={styles.editLink}>{isEdit ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.readonlyRow}>
            <Text style={styles.fieldLabel}>USERNAME</Text>
            <Text style={styles.readonlyValue}>{profile?.username}</Text>
          </View>

          <View style={styles.readonlyRow}>
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <Text style={styles.readonlyValue}>{profile?.email}</Text>
          </View>

          {isEdit ? (
            <>
              <TextInput label="First Name" value={firstName} onChangeText={setFirstName} />
              <TextInput label="Last Name" value={lastName} onChangeText={setLastName} />
              <TextInput label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" />
              {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
              <Button
                label="Save Changes"
                onPress={handleSave}
                loading={saving}
                disabled={saving}
              />
            </>
          ) : (
            <>
              <View style={styles.readonlyRow}>
                <Text style={styles.fieldLabel}>FIRST NAME</Text>
                <Text style={styles.readonlyValue}>{profile?.firstName}</Text>
              </View>
              <View style={styles.readonlyRow}>
                <Text style={styles.fieldLabel}>LAST NAME</Text>
                <Text style={styles.readonlyValue}>{profile?.lastName}</Text>
              </View>
              <View style={styles.readonlyRow}>
                <Text style={styles.fieldLabel}>AGE</Text>
                <Text style={styles.readonlyValue}>{profile?.age}</Text>
              </View>
            </>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {[
            { icon: 'settings', label: 'Settings' },
            { icon: 'help-circle', label: 'Help & Support' },
            { icon: 'shield', label: 'Privacy Policy' },
          ].map(item => (
            <TouchableOpacity key={item.icon} style={styles.menuItem}>
              <View style={styles.menuIconWrap}>
                <Feather name={item.icon} size={18} color={colors.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={18} color={colors.textDisabled} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warningLight,
    padding: 12,
    margin: 12,
    borderRadius: 10,
  },
  offlineText: { color: '#92400E', fontSize: 13, flex: 1 },
  identityCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: colors.textHeading, fontSize: 32, fontWeight: '700' },
  displayName: { fontSize: 20, fontWeight: '700', color: colors.textHeading },
  usernameHandle: { fontSize: 14, color: colors.textDisabled, marginTop: 2 },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  emailText: { fontSize: 13, color: colors.textMuted },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textHeading },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editLink: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  readonlyRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDisabled,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  readonlyValue: { fontSize: 15, color: colors.textHeading },
  saveError: { color: colors.error, fontSize: 13, marginBottom: 8, textAlign: 'center' },
  menuCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    borderRadius: 12,
    paddingVertical: 4,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textHeading,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 32,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.errorLight,
  },
  logoutText: { color: colors.error, fontWeight: '700', fontSize: 16 },
});

export { ProfileScreen };
