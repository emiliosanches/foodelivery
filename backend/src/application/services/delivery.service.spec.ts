import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { DeliveryService } from '@/application/services/delivery.service';
import { DeliveryRepositoryPort } from '@/application/ports/out/repositories/delivery.repository.port';
import { DeliveryPersonRepositoryPort } from '@/application/ports/out/repositories/delivery-person.repository.port';
import {
  createMockDeliveryRepository,
  createMockDeliveryPersonRepository,
} from '@/test/helpers/mocks';
import {
  createTestDelivery,
  createTestDeliveryPerson,
} from '@/test/helpers/factories';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let mockDeliveryRepository: ReturnType<typeof createMockDeliveryRepository>;
  let mockDeliveryPersonRepository: ReturnType<
    typeof createMockDeliveryPersonRepository
  >;

  beforeEach(async () => {
    mockDeliveryRepository = createMockDeliveryRepository();
    mockDeliveryPersonRepository = createMockDeliveryPersonRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryService,
        {
          provide: DeliveryRepositoryPort,
          useValue: mockDeliveryRepository,
        },
        {
          provide: DeliveryPersonRepositoryPort,
          useValue: mockDeliveryPersonRepository,
        },
      ],
    }).compile();

    service = module.get<DeliveryService>(DeliveryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDelivery', () => {
    it('should create a delivery for an order', async () => {
      // Arrange
      const orderId = 'order-1';

      mockDeliveryRepository.findByOrderId.mockResolvedValue(null);
      mockDeliveryRepository.create.mockImplementation((delivery) =>
        Promise.resolve(delivery),
      );

      // Act
      const result = await service.createDelivery(orderId);

      // Assert
      expect(mockDeliveryRepository.findByOrderId).toHaveBeenCalledWith(
        orderId,
      );
      expect(mockDeliveryRepository.create).toHaveBeenCalled();
      expect(result.orderId).toBe(orderId);
      expect(result.status).toBe('PENDING');
      expect(result.deliveryPersonId).toBeNull();
    });

    it('should throw BadRequestException if delivery already exists', async () => {
      // Arrange
      const orderId = 'order-1';
      const existingDelivery = createTestDelivery({ orderId });

      mockDeliveryRepository.findByOrderId.mockResolvedValue(existingDelivery);

      // Act & Assert
      await expect(service.createDelivery(orderId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createDelivery(orderId)).rejects.toThrow(
        'Delivery already exists for this order',
      );
      expect(mockDeliveryRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('acceptDelivery', () => {
    it('should allow available delivery person to accept pending delivery', async () => {
      // Arrange
      const deliveryId = 'delivery-1';
      const deliveryPersonId = 'person-1';
      const delivery = createTestDelivery({
        id: deliveryId,
        status: 'PENDING',
        deliveryPersonId: null,
      });
      const deliveryPerson = createTestDeliveryPerson({
        id: deliveryPersonId,
        availability: 'AVAILABLE',
      });

      mockDeliveryRepository.findById.mockResolvedValue(delivery);
      mockDeliveryPersonRepository.findById.mockResolvedValue(deliveryPerson);
      mockDeliveryPersonRepository.update.mockResolvedValue({
        ...deliveryPerson,
        availability: 'BUSY',
      });
      mockDeliveryRepository.update.mockResolvedValue({
        ...delivery,
        status: 'ACCEPTED',
        deliveryPersonId,
      });

      // Act
      const result = await service.acceptDelivery(deliveryId, deliveryPersonId);

      // Assert
      expect(result.status).toBe('ACCEPTED');
      expect(result.deliveryPersonId).toBe(deliveryPersonId);
      expect(mockDeliveryPersonRepository.update).toHaveBeenCalledWith(
        deliveryPersonId,
        expect.objectContaining({
          availability: 'BUSY',
        }),
      );
    });

    it('should throw NotFoundException if delivery does not exist', async () => {
      // Arrange
      const deliveryId = 'non-existent';
      const deliveryPersonId = 'person-1';

      mockDeliveryRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.acceptDelivery(deliveryId, deliveryPersonId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.acceptDelivery(deliveryId, deliveryPersonId),
      ).rejects.toThrow('Delivery not found');
    });

    it('should throw BadRequestException if delivery is not pending', async () => {
      // Arrange
      const deliveryId = 'delivery-1';
      const deliveryPersonId = 'person-1';
      const delivery = createTestDelivery({
        id: deliveryId,
        status: 'ACCEPTED',
      });

      mockDeliveryRepository.findById.mockResolvedValue(delivery);

      // Act & Assert
      await expect(
        service.acceptDelivery(deliveryId, deliveryPersonId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.acceptDelivery(deliveryId, deliveryPersonId),
      ).rejects.toThrow('Delivery is no longer available');
    });

    it('should throw NotFoundException if delivery person does not exist', async () => {
      // Arrange
      const deliveryId = 'delivery-1';
      const deliveryPersonId = 'non-existent';
      const delivery = createTestDelivery({
        id: deliveryId,
        status: 'PENDING',
      });

      mockDeliveryRepository.findById.mockResolvedValue(delivery);
      mockDeliveryPersonRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.acceptDelivery(deliveryId, deliveryPersonId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.acceptDelivery(deliveryId, deliveryPersonId),
      ).rejects.toThrow('Delivery person not found');
    });

    it('should throw BadRequestException if delivery person is not available', async () => {
      // Arrange
      const deliveryId = 'delivery-1';
      const deliveryPersonId = 'person-1';
      const delivery = createTestDelivery({
        id: deliveryId,
        status: 'PENDING',
      });
      const deliveryPerson = createTestDeliveryPerson({
        id: deliveryPersonId,
        availability: 'BUSY',
      });

      mockDeliveryRepository.findById.mockResolvedValue(delivery);
      mockDeliveryPersonRepository.findById.mockResolvedValue(deliveryPerson);

      // Act & Assert
      await expect(
        service.acceptDelivery(deliveryId, deliveryPersonId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.acceptDelivery(deliveryId, deliveryPersonId),
      ).rejects.toThrow('Delivery person is not available');
    });
  });

  describe('updateDeliveryStatus', () => {
    it('should update delivery status to PICKED_UP', async () => {
      // Arrange
      const deliveryId = 'delivery-1';
      const deliveryPersonId = 'person-1';
      const delivery = createTestDelivery({
        id: deliveryId,
        deliveryPersonId,
        status: 'ACCEPTED',
      });

      mockDeliveryRepository.findById.mockResolvedValue(delivery);
      mockDeliveryRepository.update.mockResolvedValue({
        ...delivery,
        status: 'PICKED_UP',
        pickedUpAt: new Date(),
      });

      // Act
      const result = await service.updateDeliveryStatus(
        deliveryId,
        deliveryPersonId,
        'PICKED_UP',
      );

      // Assert
      expect(result.status).toBe('PICKED_UP');
      expect(mockDeliveryRepository.update).toHaveBeenCalledWith(
        deliveryId,
        expect.objectContaining({
          status: 'PICKED_UP',
          pickedUpAt: expect.any(Date),
        }),
      );
    });

    it('should update delivery status to DELIVERED and set person as available', async () => {
      // Arrange
      const deliveryId = 'delivery-1';
      const deliveryPersonId = 'person-1';
      const delivery = createTestDelivery({
        id: deliveryId,
        deliveryPersonId,
        status: 'PICKED_UP',
      });

      mockDeliveryRepository.findById.mockResolvedValue(delivery);
      mockDeliveryPersonRepository.update.mockResolvedValue({} as any);
      mockDeliveryRepository.update.mockResolvedValue({
        ...delivery,
        status: 'DELIVERED',
        deliveredAt: new Date(),
      });

      // Act
      const result = await service.updateDeliveryStatus(
        deliveryId,
        deliveryPersonId,
        'DELIVERED',
      );

      // Assert
      expect(result.status).toBe('DELIVERED');
      expect(mockDeliveryPersonRepository.update).toHaveBeenCalledWith(
        deliveryPersonId,
        expect.objectContaining({
          availability: 'AVAILABLE',
        }),
      );
    });

    it('should throw NotFoundException if delivery does not exist', async () => {
      // Arrange
      mockDeliveryRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateDeliveryStatus('delivery-1', 'person-1', 'PICKED_UP'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if delivery person is not assigned', async () => {
      // Arrange
      const delivery = createTestDelivery({
        id: 'delivery-1',
        deliveryPersonId: 'person-1',
        status: 'ACCEPTED',
      });

      mockDeliveryRepository.findById.mockResolvedValue(delivery);

      // Act & Assert
      await expect(
        service.updateDeliveryStatus('delivery-1', 'person-2', 'PICKED_UP'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateDeliveryStatus('delivery-1', 'person-2', 'PICKED_UP'),
      ).rejects.toThrow('You are not assigned to this delivery');
    });
  });

  describe('updateDeliveryLocation', () => {
    it('should update delivery location', async () => {
      // Arrange
      const deliveryId = 'delivery-1';
      const deliveryPersonId = 'person-1';
      const delivery = createTestDelivery({
        id: deliveryId,
        deliveryPersonId,
        status: 'PICKED_UP',
      });
      const newLatitude = -23.5505;
      const newLongitude = -46.6333;

      mockDeliveryRepository.findById.mockResolvedValue(delivery);
      mockDeliveryRepository.update.mockResolvedValue({
        ...delivery,
        currentLatitude: newLatitude,
        currentLongitude: newLongitude,
      });

      // Act
      const result = await service.updateDeliveryLocation(
        deliveryId,
        deliveryPersonId,
        newLatitude,
        newLongitude,
      );

      // Assert
      expect(result.currentLatitude).toBe(newLatitude);
      expect(result.currentLongitude).toBe(newLongitude);
      expect(mockDeliveryRepository.update).toHaveBeenCalledWith(
        deliveryId,
        expect.objectContaining({
          currentLatitude: newLatitude,
          currentLongitude: newLongitude,
        }),
      );
    });

    it('should throw ForbiddenException if delivery person is not assigned', async () => {
      // Arrange
      const delivery = createTestDelivery({
        id: 'delivery-1',
        deliveryPersonId: 'person-1',
        status: 'PICKED_UP',
      });

      mockDeliveryRepository.findById.mockResolvedValue(delivery);

      // Act & Assert
      await expect(
        service.updateDeliveryLocation(
          'delivery-1',
          'person-2',
          -23.5505,
          -46.6333,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if delivery status is PENDING or DELIVERED', async () => {
      // Arrange
      const deliveryId = 'delivery-1';
      const deliveryPersonId = 'person-1';
      const delivery = createTestDelivery({
        id: deliveryId,
        deliveryPersonId,
        status: 'DELIVERED',
      });

      mockDeliveryRepository.findById.mockResolvedValue(delivery);

      // Act & Assert
      await expect(
        service.updateDeliveryLocation(
          deliveryId,
          deliveryPersonId,
          -23.5505,
          -46.6333,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Edge Cases and Validations', () => {
    describe('coordinate validation', () => {
      it('should handle valid latitude boundaries (-90 to 90)', async () => {
        // Arrange
        const deliveryId = 'delivery-1';
        const deliveryPersonId = 'person-1';
        const delivery = createTestDelivery({
          id: deliveryId,
          deliveryPersonId,
          status: 'PICKED_UP',
        });

        mockDeliveryRepository.findById.mockResolvedValue(delivery);
        mockDeliveryRepository.update.mockResolvedValue({
          ...delivery,
          currentLatitude: 90.0,
          currentLongitude: 0.0,
        });

        // Act
        const result = await service.updateDeliveryLocation(
          deliveryId,
          deliveryPersonId,
          90.0, // Maximum valid latitude
          0.0,
        );

        // Assert
        expect(result.currentLatitude).toBe(90.0);
        expect(mockDeliveryRepository.update).toHaveBeenCalled();
      });

      it('should handle valid longitude boundaries (-180 to 180)', async () => {
        // Arrange
        const deliveryId = 'delivery-1';
        const deliveryPersonId = 'person-1';
        const delivery = createTestDelivery({
          id: deliveryId,
          deliveryPersonId,
          status: 'PICKED_UP',
        });

        mockDeliveryRepository.findById.mockResolvedValue(delivery);
        mockDeliveryRepository.update.mockResolvedValue({
          ...delivery,
          currentLatitude: 0.0,
          currentLongitude: -180.0,
        });

        // Act
        const result = await service.updateDeliveryLocation(
          deliveryId,
          deliveryPersonId,
          0.0,
          -180.0, // Minimum valid longitude
        );

        // Assert
        expect(result.currentLongitude).toBe(-180.0);
        expect(mockDeliveryRepository.update).toHaveBeenCalled();
      });

      it('should handle coordinates at equator and prime meridian', async () => {
        // Arrange
        const deliveryId = 'delivery-1';
        const deliveryPersonId = 'person-1';
        const delivery = createTestDelivery({
          id: deliveryId,
          deliveryPersonId,
          status: 'PICKED_UP',
        });

        mockDeliveryRepository.findById.mockResolvedValue(delivery);
        mockDeliveryRepository.update.mockResolvedValue({
          ...delivery,
          currentLatitude: 0.0,
          currentLongitude: 0.0,
        });

        // Act
        const result = await service.updateDeliveryLocation(
          deliveryId,
          deliveryPersonId,
          0.0, // Equator
          0.0, // Prime meridian
        );

        // Assert
        expect(result.currentLatitude).toBe(0.0);
        expect(result.currentLongitude).toBe(0.0);
      });

      it('should handle high precision coordinates', async () => {
        // Arrange
        const deliveryId = 'delivery-1';
        const deliveryPersonId = 'person-1';
        const delivery = createTestDelivery({
          id: deliveryId,
          deliveryPersonId,
          status: 'PICKED_UP',
        });

        const preciseLat = -23.550520123456;
        const preciseLon = -46.633308789012;

        mockDeliveryRepository.findById.mockResolvedValue(delivery);
        mockDeliveryRepository.update.mockResolvedValue({
          ...delivery,
          currentLatitude: preciseLat,
          currentLongitude: preciseLon,
        });

        // Act
        const result = await service.updateDeliveryLocation(
          deliveryId,
          deliveryPersonId,
          preciseLat,
          preciseLon,
        );

        // Assert
        expect(result.currentLatitude).toBeCloseTo(preciseLat, 12);
        expect(result.currentLongitude).toBeCloseTo(preciseLon, 12);
      });
    });

    describe('concurrent delivery acceptance', () => {
      it('should handle race condition when multiple delivery persons try to accept same delivery', async () => {
        // Arrange
        const deliveryId = 'delivery-1';
        const deliveryPerson1Id = 'person-1';
        const deliveryPerson2Id = 'person-2';

        const delivery = createTestDelivery({
          id: deliveryId,
          deliveryPersonId: null,
          status: 'PENDING',
        });

        const deliveryPerson1 = createTestDeliveryPerson({
          id: deliveryPerson1Id,
          availability: 'AVAILABLE',
        });

        // First person checks - delivery is available
        mockDeliveryRepository.findById.mockResolvedValueOnce(delivery);
        mockDeliveryPersonRepository.findById.mockResolvedValueOnce(
          deliveryPerson1,
        );
        mockDeliveryRepository.update.mockResolvedValueOnce({
          ...delivery,
          deliveryPersonId: deliveryPerson1Id,
          status: 'PICKED_UP',
        });

        // Act - First person accepts
        await service.acceptDelivery(deliveryId, deliveryPerson1Id);

        // Second person tries to accept but delivery is already taken
        const acceptedDelivery = {
          ...delivery,
          deliveryPersonId: deliveryPerson1Id,
          status: 'ACCEPTED' as const,
        };
        mockDeliveryRepository.findById.mockResolvedValueOnce(acceptedDelivery);

        // Act & Assert - Second person should fail
        await expect(
          service.acceptDelivery(deliveryId, deliveryPerson2Id),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('delivery status transitions', () => {
      it('should handle rapid status updates', async () => {
        // Arrange
        const deliveryId = 'delivery-1';
        const deliveryPersonId = 'person-1';
        const delivery = createTestDelivery({
          id: deliveryId,
          deliveryPersonId,
          status: 'PICKED_UP',
        });

        mockDeliveryRepository.findById.mockResolvedValueOnce(delivery);
        mockDeliveryRepository.update.mockResolvedValueOnce({
          ...delivery,
          status: 'DELIVERED',
        });

        // Act - First update
        await service.updateDeliveryStatus(
          deliveryId,
          deliveryPersonId,
          'DELIVERED',
        );

        // Try to update again immediately
        mockDeliveryRepository.findById.mockResolvedValueOnce({
          ...delivery,
          status: 'DELIVERED',
        });

        // Act & Assert - Should fail as delivery is already completed
        await expect(
          service.updateDeliveryStatus(
            deliveryId,
            deliveryPersonId,
            'PICKED_UP',
          ),
        ).rejects.toThrow(BadRequestException);
      });

      it('should not allow status update from wrong delivery person', async () => {
        // Arrange
        const deliveryId = 'delivery-1';
        const correctPersonId = 'person-1';
        const wrongPersonId = 'person-2';

        const delivery = createTestDelivery({
          id: deliveryId,
          deliveryPersonId: correctPersonId,
          status: 'PICKED_UP',
        });

        mockDeliveryRepository.findById.mockResolvedValue(delivery);

        // Act & Assert
        await expect(
          service.updateDeliveryStatus(deliveryId, wrongPersonId, 'DELIVERED'),
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('location update frequency', () => {
      it('should accept multiple rapid location updates', async () => {
        // Arrange
        const deliveryId = 'delivery-1';
        const deliveryPersonId = 'person-1';
        const delivery = createTestDelivery({
          id: deliveryId,
          deliveryPersonId,
          status: 'PICKED_UP',
        });

        const locations = [
          { lat: -23.5505, lon: -46.6333 },
          { lat: -23.5506, lon: -46.6334 },
          { lat: -23.5507, lon: -46.6335 },
          { lat: -23.5508, lon: -46.6336 },
        ];

        mockDeliveryRepository.findById.mockResolvedValue(delivery);

        // Act - Simulate rapid location updates
        for (const loc of locations) {
          mockDeliveryRepository.update.mockResolvedValueOnce({
            ...delivery,
            currentLatitude: loc.lat,
            currentLongitude: loc.lon,
          });

          await service.updateDeliveryLocation(
            deliveryId,
            deliveryPersonId,
            loc.lat,
            loc.lon,
          );
        }

        // Assert
        expect(mockDeliveryRepository.update).toHaveBeenCalledTimes(
          locations.length,
        );
      });
    });

    describe('delivery creation edge cases', () => {
      it('should create delivery with minimum required data', async () => {
        // Arrange
        const orderId = 'order-1';
        const newDelivery = createTestDelivery({
          orderId,
          deliveryPersonId: null, // No delivery person assigned yet
          status: 'PENDING',
          currentLatitude: null,
          currentLongitude: null,
        });

        mockDeliveryRepository.create.mockResolvedValue(newDelivery);

        // Act
        const result = await service.createDelivery(orderId);

        // Assert
        expect(result.orderId).toBe(orderId);
        expect(result.status).toBe('PENDING');
        expect(result.deliveryPersonId).toBeNull();
      });

      it('should handle duplicate delivery creation for same order', async () => {
        // Arrange
        const orderId = 'order-1';

        // First creation succeeds
        mockDeliveryRepository.create.mockResolvedValueOnce(
          createTestDelivery({ orderId }),
        );

        // Act - First creation
        await service.createDelivery(orderId);

        // Second creation should fail (database constraint)
        mockDeliveryRepository.create.mockRejectedValueOnce(
          new BadRequestException('Delivery already exists for this order'),
        );

        // Act & Assert - Second creation
        await expect(service.createDelivery(orderId)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('delivery person availability', () => {
      it('should not allow unavailable delivery person to accept delivery', async () => {
        // Arrange
        const deliveryId = 'delivery-1';
        const deliveryPersonId = 'person-1';

        const delivery = createTestDelivery({
          id: deliveryId,
          deliveryPersonId: null,
          status: 'PENDING',
        });

        const unavailablePerson = createTestDeliveryPerson({
          id: deliveryPersonId,
          availability: 'BUSY', // Not available
        });

        mockDeliveryRepository.findById.mockResolvedValue(delivery);
        mockDeliveryPersonRepository.findById.mockResolvedValue(
          unavailablePerson,
        );

        // Act & Assert
        await expect(
          service.acceptDelivery(deliveryId, deliveryPersonId),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });
});
