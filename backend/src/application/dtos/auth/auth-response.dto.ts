import { User } from '@/domain/entities/user.entity';
import { UserResponseDto } from '../user/user-response.dto';

export class AuthResponseDto {
  token: string;
  user: UserResponseDto;

  constructor(token: string, user: User) {
    this.token = token;
    this.user = new UserResponseDto(user);
  }
}
