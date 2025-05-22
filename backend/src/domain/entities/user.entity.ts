export class User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}
