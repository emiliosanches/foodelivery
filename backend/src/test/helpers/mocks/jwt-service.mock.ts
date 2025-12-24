import { JwtService } from '@nestjs/jwt';

export const createMockJwtService = (): jest.Mocked<JwtService> => {
  return {
    sign: jest.fn(),
    signAsync: jest.fn(),
    verify: jest.fn(),
    verifyAsync: jest.fn(),
    decode: jest.fn(),
  } as unknown as jest.Mocked<JwtService>;
};

