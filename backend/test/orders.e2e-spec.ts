import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/adapters/out/persistence/prisma/prisma.service';

describe('Orders (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let customerToken: string;
  let customerId: string;
  let restaurantToken: string;
  let restaurantId: string;
  let restaurantUserId: string;
  let menuItemId: string;
  let categoryId: string;
  let deliveryAddressId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    prisma = app.get<PrismaService>(PrismaService);

    await app.init();

    // Create customer user
    const customerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e-test-customer-orders@example.com',
        password: 'Password123!',
        name: 'E2E Customer Orders',
        phone: '+5511999999991',
      });

    customerId = customerRes.body.id;

    const customerLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e-test-customer-orders@example.com',
        password: 'Password123!',
      });

    customerToken = customerLoginRes.body.token;

    // Create delivery address for customer
    const addressRes = await request(app.getHttpServer())
      .post('/addresses')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        street: 'Test Street',
        number: '123',
        neighborhood: 'Test Neighborhood',
        city: 'Test City',
        state: 'SP',
        postalCode: '12345-678',
        country: 'BR',
        latitude: -23.5505,
        longitude: -46.6333,
        type: 'HOME',
      });

    deliveryAddressId = addressRes.body.id;

    // Create restaurant user
    const restaurantUserRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e-test-restaurant-orders@example.com',
        password: 'Password123!',
        name: 'E2E Restaurant Orders',
        phone: '+5511999999992',
      });

    restaurantUserId = restaurantUserRes.body.id;

    const restaurantLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e-test-restaurant-orders@example.com',
        password: 'Password123!',
      });

    restaurantToken = restaurantLoginRes.body.token;

    // Create restaurant
    const restaurantRes = await request(app.getHttpServer())
      .post('/restaurants')
      .set('Authorization', `Bearer ${restaurantToken}`)
      .send({
        name: 'E2E Test Restaurant',
        description: 'Restaurant for E2E testing',
        phone: '+5511999999993',
        email: 'e2e-restaurant-orders@example.com',
        imageUrl: 'https://example.com/restaurant.jpg',
        deliveryFee: 500,
        deliveryTimeMin: 20,
        deliveryTimeMax: 40,
        address: {
          street: 'Restaurant Street',
          number: '456',
          neighborhood: 'Restaurant Neighborhood',
          city: 'Test City',
          state: 'SP',
          postalCode: '12345-679',
          country: 'BR',
          latitude: -23.5506,
          longitude: -46.6334,
        },
      });

    restaurantId = restaurantRes.body.id;

    // Create category
    const categoryRes = await request(app.getHttpServer())
      .post(`/restaurants/${restaurantId}/categories`)
      .set('Authorization', `Bearer ${restaurantToken}`)
      .send({
        name: 'E2E Test Category',
        description: 'Category for testing',
      });

    categoryId = categoryRes.body.id;

    // Create menu item
    const menuItemRes = await request(app.getHttpServer())
      .post(`/restaurants/${restaurantId}/menu-items`)
      .set('Authorization', `Bearer ${restaurantToken}`)
      .send({
        categoryId,
        name: 'E2E Test Pizza',
        description: 'Pizza for E2E testing',
        price: 2500,
        imageUrl: 'https://example.com/pizza.jpg',
        preparationTimeMin: 30,
      });

    menuItemId = menuItemRes.body.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.orderItem.deleteMany({
      where: {
        order: {
          OR: [{ customerId }, { restaurantId }],
        },
      },
    });

    await prisma.order.deleteMany({
      where: {
        OR: [{ customerId }, { restaurantId }],
      },
    });

    await prisma.menuItem.deleteMany({
      where: { categoryId },
    });

    await prisma.category.deleteMany({
      where: { restaurantId },
    });

    await prisma.address.deleteMany({
      where: {
        OR: [{ userId: customerId }, { restaurant: { id: restaurantId } }],
      },
    });

    await prisma.restaurant.deleteMany({
      where: { userId: restaurantUserId },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'e2e-test',
        },
      },
    });

    await app.close();
  });

  describe('POST /orders', () => {
    it('should create a new order with CASH payment', async () => {
      const orderDto = {
        restaurantId,
        deliveryAddressId,
        items: [
          {
            menuItemId,
            quantity: 2,
          },
        ],
        payment: {
          type: 'CASH',
          changeFor: 10000,
        },
      };

      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(orderDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.customerId).toBe(customerId);
          expect(res.body.restaurantId).toBe(restaurantId);
          expect(res.body.status).toBe('PENDING');
          expect(res.body.paymentType).toBe('CASH');
          expect(res.body.subtotal).toBe(5000); // 2 * 2500
          expect(res.body.deliveryFee).toBe(500);
          expect(res.body.totalAmount).toBe(5500);
          expect(res.body.orderItems).toHaveLength(1);
        });
    });

    it('should create a new order with PIX payment', async () => {
      const orderDto = {
        restaurantId,
        deliveryAddressId,
        items: [
          {
            menuItemId,
            quantity: 1,
          },
        ],
        payment: {
          type: 'PIX',
        },
      };

      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(orderDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.paymentType).toBe('PIX');
          expect(res.body.paymentData).toHaveProperty('pixCode');
          expect(res.body.paymentData).toHaveProperty('qrCodeImage');
        });
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer()).post('/orders').send({}).expect(401);
    });

    it('should return 400 for invalid order data', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          // Missing required fields
          items: [],
        })
        .expect(400);
    });

    it('should return 404 if restaurant not found', () => {
      // Use a valid UUID v7 format that doesn't exist
      // UUID v7 has version bits (7) at position 12-15 and variant bits (10) at position 16-17
      const nonExistentRestaurantId = '01900000-0000-7000-8000-000000000000';

      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurantId: nonExistentRestaurantId,
          deliveryAddressId,
          items: [{ menuItemId, quantity: 1 }],
          payment: { type: 'CASH' },
        })
        .expect(404);
    });
  });

  describe('PATCH /orders/:id/cancel', () => {
    it('should allow customer to cancel their own order', async () => {
      // Create order first
      const orderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurantId,
          deliveryAddressId,
          items: [{ menuItemId, quantity: 1 }],
          payment: { type: 'CASH' },
        });

      const orderId = orderRes.body.id;

      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          reason: 'Changed my mind',
        })
        .expect(200);

      // GET the order to verify it was cancelled
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.status).toBe('CANCELLED');
      expect(response.body.cancellationReason).toBe('Changed my mind');
    });

    it('should return 403 if trying to cancel another customer order', async () => {
      // Create another customer
      const otherCustomerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'e2e-test-other-customer@example.com',
          password: 'Password123!',
          name: 'Other Customer',
          phone: '+5511999999994',
        });

      const otherCustomerLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'e2e-test-other-customer@example.com',
          password: 'Password123!',
        });

      const otherCustomerToken = otherCustomerLogin.body.token;

      // Create order with first customer
      const orderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurantId,
          deliveryAddressId,
          items: [{ menuItemId, quantity: 1 }],
          payment: { type: 'CASH' },
        });

      const orderId = orderRes.body.id;

      // Try to cancel with second customer
      return request(app.getHttpServer())
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${otherCustomerToken}`)
        .send({ reason: 'Test' })
        .expect(403);
    });
  });

  describe('PATCH /orders/:id/status (Restaurant)', () => {
    it('should allow restaurant to update order status to PREPARING', async () => {
      // Create order
      const orderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurantId,
          deliveryAddressId,
          items: [{ menuItemId, quantity: 1 }],
          payment: { type: 'CASH' },
        });

      const orderId = orderRes.body.id;

      await request(app.getHttpServer())
        .patch(`/restaurants/${restaurantId}/orders/${orderId}/accept`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(204);

      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(200);

      expect(response.body.status).toBe('PREPARING');
    });

    it('should allow restaurant to update order status to READY', async () => {
      // Create order and update to PREPARING first
      const orderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurantId,
          deliveryAddressId,
          items: [{ menuItemId, quantity: 1 }],
          payment: { type: 'CASH' },
        });

      const orderId = orderRes.body.id;

      await request(app.getHttpServer())
        .patch(`/restaurants/${restaurantId}/orders/${orderId}/accept`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .patch(`/restaurants/${restaurantId}/orders/${orderId}/ready`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(204);

      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(200);

      expect(response.body.status).toBe('READY');
    });

    it('should return 403 if restaurant tries to update order from another restaurant', async () => {
      // Create another restaurant
      const otherRestaurantUserRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'e2e-test-other-restaurant@example.com',
          password: 'Password123!',
          name: 'Other Restaurant',
          phone: '+5511999999995',
        });

      const otherRestaurantLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'e2e-test-other-restaurant@example.com',
          password: 'Password123!',
        });

      const otherRestaurantToken = otherRestaurantLogin.body.token;

      // Create order with first restaurant
      const orderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurantId,
          deliveryAddressId,
          items: [{ menuItemId, quantity: 1 }],
          payment: { type: 'CASH' },
        });

      const orderId = orderRes.body.id;

      // Try to update with second restaurant
      return request(app.getHttpServer())
        .patch(`/restaurants/${restaurantId}/orders/${orderId}/accept`)
        .set('Authorization', `Bearer ${otherRestaurantToken}`)
        .expect(403);
    });

    it('should return 400 for invalid status transition', async () => {
      // Create order
      const orderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurantId,
          deliveryAddressId,
          items: [{ menuItemId, quantity: 1 }],
          payment: { type: 'CASH' },
        });

      const orderId = orderRes.body.id;

      // First accept the order (PENDING -> PREPARING)
      await request(app.getHttpServer())
        .patch(`/restaurants/${restaurantId}/orders/${orderId}/accept`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(204);

      // Then mark as ready (PREPARING -> READY)
      await request(app.getHttpServer())
        .patch(`/restaurants/${restaurantId}/orders/${orderId}/ready`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(204);

      // Try to accept again (invalid: READY -> PREPARING)
      return request(app.getHttpServer())
        .patch(`/restaurants/${restaurantId}/orders/${orderId}/accept`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(400);
    });
  });

  describe('GET /orders/:id', () => {
    it('should return order details for customer', async () => {
      const orderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurantId,
          deliveryAddressId,
          items: [{ menuItemId, quantity: 2 }],
          payment: { type: 'CASH' },
        });

      const orderId = orderRes.body.id;

      return request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(orderId);
          expect(res.body).toHaveProperty('customer');
          expect(res.body).toHaveProperty('restaurant');
          expect(res.body).toHaveProperty('orderItems');
        });
    });

    it('should return 404 for non-existent order', () => {
      return request(app.getHttpServer())
        .get('/orders/non-existent-id')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(404);
    });
  });

  describe('GET /orders (List)', () => {
    it('should return list of customer orders', () => {
      return request(app.getHttpServer())
        .get('/customers/me/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('should return list of restaurant orders', () => {
      return request(app.getHttpServer())
        .get(`/restaurants/${restaurantId}/orders`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });
  });
});

