import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@/auth/auth.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'AUTH_USERNAME') return 'admin';
        if (key === 'AUTH_PASSWORD_HASH') return 'hashed_password';
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('admin', 'password');

      expect(result).toEqual({ username: 'admin' });
    });

    it('should return null when username is invalid', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'AUTH_USERNAME') return 'admin';
        if (key === 'AUTH_PASSWORD_HASH') return 'hashed_password';
      });

      const result = await service.validateUser('wrong_user', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'AUTH_USERNAME') return 'admin';
        if (key === 'AUTH_PASSWORD_HASH') return 'hashed_password';
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('admin', 'wrong_password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const mockToken = 'jwt_token';
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.login({ username: 'admin' });

      expect(result).toEqual({ access_token: mockToken });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'admin',
        sub: 'admin',
      });
    });
  });
});