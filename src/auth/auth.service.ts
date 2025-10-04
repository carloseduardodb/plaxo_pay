import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const envUsername = this.configService.get<string>('AUTH_USERNAME');
    const envPasswordHash = this.configService.get<string>('AUTH_PASSWORD_HASH');

    if (username === envUsername && await bcrypt.compare(password, envPasswordHash)) {
      return { username };
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}