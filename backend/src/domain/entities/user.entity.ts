export type UserRole = 'CUSTOMER' | 'RESTAURANT' | 'DELIVERY' | 'ADMIN';

export class User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
