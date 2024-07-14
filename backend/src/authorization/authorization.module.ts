import { Module } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { AuthorizationController } from './authorization.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from 'src/strategy/local-strategy';
import { JwtStrategy } from 'src/strategy/jwt-stategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'jwt_secret',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthorizationService, LocalStrategy, JwtStrategy],
  exports: [AuthorizationService],
  controllers: [AuthorizationController],
})
export class AuthorizationModule {}
