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
import { PaymentMethodServicePort } from '@/application/ports/in/services/payment-method.service.port';
import { CreatePaymentMethodDto } from '@/application/dtos/payment-method/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '@/application/dtos/payment-method/update-payment-method.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@/domain/entities/user.entity';

@Controller('payment-methods')
@UseGuards(JwtAuthGuard)
export class PaymentMethodController {
  constructor(
    private readonly paymentMethodService: PaymentMethodServicePort,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
  ) {
    return this.paymentMethodService.create(user.id, createPaymentMethodDto);
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.paymentMethodService.findAllByUser(user.id);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.paymentMethodService.findById(user.id, id);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodService.update(
      user.id,
      id,
      updatePaymentMethodDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    await this.paymentMethodService.delete(user.id, id);
  }

  @Patch(':id/set-default')
  async setAsDefault(@CurrentUser() user: User, @Param('id') id: string) {
    return this.paymentMethodService.setAsDefault(user.id, id);
  }
}
