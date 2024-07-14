import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { JwtGuard } from 'src/guards/jwt.guard';
import { WishList } from './entities/wishlist.entity';

@UseGuards(JwtGuard)
@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  async findAll(): Promise<WishList[]> {
    return await this.wishlistsService.findAll({
      relations: ['items', 'owner'],
    });
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    return await this.wishlistsService.findOne({
      where: { id },
      relations: ['items', 'owner'],
    });
  }

  @Post()
  async create(@Req() req, @Body() createWishListDto: CreateWishlistDto) {
    const userId = req.user.id;
    return await this.wishlistsService.create(createWishListDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @Req() req) {
    const userId = req.user.id;
    return await this.wishlistsService.remove(id, userId);
  }
}
