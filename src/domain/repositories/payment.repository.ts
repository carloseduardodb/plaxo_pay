import { Payment, PaymentStatus } from '../entities/payment.entity';

export interface PaymentRepository {
  save(payment: Payment): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByExternalId(externalId: string): Promise<Payment | null>;
  findByApplicationId(applicationId: string, status?: PaymentStatus): Promise<Payment[]>;
  findBySubscriptionId(subscriptionId: string): Promise<Payment[]>;
  update(payment: Payment): Promise<Payment>;
}