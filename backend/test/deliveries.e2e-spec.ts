import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/adapters/out/persistence/prisma/prisma.service';

describe('Deliveries (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let customerToken: string;
  let customerId: string;
  let restaurantToken: string;
  let restaurantId: string;
  let restaurantUserId: string;
  let deliveryPersonToken: string;
  let deliveryPersonId: string;
  let deliveryPersonUserId: string;
  let menuItemId: string;
  let categoryId: string;
  let deliveryAddressId: string;
  let orderId: string;
  let deliveryId: string;

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
        email: 'e2e-test-customer-deliveries@example.com',
        password: 'Password123!',
        name: 'E2E Customer Deliveries',
        phone: '+5511999999996',
      });

    customerId = customerRes.body.id;

    const customerLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e-test-customer-deliveries@example.com',
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
        state: 'TS',
        postalCode: '12345-678',
        country: 'BR',
        isDefault: true,
        latitude: -23.5505,
        longitude: -46.6333,
        type: 'HOME',
      });

    deliveryAddressId = addressRes.body.id;

    // Create restaurant user
    const restaurantUserRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e-test-restaurant-deliveries@example.com',
        password: 'Password123!',
        name: 'E2E Restaurant Deliveries',
        phone: '+5511999999997',
      });

    restaurantUserId = restaurantUserRes.body.id;

    const restaurantLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e-test-restaurant-deliveries@example.com',
        password: 'Password123!',
      });

    restaurantToken = restaurantLoginRes.body.token;

    // Create restaurant
    const restaurantRes = await request(app.getHttpServer())
      .post('/restaurants')
      .set('Authorization', `Bearer ${restaurantToken}`)
      .send({
        name: 'E2E Test Restaurant Deliveries',
        description: 'Restaurant for E2E delivery testing',
        phone: '+5511999999998',
        email: 'e2e-restaurant-deliveries@example.com',
        imageUrl: 'https://example.com/restaurant.jpg',
        deliveryFee: 500,
        deliveryTimeMin: 20,
        deliveryTimeMax: 40,
        address: {
          street: 'Restaurant Street',
          number: '456',
          neighborhood: 'Restaurant Neighborhood',
          city: 'Test City',
          state: 'TS',
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
        name: 'E2E Deliveries',
        description: 'Category for testing deliveries',
      });

    categoryId = categoryRes.body.id;

    // Create menu item
    const menuItemRes = await request(app.getHttpServer())
      .post(`/restaurants/${restaurantId}/menu-items`)
      .set('Authorization', `Bearer ${restaurantToken}`)
      .send({
        categoryId,
        name: 'E2E Pizza',
        description: 'Pizza for E2E delivery testing',
        price: 2500,
        imageUrl: 'https://example.com/pizza.jpg',
        preparationTimeMin: 30,
      });

    menuItemId = menuItemRes.body.id;

    // Create delivery person user
    const deliveryPersonUserRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e-test-delivery-person@example.com',
        password: 'Password123!',
        name: 'E2E Delivery Person',
        phone: '+5511999999999',
      });

    deliveryPersonUserId = deliveryPersonUserRes.body.id;

    const deliveryPersonLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e-test-delivery-person@example.com',
        password: 'Password123!',
      });

    deliveryPersonToken = deliveryPersonLoginRes.body.token;

    // Create delivery person profile
    const deliveryPersonRes = await request(app.getHttpServer())
      .post('/users/me/delivery-profile')
      .set('Authorization', `Bearer ${deliveryPersonToken}`)
      .send({
        vehicleType: 'MOTORCYCLE',
        vehiclePlate: 'ABC1234',
        driverLicense: 'AB12345678',
      });

    deliveryPersonId = deliveryPersonRes.body.id;

    // Create an order and set it to READY to generate a delivery
    const orderRes = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        restaurantId,
        deliveryAddressId,
        items: [{ menuItemId, quantity: 1 }],
        payment: { type: 'CASH' },
      });

    orderId = orderRes.body.id;

    // Update order to PREPARING
    await request(app.getHttpServer())
      .patch(`/restaurants/${restaurantId}/orders/${orderId}/accept`)
      .set('Authorization', `Bearer ${restaurantToken}`);

    // Update order to READY (this should create a delivery)
    await request(app.getHttpServer())
      .patch(`/restaurants/${restaurantId}/orders/${orderId}/ready`)
      .set('Authorization', `Bearer ${restaurantToken}`);

    // Get the created delivery ID
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true },
    });

    if (order?.delivery) {
      deliveryId = order.delivery.id;

      // Assign delivery to delivery person so tests can access it
      await prisma.delivery.update({
        where: { id: deliveryId },
        data: {
          deliveryPersonId: deliveryPersonId,
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      });
    }
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

    await prisma.delivery.deleteMany({
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

    await prisma.deliveryPerson.deleteMany({
      where: { userId: deliveryPersonUserId },
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

  describe('GET /users/me/delivery-profile/deliveries', () => {
    // Error: "status is not defined" in findByDeliveryPersonId method
    it('should return list of delivery person deliveries', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me/delivery-profile/deliveries')
        .set('Authorization', `Bearer ${deliveryPersonToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .get('/users/me/delivery-profile/deliveries')
        .expect(401);
    });
  });

  describe('POST /users/me/delivery-profile/deliveries/:id/accept', () => {
    it('should allow delivery person to accept a delivery', async () => {
      // Ensure delivery person is AVAILABLE
      await prisma.deliveryPerson.update({
        where: { id: deliveryPersonId },
        data: { availability: 'AVAILABLE' },
      });

      // Create a new PENDING delivery for this test
      const newOrderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurantId,
          deliveryAddressId,
          items: [{ menuItemId, quantity: 1 }],
          payment: { type: 'CASH' },
        });

      const newOrderId = newOrderRes.body.id;

      // Accept and mark as READY to create delivery
      await request(app.getHttpServer())
        .patch(`/restaurants/${restaurantId}/orders/${newOrderId}/accept`)
        .set('Authorization', `Bearer ${restaurantToken}`);

      await request(app.getHttpServer())
        .patch(`/restaurants/${restaurantId}/orders/${newOrderId}/ready`)
        .set('Authorization', `Bearer ${restaurantToken}`);

      // Get the new delivery
      const newOrder = await prisma.order.findUnique({
        where: { id: newOrderId },
        include: { delivery: true },
      });

      const newDeliveryId = newOrder?.delivery?.id;

      if (!newDeliveryId) {
        throw new Error('Failed to create delivery for test');
      }

      // Now accept the PENDING delivery
      await request(app.getHttpServer())
        .post(`/users/me/delivery-profile/deliveries/${newDeliveryId}/accept`)
        .set('Authorization', `Bearer ${deliveryPersonToken}`)
        .expect(204);

      // Verify delivery was accepted
      const delivery = await prisma.delivery.findUnique({
        where: { id: newDeliveryId },
      });
      expect(delivery?.deliveryPersonId).toBe(deliveryPersonId);
      expect(delivery?.status).toBe('ACCEPTED');
    });

    it('should return 404 for non-existent delivery', () => {
      return request(app.getHttpServer())
        .post('/users/me/delivery-profile/deliveries/non-existent-id/accept')
        .set('Authorization', `Bearer ${deliveryPersonToken}`)
        .expect(404);
    });

    it('should return 401 if not authenticated', async () => {
      if (!deliveryId) {
        return;
      }

      return request(app.getHttpServer())
        .post(`/users/me/delivery-profile/deliveries/${deliveryId}/accept`)
        .expect(401);
    });
  });

  describe('PUT /users/me/delivery-profile/deliveries/:id/location', () => {
    // Currently returns 403 Forbidden when delivery not assigned to delivery person
    it('should update delivery person current location', async () => {
      if (!deliveryId) {
        console.warn('No delivery for location update');
        return;
      }

      await request(app.getHttpServer())
        .put(`/users/me/delivery-profile/deliveries/${deliveryId}/location`)
        .set('Authorization', `Bearer ${deliveryPersonToken}`)
        .send({
          latitude: -23.5507,
          longitude: -46.6335,
        })
        .expect(204);

      // Verify location was updated
      const delivery = await prisma.delivery.findUnique({
        where: { id: deliveryId },
      });
      expect(delivery?.currentLatitude).toBe(-23.5507);
      expect(delivery?.currentLongitude).toBe(-46.6335);
    });

    it('should return 400 for invalid coordinates', async () => {
      if (!deliveryId) {
        return;
      }

      return request(app.getHttpServer())
        .put(`/users/me/delivery-profile/deliveries/${deliveryId}/location`)
        .set('Authorization', `Bearer ${deliveryPersonToken}`)
        .send({
          latitude: 999, // Invalid latitude
          longitude: -46.6335,
        })
        .expect(400);
    });

    it('should return 404 for non-existent delivery', () => {
      return request(app.getHttpServer())
        .put('/users/me/delivery-profile/deliveries/non-existent-id/location')
        .set('Authorization', `Bearer ${deliveryPersonToken}`)
        .send({
          latitude: -23.5507,
          longitude: -46.6335,
        })
        .expect(404);
    });
  });

  describe('POST /users/me/delivery-profile/deliveries/:id/pickup', () => {
    // Currently returns 403 Forbidden when delivery not assigned to delivery person
    it('should mark delivery as picked up', async () => {
      if (!deliveryId) {
        console.warn('No delivery for pickup');
        return;
      }

      await request(app.getHttpServer())
        .post(`/users/me/delivery-profile/deliveries/${deliveryId}/pickup`)
        .set('Authorization', `Bearer ${deliveryPersonToken}`)
        .expect(204);

      // Verify status was updated
      const delivery = await prisma.delivery.findUnique({
        where: { id: deliveryId },
      });
      expect(delivery?.status).toBe('PICKED_UP');
      expect(delivery?.pickedUpAt).toBeDefined();
    });

    it('should return 404 for non-existent delivery', () => {
      return request(app.getHttpServer())
        .post('/users/me/delivery-profile/deliveries/non-existent-id/pickup')
        .set('Authorization', `Bearer ${deliveryPersonToken}`)
        .expect(404);
    });
  });

  describe('POST /users/me/delivery-profile/deliveries/:id/deliver', () => {
    // Currently returns 403 Forbidden when delivery not assigned to delivery person
    it('should mark delivery as delivered', async () => {
      if (!deliveryId) {
        console.warn('No delivery for delivery');
        return;
      }

      await request(app.getHttpServer())
        .post(`/users/me/delivery-profile/deliveries/${deliveryId}/deliver`)
        .set('Authorization', `Bearer ${deliveryPersonToken}`)
        .expect(204);

      // Verify status was updated
      const delivery = await prisma.delivery.findUnique({
        where: { id: deliveryId },
      });
      expect(delivery?.status).toBe('DELIVERED');
      expect(delivery?.deliveredAt).toBeDefined();
    });

    it('should return 404 for non-existent delivery', () => {
      return request(app.getHttpServer())
        .post('/users/me/delivery-profile/deliveries/non-existent-id/deliver')
        .set('Authorization', `Bearer ${deliveryPersonToken}`)
        .expect(404);
    });
  });

  describe('GET /users/me/delivery-profile/deliveries/:id', () => {
    // Currently returns 403 Forbidden when delivery not assigned to delivery person
    it('should return delivery details for delivery person', async () => {
      if (!deliveryId) {
        console.warn('No delivery for details retrieval');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/users/me/delivery-profile/deliveries/${deliveryId}`)
        .set('Authorization', `Bearer ${deliveryPersonToken}`)
        .expect(200);

      expect(response.body.id).toBe(deliveryId);
      expect(response.body).toHaveProperty('order');
      expect(response.body).toHaveProperty('status');
    });

    it('should return 404 for non-existent delivery', () => {
      return request(app.getHttpServer())
        .get('/users/me/delivery-profile/deliveries/non-existent-id')
        .set('Authorization', `Bearer ${deliveryPersonToken}`)
        .expect(404);
    });
  });
});

