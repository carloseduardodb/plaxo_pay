import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Payment, PaymentMethod } from '@/domain/entities/payment.entity';
import { Money } from '@/domain/value-objects/money.vo';
import { PaymentRepository } from '@/domain/repositories/payment.repository';
import { PaymentGateway, PaymentRequest } from '@/domain/gateways/payment-gateway.interface';
import { PaymentCreatedEvent } from '@/domain/events/payment.events';
import { v4 as uuid } from 'uuid';

export interface CreatePaymentCommand {
  applicationId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  description?: string;
  customerId?: string;
  subscriptionId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject('PaymentRepository') private readonly paymentRepository: PaymentRepository,
    @Inject('PaymentGateway') private readonly paymentGateway: PaymentGateway,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(command: CreatePaymentCommand): Promise<Payment> {
    const money = new Money(command.amount, command.currency);
    
    const gatewayRequest: PaymentRequest = {
      amount: money,
      method: command.method,
      description: command.description,
      customerId: command.customerId,
      metadata: command.metadata
    };

    const gatewayResponse = await this.paymentGateway.createPayment(gatewayRequest);

    const payment = new Payment(
      uuid(),
      command.applicationId,
      gatewayResponse.externalId,
      money,
      command.method,
      undefined,
      command.description,
      {
        ...command.metadata,
        paymentUrl: gatewayResponse.paymentUrl,
        qrCode: gatewayResponse.qrCode,
        pixKey: gatewayResponse.pixKey
      },
      command.subscriptionId
    );

    const savedPayment = await this.paymentRepository.save(payment);

    await this.eventEmitter.emitAsync('payment.created', 
      new PaymentCreatedEvent(
        savedPayment.id,
        savedPayment.applicationId,
        savedPayment.amount.amount,
        savedPayment.amount.currency,
        savedPayment.method
      )
    );

    return savedPayment;
  }
}