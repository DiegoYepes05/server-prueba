export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  legalId: string;
  legalIdType: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: Omit<User, 'id'>): Promise<User>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
