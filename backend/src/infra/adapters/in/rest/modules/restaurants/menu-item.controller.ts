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
import { RestaurantOwnerGuard } from '../../common/guards/restaurant-owner.guard';

@Controller()
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemServicePort) {}

  @Post('/restaurants/:restaurantId/menu-items')
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  async create(
    @Param('restaurantId') restaurantId: string,
    @Body() createMenuItemDto: CreateMenuItemDto,
  ): Promise<MenuItem> {
    return this.menuItemService.create(restaurantId, createMenuItemDto);
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

  @Put('/restaurants/:restaurantId/menu-items/:id')
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  async update(
    @Param('id') id: string,
    @Param('restaurantId') restaurantId: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ): Promise<MenuItem> {
    return this.menuItemService.update(id, restaurantId, updateMenuItemDto);
  }

  @Delete('/restaurants/:restaurantId/menu-items/:id')
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  async remove(
    @Param('id') id: string,
    @Param('restaurantId') restaurantId: string,
  ): Promise<void> {
    return this.menuItemService.delete(id, restaurantId);
  }

  @Patch('/restaurants/:restaurantId/menu-items/:id/toggle-active')
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  async toggleActive(
    @Param('id') id: string,
    @Param('restaurantId') restaurantId: string,
  ): Promise<MenuItem> {
    return this.menuItemService.toggleActive(id, restaurantId);
  }

  @Patch('/restaurants/:restaurantId/menu-items/:id/toggle-availability')
  @UseGuards(JwtAuthGuard, RestaurantOwnerGuard)
  async toggleAvailability(
    @Param('id') id: string,
    @Param('restaurantId') restaurantId: string,
  ): Promise<MenuItem> {
    return this.menuItemService.toggleAvailability(id, restaurantId);
  }
}
