import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthorizationService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async findOne(id: number) {
    const user = await this.usersService.findOne({ where: { id: id } });

    return user;
  }

  auth(user: User) {
    const payload = { sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    const isMatched = await bcrypt.compare(password, user.password);
    if (user && isMatched) {
      delete user.password;
      return user;
    }
    return null;
  }
}
