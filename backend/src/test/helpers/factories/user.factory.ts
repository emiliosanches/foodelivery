import { User } from '@/domain/entities/user.entity';
import { v7 as uuidv7 } from 'uuid';
import * as bcrypt from 'bcrypt';

export const createTestUser = (overrides?: Partial<User>): User => {
  const defaultUser: User = {
    id: uuidv7(),
    email: `test-${Date.now()}@example.com`,
    password: bcrypt.hashSync('password123', 10),
    name: 'Test User',
    phone: '+5511999999999',
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    ...defaultUser,
    ...overrides,
  };
};

export const createTestAdmin = (overrides?: Partial<User>): User => {
  return createTestUser({
    isAdmin: true,
    ...overrides,
  });
};

