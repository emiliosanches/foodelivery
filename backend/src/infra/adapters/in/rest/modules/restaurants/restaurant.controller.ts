import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { RestaurantServicePort } from '@/application/ports/in/services/restaurant.service.port';
import { CreateRestaurantDto } from '@/application/dtos/restaurant/create-restaurant.dto';
import { UpdateRestaurantDto } from '@/application/dtos/restaurant/update-restaurant.dto';
import { JwtAuthGuard } from '@/infra/adapters/in/rest/common/guards/jwt-auth.guard';
import { Restaurant } from '@/domain/entities/restaurant.entity';

@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantServicePort) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: any,
    @Body() createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    return this.restaurantService.create(req.user.id, createRestaurantDto);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.restaurantService.findAll(page, limit);
  }

  @Get('search/city/:city')
  async findByCity(
    @Param('city') city: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.restaurantService.findByCity(city, page, limit);
  }

  @Get('my-restaurant')
  @UseGuards(JwtAuthGuard)
  async getMyRestaurant(@Request() req: any): Promise<Restaurant | null> {
    return this.restaurantService.findByUserId(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Restaurant | null> {
    return this.restaurantService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    return this.restaurantService.update(id, updateRestaurantDto);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard)
  async toggleActive(@Param('id') id: string): Promise<Restaurant> {
    return this.restaurantService.toggleActive(id);
  }
}
