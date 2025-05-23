import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/infra/adapters/in/rest/common/guards/jwt-auth.guard';
import { AddressServicePort } from '@/application/ports/in/services/address.service.port';
import { CreateAddressDto } from '@/application/dtos/address/create-address.dto';
import { UpdateAddressDto } from '@/application/dtos/address/update-address.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@/domain/entities/user.entity';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressServicePort) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(user.id, createAddressDto);
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.addressService.findAllByUser(user.id);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.addressService.findById(user.id, id);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressService.update(user.id, id, updateAddressDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    await this.addressService.delete(user.id, id);
  }

  @Patch(':id/set-default')
  async setAsDefault(@CurrentUser() user: User, @Param('id') id: string) {
    return this.addressService.setAsDefault(user.id, id);
  }
}
