export interface User {
  id: number;
  username: string;
  email: string;
  age: number;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  age: number;
  firstName: string;
  lastName: string;
}
