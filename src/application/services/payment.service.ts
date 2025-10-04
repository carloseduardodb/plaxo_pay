import { Injectable, Inject } from '@nestjs/common';
import { PaymentRepository } from '@/domain/repositories/payment.repository';
import { Payment, PaymentStatus } from '@/domain/entities/payment.entity';
import { EventService } from '@/infrastructure/events/event.service';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('PaymentRepository') private readonly paymentRepository: PaymentRepository,
    private readonly eventService: EventService
  ) {}

  async getPaymentById(id: string): Promise<Payment | null> {
    return this.paymentRepository.findById(id);
  }

  async getPaymentsByApplication(
    applicationId: string, 
    status?: PaymentStatus
  ): Promise<Payment[]> {
    return this.paymentRepository.findByApplicationId(applicationId, status);
  }

  async getPaymentsBySubscription(subscriptionId: string): Promise<Payment[]> {
    return this.paymentRepository.findBySubscriptionId(subscriptionId);
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<Payment> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    let updatedPayment: Payment;
    switch (status) {
      case PaymentStatus.APPROVED:
        updatedPayment = payment.approve();
        break;
      case PaymentStatus.REJECTED:
        updatedPayment = payment.reject();
        break;
      case PaymentStatus.CANCELLED:
        updatedPayment = payment.cancel();
        break;
      default:
        throw new Error('Invalid status transition');
    }

    const result = await this.paymentRepository.update(updatedPayment);

    // Publish event
    if (status === PaymentStatus.APPROVED) {
      await this.eventService.publishPaymentEvent({
        type: 'payment.approved',
        paymentId: result.id,
        applicationId: result.applicationId,
        customerId: result.metadata?.customerId || '',
        amount: result.amount.amount,
        subscriptionId: result.subscriptionId,
        timestamp: new Date().toISOString(),
      });
    } else if (status === PaymentStatus.REJECTED) {
      await this.eventService.publishPaymentEvent({
        type: 'payment.rejected',
        paymentId: result.id,
        applicationId: result.applicationId,
        customerId: result.metadata?.customerId || '',
        amount: result.amount.amount,
        subscriptionId: result.subscriptionId,
        timestamp: new Date().toISOString(),
      });
    }

    return result;
  }
}