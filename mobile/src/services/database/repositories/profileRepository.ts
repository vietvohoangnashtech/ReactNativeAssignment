import {database} from '../database';
import {ProfileModel} from '../models/ProfileModel';
import type {UserProfile} from '../../../features/profile/types/profile.types';

const profilesCollection = database.get<ProfileModel>('profiles');

export const profileRepository = {
  async saveProfile(profile: UserProfile): Promise<void> {
    await database.write(async () => {
      const existing = await profilesCollection.query().fetch();
      const first = existing[0];
      if (first !== undefined) {
        await first.update(record => {
          record.userId = profile.id;
          record.username = profile.username;
          record.email = profile.email;
          record.age = profile.age;
          record.firstName = profile.firstName;
          record.lastName = profile.lastName;
          record.role = profile.role;
        });
      } else {
        await profilesCollection.create(record => {
          record.userId = profile.id;
          record.username = profile.username;
          record.email = profile.email;
          record.age = profile.age;
          record.firstName = profile.firstName;
          record.lastName = profile.lastName;
          record.role = profile.role;
        });
      }
    });
  },

  async getProfile(): Promise<UserProfile | null> {
    const records = await profilesCollection.query().fetch();
    const first = records[0];
    if (first === undefined) {
      return null;
    }
    return {
      id: first.userId,
      username: first.username,
      email: first.email,
      age: first.age,
      firstName: first.firstName,
      lastName: first.lastName,
      role: first.role,
    };
  },

  async clearProfile(): Promise<void> {
    await database.write(async () => {
      const records = await profilesCollection.query().fetch();
      if (records.length > 0) {
        await database.batch(...records.map(r => r.prepareDestroyPermanently()));
      }
    });
  },
};
