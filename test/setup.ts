import { ConfigModule } from '@nestjs/config';

// Setup global test configuration
process.env.NODE_ENV = 'test';

// Mock bcrypt for faster tests
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Global test mocks will be defined in individual test files as needed