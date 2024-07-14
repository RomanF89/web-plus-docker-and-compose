import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { LocalGuard } from 'src/guards/local.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { AuthorizationService } from './authorization.service';

@Controller()
export class AuthorizationController {
  constructor(
    private usersService: UsersService,
    private authService: AuthorizationService,
  ) {}

  @UseGuards(LocalGuard)
  @Post('signin')
  signin(@Req() req) {
    return this.authService.auth(req.user);
  }
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.authService.auth(user);
  }
}
