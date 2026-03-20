import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {useAuthContext} from '../../../contexts/AuthContext';
import {authService} from '../../auth/services/authService';
import {useProfile} from '../hooks/useProfile';
import {TextInput} from '../../../components/ui/TextInput/TextInput';
import {ScreenHeader} from '../../../components/ui/ScreenHeader/ScreenHeader';

const ProfileScreen = (): React.JSX.Element => {
  const {logout} = useAuthContext();
  const {profile, loading, saving, error, isOffline, saveProfile} = useProfile();

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
  }, [firstName, lastName, age, saveProfile]);

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
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
        <ActivityIndicator size="large" color="#39B78D" />
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
            <Text style={styles.offlineText}>
              {isOffline ? '📶 Showing cached profile (offline)' : error}
            </Text>
          </View>
        ) : null}

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName[0]?.toUpperCase() ?? 'U'}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          {profile?.username ? (
            <Text style={styles.usernameHandle}>@{profile.username}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Account Details</Text>
            <TouchableOpacity onPress={() => {setIsEdit(e => !e); setSaveError(null);}}>
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
              <TextInput
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
              <TextInput
                label="Age"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
              />
              {saveError ? (
                <Text style={styles.saveError}>{saveError}</Text>
              ) : null}
              {saving ? (
                <ActivityIndicator color="#39B78D" style={styles.savingIndicator} />
              ) : (
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
              )}
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

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

type ProfileStyles = {
  container: ViewStyle;
  center: ViewStyle;
  offlineBanner: ViewStyle;
  offlineText: TextStyle;
  avatarSection: ViewStyle;
  avatar: ViewStyle;
  avatarText: TextStyle;
  displayName: TextStyle;
  usernameHandle: TextStyle;
  card: ViewStyle;
  cardHeader: ViewStyle;
  cardTitle: TextStyle;
  editLink: TextStyle;
  readonlyRow: ViewStyle;
  fieldLabel: TextStyle;
  readonlyValue: TextStyle;
  saveError: TextStyle;
  savingIndicator: ViewStyle;
  saveBtn: ViewStyle;
  saveBtnText: TextStyle;
  logoutBtn: ViewStyle;
  logoutText: TextStyle;
};

const styles = StyleSheet.create<ProfileStyles>({
  container: {flex: 1, backgroundColor: '#F9FAFB'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  offlineBanner: {
    backgroundColor: '#FEF9C3',
    padding: 12,
    margin: 12,
    borderRadius: 8,
  },
  offlineText: {color: '#92400E', fontSize: 13, textAlign: 'center'},
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#39B78D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {color: '#fff', fontSize: 32, fontWeight: '700'},
  displayName: {fontSize: 20, fontWeight: '700', color: '#1F2937'},
  usernameHandle: {fontSize: 14, color: '#9CA3AF', marginTop: 2},
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {fontSize: 16, fontWeight: '700', color: '#1F2937'},
  editLink: {color: '#39B78D', fontSize: 14, fontWeight: '600'},
  readonlyRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  readonlyValue: {fontSize: 15, color: '#1F2937'},
  saveError: {color: '#e53935', fontSize: 13, marginBottom: 8, textAlign: 'center'},
  savingIndicator: {marginVertical: 12},
  saveBtn: {
    backgroundColor: '#39B78D',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {color: '#fff', fontWeight: '700', fontSize: 15},
  logoutBtn: {
    marginHorizontal: 12,
    marginBottom: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
  },
  logoutText: {color: '#DC2626', fontWeight: '700', fontSize: 16},
});

export {ProfileScreen};
