import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreatePaymentUseCase } from '@/application/use-cases/create-payment.use-case';
import { PaymentRepository } from '@/domain/repositories/payment.repository';
import { PaymentGateway } from '@/domain/gateways/payment-gateway.interface';
import { PaymentMethod } from '@/domain/entities/payment.entity';

describe('CreatePaymentUseCase', () => {
  let useCase: CreatePaymentUseCase;
  let repository: jest.Mocked<PaymentRepository>;
  let gateway: jest.Mocked<PaymentGateway>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByExternalId: jest.fn(),
      findByApplicationId: jest.fn(),
      findBySubscriptionId: jest.fn(),
      update: jest.fn(),
    };

    const mockGateway = {
      createPayment: jest.fn(),
      getPaymentStatus: jest.fn(),
      cancelPayment: jest.fn(),
      createSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
    };

    const mockEventEmitter = {
      emitAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePaymentUseCase,
        {
          provide: 'PaymentRepository',
          useValue: mockRepository,
        },
        {
          provide: 'PaymentGateway',
          useValue: mockGateway,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    useCase = module.get<CreatePaymentUseCase>(CreatePaymentUseCase);
    repository = module.get('PaymentRepository');
    gateway = module.get('PaymentGateway');
    eventEmitter = module.get(EventEmitter2);
  });

  describe('execute', () => {
    it('should create payment successfully', async () => {
      const command = {
        applicationId: 'app-id',
        amount: 100,
        currency: 'BRL',
        method: PaymentMethod.PIX,
        description: 'Test payment',
      };

      const gatewayResponse = {
        externalId: 'external-id',
        status: 'pending',
        qrCode: 'qr-code-data',
      };

      gateway.createPayment.mockResolvedValue(gatewayResponse);
      repository.save.mockImplementation(async (payment) => payment);
      eventEmitter.emitAsync.mockResolvedValue([]);

      const result = await useCase.execute(command);

      expect(result.applicationId).toBe(command.applicationId);
      expect(result.amount.amount).toBe(command.amount);
      expect(result.method).toBe(command.method);
      expect(gateway.createPayment).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith('payment.created', expect.any(Object));
    });

    it('should handle gateway errors', async () => {
      const command = {
        applicationId: 'app-id',
        amount: 100,
        currency: 'BRL',
        method: PaymentMethod.PIX,
      };

      gateway.createPayment.mockRejectedValue(new Error('Gateway error'));

      await expect(useCase.execute(command)).rejects.toThrow('Gateway error');
    });
  });
});