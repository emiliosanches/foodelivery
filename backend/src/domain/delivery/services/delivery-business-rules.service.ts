import { DeliveryStatus } from '../entities/delivery.entity';

export class DeliveryBusinessRules {
  /**
   * Validates if a delivery status transition is allowed
   */
  static isValidDeliveryStatusTransition(
    currentStatus: DeliveryStatus,
    newStatus: DeliveryStatus,
  ): boolean {
    const validTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
      PENDING: ['ACCEPTED'],
      ACCEPTED: ['PICKED_UP'],
      PICKED_UP: ['DELIVERED'],
      DELIVERED: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  /**
   * Calculates distance between two points (Haversine formula)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
