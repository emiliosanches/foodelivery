import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/adapters/out/persistence/prisma/prisma.service';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'e2e-test',
        },
      },
    });
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', () => {
      const registerDto = {
        email: 'e2e-test-user@example.com',
        password: 'StrongPassword123!',
        name: 'E2E Test User',
        phone: '+5511999999999',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(registerDto.email);
          expect(res.body.name).toBe(registerDto.name);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 409 if email already exists', async () => {
      const registerDto = {
        email: 'e2e-test-duplicate@example.com',
        password: 'Password123!',
        name: 'Duplicate User',
        phone: '+5511999999999',
      };

      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      // Second registration with same email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409);
    });

    it('should return 400 for invalid email format', () => {
      const registerDto = {
        email: 'invalid-email',
        password: 'Password123!',
        name: 'Test User',
        phone: '+5511999999999',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should return 400 for missing required fields', () => {
      const incompleteDto = {
        email: 'test@example.com',
        // missing password and name
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(incompleteDto)
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    const testUser = {
      email: 'e2e-test-login@example.com',
      password: 'Password123!',
      name: 'Login Test User',
      phone: '+5511999999999',
    };

    beforeEach(async () => {
      // Register a user for login tests
      await request(app.getHttpServer()).post('/auth/register').send(testUser);
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should return 401 for invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should return 401 for non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });

    it('should return 400 for missing credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          // missing password
        })
        .expect(400);
    });
  });

  describe('JWT Token Validation', () => {
    let token: string;
    const testUser = {
      email: 'e2e-test-jwt@example.com',
      password: 'Password123!',
      name: 'JWT Test User',
      phone: '+5511999999999',
    };

    beforeEach(async () => {
      // Register and login to get a token
      await request(app.getHttpServer()).post('/auth/register').send(testUser);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      token = loginResponse.body.token;
    });

    it('should access protected route with valid token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testUser.email);
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('should return 401 with invalid token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});

