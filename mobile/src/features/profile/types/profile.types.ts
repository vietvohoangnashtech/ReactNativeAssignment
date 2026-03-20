export interface UserProfile {
  id: number;
  username: string;
  email: string;
  age: number;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  age?: number;
}
