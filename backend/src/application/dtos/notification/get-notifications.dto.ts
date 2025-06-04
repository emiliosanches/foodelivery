import { PaginationInputDto } from '@/shared/utils/pagination.utils';
import { IsBoolean, IsOptional } from 'class-validator';

export class GetNotificationsDto extends PaginationInputDto {
  @IsBoolean()
  @IsOptional()
  unreadOnly?: boolean = false;
}

