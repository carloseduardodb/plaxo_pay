import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from '@/application/services/subscription.service';
import { SubscriptionRepository } from '@/domain/repositories/subscription.repository';
import { Subscription, SubscriptionStatus, BillingCycle } from '@/domain/entities/subscription.entity';
import { Money } from '@/domain/value-objects/money.vo';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let repository: jest.Mocked<SubscriptionRepository>;

  const mockSubscription = new Subscription(
    'sub-id',
    'app-id',
    'Basic Plan',
    new Money(29.90, 'BRL'),
    BillingCycle.MONTHLY,
    SubscriptionStatus.ACTIVE,
    new Date(),
    new Date(),
    'customer-123'
  );

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      findByApplicationId: jest.fn(),
      findByCustomerId: jest.fn(),
      findDueForRenewal: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: 'SubscriptionRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    repository = module.get('SubscriptionRepository');
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const cancelledSubscription = mockSubscription.cancel();
      repository.findById.mockResolvedValue(mockSubscription);
      repository.update.mockResolvedValue(cancelledSubscription);

      const result = await service.cancelSubscription('sub-id');

      expect(result.status).toBe(SubscriptionStatus.CANCELLED);
      expect(repository.update).toHaveBeenCalled();
    });

    it('should throw error when subscription not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.cancelSubscription('non-existent-id')
      ).rejects.toThrow('Subscription not found');
    });
  });

  describe('getSubscriptionsDueForRenewal', () => {
    it('should return subscriptions due for renewal', async () => {
      repository.findDueForRenewal.mockResolvedValue([mockSubscription]);

      const result = await service.getSubscriptionsDueForRenewal();

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockSubscription);
    });
  });
});