import { NotificationType } from "@/domain/notification";

export class CreateNotificationDto {
  userId: string;
  orderId?: string;
  type: NotificationType;
  title?: string;
  message?: string;
  metadata?: string;
}