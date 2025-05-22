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
import { MenuItemServicePort } from '@/application/ports/in/services/menu-item.service.port';
import { CreateMenuItemDto } from '@/application/dtos/menu-item/create-menu-item.dto';
import { UpdateMenuItemDto } from '@/application/dtos/menu-item/update-menu-item.dto';
import { JwtAuthGuard } from '@/infra/adapters/in/rest/common/guards/jwt-auth.guard';
import { MenuItem } from '@/domain/entities/menu-item.entity';

@Controller()
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemServicePort) {}

  @Post('categories/:categoryId/menu-items')
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('categoryId') categoryId: string,
    @Body() createMenuItemDto: CreateMenuItemDto,
  ): Promise<MenuItem> {
    return this.menuItemService.create(categoryId, createMenuItemDto);
  }

  @Get('categories/:categoryId/menu-items')
  async findByCategory(
    @Param('categoryId') categoryId: string,
  ): Promise<MenuItem[]> {
    return this.menuItemService.findByCategoryId(categoryId);
  }

  @Get('restaurants/:restaurantId/menu-items')
  async findByRestaurant(
    @Param('restaurantId') restaurantId: string,
  ): Promise<MenuItem[]> {
    return this.menuItemService.findByRestaurantId(restaurantId);
  }

  @Get('menu-items/:id')
  async findOne(@Param('id') id: string): Promise<MenuItem | null> {
    return this.menuItemService.findById(id);
  }

  @Put('menu-items/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ): Promise<MenuItem> {
    return this.menuItemService.update(id, updateMenuItemDto);
  }

  @Delete('menu-items/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.menuItemService.delete(id);
  }

  @Patch('menu-items/:id/toggle-active')
  @UseGuards(JwtAuthGuard)
  async toggleActive(@Param('id') id: string): Promise<MenuItem> {
    return this.menuItemService.toggleActive(id);
  }

  @Patch('menu-items/:id/toggle-availability')
  @UseGuards(JwtAuthGuard)
  async toggleAvailability(@Param('id') id: string): Promise<MenuItem> {
    return this.menuItemService.toggleAvailability(id);
  }
}
