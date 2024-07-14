import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { WishesService } from 'src/wishes/wishes.service';
import { JwtGuard } from 'src/guards/jwt.guard';
import { Wish } from 'src/wishes/entities/wish.entity';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private wishesService: WishesService,
  ) {}
  @Get('me')
  async getMe(@Req() req: any) {
    return await this.usersService.findOne({
      where: {
        id: req.user.id,
      },
    });
  }

  @Get('me/wishes')
  async getOwnWishes(@Req() req): Promise<Wish[]> {
    const id = req.user.id;
    return this.wishesService.getWishesByUserId(+id);
  }

  @Get(':username')
  async getAnotherUserByName(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    return user;
  }

  @Get(':username/wishes')
  async getAnotherUserWishes(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    const wish = await this.wishesService.getWishesByUserId(user.id);
    return wish;
  }

  @Post('find')
  async findUsers(@Body() user): Promise<User[]> {
    return await this.usersService.findAll({
      where: [{ username: user.query }, { email: user.query }],
    });
  }

  @Patch('me')
  async updateProfile(@Req() req, @Body() updateUser: UpdateUserDto) {
    return await this.usersService.update(req.user.id, updateUser);
  }
}
