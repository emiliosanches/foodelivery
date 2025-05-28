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
} from '@nestjs/common';
import { CategoryServicePort } from '@/application/ports/in/services/category.service.port';
import { CreateCategoryDto } from '@/application/dtos/category/create-category.dto';
import { UpdateCategoryDto } from '@/application/dtos/category/update-category.dto';
import { JwtAuthGuard } from '@/infra/adapters/in/rest/common/guards/jwt-auth.guard';
import { Category } from '@/domain/entities/category.entity';
import { RestaurantOwnerGuard } from '../../common/guards/restaurant-owner.guard';

@Controller('restaurants/:restaurantId/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryServicePort) {}

  @Post()
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  async create(
    @Param('restaurantId') restaurantId: string,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.create(restaurantId, createCategoryDto);
  }

  @Get()
  async findByRestaurant(
    @Param('restaurantId') restaurantId: string,
  ): Promise<Category[]> {
    return this.categoryService.findByRestaurantId(restaurantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Category | null> {
    return this.categoryService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoryService.delete(id);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  async toggleStatus(@Param('id') id: string): Promise<Category> {
    return this.categoryService.toggleStatus(id);
  }
}
