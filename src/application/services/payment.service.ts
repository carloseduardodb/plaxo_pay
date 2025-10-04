import { Injectable, Inject } from '@nestjs/common';
import { PaymentRepository } from '@/domain/repositories/payment.repository';
import { Payment, PaymentStatus } from '@/domain/entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(@Inject('PaymentRepository') private readonly paymentRepository: PaymentRepository) {}

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

    return this.paymentRepository.update(updatedPayment);
  }
}