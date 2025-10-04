import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '@/application/services/payment.service';
import { PaymentRepository } from '@/domain/repositories/payment.repository';
import { Payment, PaymentStatus, PaymentMethod } from '@/domain/entities/payment.entity';
import { Money } from '@/domain/value-objects/money.vo';

describe('PaymentService', () => {
  let service: PaymentService;
  let repository: jest.Mocked<PaymentRepository>;

  const mockPayment = new Payment(
    'payment-id',
    'app-id',
    'external-id',
    new Money(100, 'BRL'),
    PaymentMethod.PIX,
    PaymentStatus.PENDING,
    'Test payment'
  );

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      findByApplicationId: jest.fn(),
      findBySubscriptionId: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      findByExternalId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: 'PaymentRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    repository = module.get('PaymentRepository');
  });

  describe('getPaymentById', () => {
    it('should return payment when found', async () => {
      repository.findById.mockResolvedValue(mockPayment);

      const result = await service.getPaymentById('payment-id');

      expect(result).toBe(mockPayment);
      expect(repository.findById).toHaveBeenCalledWith('payment-id');
    });

    it('should return null when payment not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.getPaymentById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updatePaymentStatus', () => {
    it('should approve payment successfully', async () => {
      const approvedPayment = mockPayment.approve();
      repository.findById.mockResolvedValue(mockPayment);
      repository.update.mockResolvedValue(approvedPayment);

      const result = await service.updatePaymentStatus('payment-id', PaymentStatus.APPROVED);

      expect(result.status).toBe(PaymentStatus.APPROVED);
      expect(repository.update).toHaveBeenCalled();
    });

    it('should throw error when payment not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updatePaymentStatus('non-existent-id', PaymentStatus.APPROVED)
      ).rejects.toThrow('Payment not found');
    });
  });
});