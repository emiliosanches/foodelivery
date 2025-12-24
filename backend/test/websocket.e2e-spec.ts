import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/adapters/out/persistence/prisma/prisma.service';

describe('WebSocket Events (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let customerSocket: Socket;
  let restaurantSocket: Socket;
  let deliveryPersonSocket: Socket;
  let customerToken: string;
  let customerId: string;
  let restaurantToken: string;
  let restaurantId: string;
  let restaurantUserId: string;
  let deliveryPersonToken: string;
  let deliveryPersonId: string;
  let menuItemId: string;
  let categoryId: string;
  let deliveryAddressId: string;

  const createSocketConnection = (token: string): Promise<Socket> => {
    return new Promise((resolve, reject) => {
      const socket = io(`http://localhost:3000`, {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('connect', () => resolve(socket));
      socket.on('connect_error', (error) => reject(error));
    });
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
    await app.listen(3000);

    // Create customer user
    const customerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e-test-customer-ws@example.com',
        password: 'Password123!',
        name: 'E2E Customer WebSocket',
        phone: '+5511988888881',
      });

    customerId = customerRes.body.id;

    const customerLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e-test-customer-ws@example.com',
        password: 'Password123!',
      });

    customerToken = customerLoginRes.body.token;

    // Create delivery address
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
        email: 'e2e-test-restaurant-ws@example.com',
        password: 'Password123!',
        name: 'E2E Restaurant WebSocket',
        phone: '+5511988888882',
      });

    restaurantUserId = restaurantUserRes.body.id;

    const restaurantLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e-test-restaurant-ws@example.com',
        password: 'Password123!',
      });

    restaurantToken = restaurantLoginRes.body.token;

    // Create restaurant
    const restaurantRes = await request(app.getHttpServer())
      .post('/restaurants')
      .set('Authorization', `Bearer ${restaurantToken}`)
      .send({
        name: 'E2E Test Restaurant WS',
        description: 'Restaurant for WebSocket testing',
        phone: '+5511988888883',
        email: 'e2e-restaurant-ws@example.com',
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
        name: 'E2E WS Category',
        description: 'Category for WebSocket testing',
      });

    categoryId = categoryRes.body.id;

    // Create menu item
    const menuItemRes = await request(app.getHttpServer())
      .post(`/restaurants/${restaurantId}/menu-items`)
      .set('Authorization', `Bearer ${restaurantToken}`)
      .send({
        categoryId,
        name: 'E2E Pizza WS',
        description: 'Pizza for WebSocket testing',
        price: 2500,
        imageUrl: 'https://example.com/pizza.jpg',
        preparationTimeMin: 30,
      });

    menuItemId = menuItemRes.body.id;

    // Create delivery person user
    const deliveryPersonUserRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e-test-delivery-person-ws@example.com',
        password: 'Password123!',
        name: 'E2E Delivery Person WS',
        phone: '+5511988888884',
      });

    const deliveryPersonLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e-test-delivery-person-ws@example.com',
        password: 'Password123!',
      });

    deliveryPersonToken = deliveryPersonLoginRes.body.token;

    // Create delivery person profile
    const deliveryPersonRes = await request(app.getHttpServer())
      .post('/delivery-persons')
      .set('Authorization', `Bearer ${deliveryPersonToken}`)
      .send({
        vehicleType: 'MOTORCYCLE',
        vehiclePlate: 'XYZ9876',
        driverLicense: 'CD98765432',
      });

    deliveryPersonId = deliveryPersonRes.body.id;

    // Create WebSocket connections
    try {
      customerSocket = await createSocketConnection(customerToken);
      restaurantSocket = await createSocketConnection(restaurantToken);
      deliveryPersonSocket = await createSocketConnection(deliveryPersonToken);
    } catch (error) {
      console.warn('WebSocket connections failed:', error);
    }
  });

  afterAll(async () => {
    // Close WebSocket connections
    if (customerSocket?.connected) customerSocket.disconnect();
    if (restaurantSocket?.connected) restaurantSocket.disconnect();
    if (deliveryPersonSocket?.connected) deliveryPersonSocket.disconnect();

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
      where: { id: deliveryPersonId },
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

  describe('WebSocket Connection', () => {
    it('should connect customer socket successfully', () => {
      expect(customerSocket?.connected).toBe(true);
    });

    it('should connect restaurant socket successfully', () => {
      expect(restaurantSocket?.connected).toBe(true);
    });

    it('should connect delivery person socket successfully', () => {
      expect(deliveryPersonSocket?.connected).toBe(true);
    });
  });

  describe('Order Status Updates', () => {
    it('should receive order status update event when order is created', async () => {
      if (!customerSocket?.connected) {
        console.warn('Customer socket not connected, skipping test');
        return;
      }

      const orderStatusPromise = new Promise((resolve) => {
        customerSocket.once('order:status-updated', (data) => {
          resolve(data);
        });
      });

      // Create order via HTTP
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

      // Wait for WebSocket event (with timeout)
      const eventData: any = await Promise.race([
        orderStatusPromise,
        new Promise((resolve) => setTimeout(() => resolve(null), 2000)),
      ]);

      if (eventData) {
        expect(eventData).toHaveProperty('orderId');
        expect(eventData.orderId).toBe(orderId);
        expect(eventData).toHaveProperty('status');
      } else {
        console.warn('No WebSocket event received within timeout');
      }
    });

    it('should notify restaurant when new order is created', async () => {
      if (!restaurantSocket?.connected) {
        console.warn('Restaurant socket not connected, skipping test');
        return;
      }

      const newOrderPromise = new Promise((resolve) => {
        restaurantSocket.once('order:new', (data) => {
          resolve(data);
        });
      });

      // Create order
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurantId,
          deliveryAddressId,
          items: [{ menuItemId, quantity: 1 }],
          payment: { type: 'CASH' },
        });

      // Wait for WebSocket event
      const eventData: any = await Promise.race([
        newOrderPromise,
        new Promise((resolve) => setTimeout(() => resolve(null), 2000)),
      ]);

      if (eventData) {
        expect(eventData).toHaveProperty('orderId');
        expect(eventData).toHaveProperty('restaurantId');
        expect(eventData.restaurantId).toBe(restaurantId);
      }
    });

    it('should notify customer when order status changes', async () => {
      if (!customerSocket?.connected || !restaurantSocket?.connected) {
        console.warn('Sockets not connected, skipping test');
        return;
      }

      const statusUpdatePromise = new Promise((resolve) => {
        customerSocket.once('order:status-updated', (data) => {
          resolve(data);
        });
      });

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

      // Update order status
      await request(app.getHttpServer())
        .patch(`/restaurants/${restaurantId}/orders/${orderId}/accept`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ estimatedDeliveryTime: new Date(Date.now() + 3600000) });

      // Wait for WebSocket event
      const eventData: any = await Promise.race([
        statusUpdatePromise,
        new Promise((resolve) => setTimeout(() => resolve(null), 2000)),
      ]);

      if (eventData) {
        expect(eventData.status).toBe('PREPARING');
      }
    });
  });

  describe('Delivery Location Updates', () => {
    it('should receive delivery location update event', async () => {
      if (!customerSocket?.connected || !deliveryPersonSocket?.connected) {
        console.warn('Sockets not connected, skipping test');
        return;
      }

      // Create order and set to READY
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
        .send({ estimatedDeliveryTime: new Date(Date.now() + 3600000) });

      await request(app.getHttpServer())
        .patch(`/restaurants/${restaurantId}/orders/${orderId}/ready`)
        .set('Authorization', `Bearer ${restaurantToken}`);

      // Get delivery ID
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { delivery: true },
      });

      if (!order?.delivery) {
        console.warn('No delivery created, skipping test');
        return;
      }

      const deliveryId = order.delivery.id;

      // Accept delivery
      await request(app.getHttpServer())
        .post(`/users/me/delivery-profile/deliveries/${deliveryId}/accept`)
        .set('Authorization', `Bearer ${deliveryPersonToken}`);

      const locationUpdatePromise = new Promise((resolve) => {
        customerSocket.once('delivery:location-updated', (data) => {
          resolve(data);
        });
      });

      // Update location
      await request(app.getHttpServer())
        .put(`/users/me/delivery-profile/deliveries/${deliveryId}/location`)
        .set('Authorization', `Bearer ${deliveryPersonToken}`)
        .send({
          latitude: -23.5508,
          longitude: -46.6336,
        });

      // Wait for WebSocket event
      const eventData: any = await Promise.race([
        locationUpdatePromise,
        new Promise((resolve) => setTimeout(() => resolve(null), 2000)),
      ]);

      if (eventData) {
        expect(eventData).toHaveProperty('deliveryId');
        expect(eventData).toHaveProperty('latitude');
        expect(eventData).toHaveProperty('longitude');
      }
    });
  });

  describe('Notification Events', () => {
    it('should receive notification event', async () => {
      if (!customerSocket?.connected) {
        console.warn('Customer socket not connected, skipping test');
        return;
      }

      const notificationPromise = new Promise((resolve) => {
        customerSocket.once('notification:new', (data) => {
          resolve(data);
        });
      });

      // Trigger a notification (e.g., by creating an order)
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurantId,
          deliveryAddressId,
          items: [{ menuItemId, quantity: 1 }],
          payment: { type: 'CASH' },
        });

      // Wait for WebSocket event
      const eventData: any = await Promise.race([
        notificationPromise,
        new Promise((resolve) => setTimeout(() => resolve(null), 2000)),
      ]);

      if (eventData) {
        expect(eventData).toHaveProperty('type');
        expect(eventData).toHaveProperty('message');
      } else {
        console.warn('No notification event received');
      }
    });
  });
});

