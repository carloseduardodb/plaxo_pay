import { EventService, PaymentEvent, SubscriptionEvent } from '@/infrastructure/events/event.service';

// Mock Redis
const mockRedis = {
  publish: jest.fn(),
  on: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('ioredis', () => {
  return {
    __esModule: true,
    default: jest.fn(() => mockRedis),
  };
});

describe('EventService', () => {
  let service: EventService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EventService();
  });

  describe('publishPaymentEvent', () => {
    it('should publish payment event to correct channel', async () => {
      const event: PaymentEvent = {
        type: 'payment.approved',
        paymentId: 'payment-123',
        applicationId: 'app-456',
        customerId: 'customer-789',
        amount: 100.50,
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      await service.publishPaymentEvent(event);

      expect(mockRedis.publish).toHaveBeenCalledWith(
        'payments.app-456',
        JSON.stringify(event)
      );
    });

    it('should handle redis errors gracefully', async () => {
      const event: PaymentEvent = {
        type: 'payment.rejected',
        paymentId: 'payment-123',
        applicationId: 'app-456',
        customerId: 'customer-789',
        amount: 100.50,
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      mockRedis.publish.mockRejectedValue(new Error('Redis connection failed'));

      await expect(service.publishPaymentEvent(event)).resolves.not.toThrow();
    });
  });

  describe('publishSubscriptionEvent', () => {
    it('should publish subscription event to correct channel', async () => {
      const event: SubscriptionEvent = {
        type: 'subscription.created',
        subscriptionId: 'sub-123',
        applicationId: 'app-456',
        customerId: 'customer-789',
        amount: 29.90,
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      await service.publishSubscriptionEvent(event);

      expect(mockRedis.publish).toHaveBeenCalledWith(
        'subscriptions.app-456',
        JSON.stringify(event)
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from redis', async () => {
      await service.onModuleDestroy();
      expect(mockRedis.disconnect).toHaveBeenCalled();
    });
  });
});