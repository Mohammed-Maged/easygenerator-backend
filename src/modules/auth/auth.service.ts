import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { hashPassword } from '../../common/utils/hash-password.util';
import { AUTH_SESSION_PREFIX } from './auth.constants';
import { mapToUserResponse } from '../users/utils/map-user-response.util';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await hashPassword(dto.password);
    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
    } as CreateUserDto);
    const userResponse = mapToUserResponse(user);
    const tokens = await this.generateTokens(user._id.toString());

    return { user: userResponse, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const userResponse = mapToUserResponse(user);
    const tokens = await this.generateTokens(user._id.toString());

    return { user: userResponse, ...tokens };
  }

  async logout(userId: string): Promise<{ message: string }> {
    const key = `${AUTH_SESSION_PREFIX}${userId}`;
    await this.cacheManager.del(key);
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessSessionId = uuidv4();
    const refreshSessionId = uuidv4();

    const accessPayload = { sub: userId, accessSessionId };
    const refreshPayload = { sub: userId, refreshSessionId };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const key = `${AUTH_SESSION_PREFIX}${userId}`;
    await this.cacheManager.set(
      key,
      `${accessSessionId}:${refreshSessionId}`,
      604800,
    );

    return { accessToken, refreshToken };
  }

  async refreshToken(refresh_token: string) {
    try {
      const payload = this.jwtService.verify(refresh_token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      await this.validateSession(
        payload.refreshSessionId,
        payload.sub,
        'refresh',
      );

      const newTokens = await this.generateTokens(payload.sub);
      return newTokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateSession(
    sessionId: string,
    userId: string,
    type: 'access' | 'refresh' = 'access',
  ): Promise<void> {
    const key = `${AUTH_SESSION_PREFIX}${userId}`;
    const session = await this.cacheManager.get<string>(key);

    const [accessSessionId, refreshSessionId] = session?.split(':') ?? [];

    const expected = type === 'access' ? accessSessionId : refreshSessionId;

    if (!expected || expected !== sessionId) {
      throw new UnauthorizedException('Session invalid or expired');
    }
  }
}
