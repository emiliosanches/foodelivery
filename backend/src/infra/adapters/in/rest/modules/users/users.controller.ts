import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; 
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateUserDto } from '@/application/dtos/user/user.dto'; 
import { UsersService } from '@/application/services/users.service'; 
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@/domain/entities/user.entity';
import { UserResponseDto } from '@/application/dtos/user/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateCurrentUser(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = user.id;
    const result = await this.usersService.update(userId, updateUserDto);
    
    return new UserResponseDto(result);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (!Object.keys(updateUserDto).length) {
      throw new BadRequestException('No data provided for update');
    }

    const result = await this.usersService.update(id, updateUserDto);

    return new UserResponseDto(result)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: User) {
    const userId = user.id;
    const result = await this.usersService.findById(userId);

    return new UserResponseDto(result);
  }
}
