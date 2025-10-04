import { Money } from '../value-objects/money.vo';
import { PaymentMethod } from '../entities/payment.entity';

export interface PaymentRequest {
  amount: Money;
  method: PaymentMethod;
  description?: string;
  customerId?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  externalId: string;
  status: string;
  paymentUrl?: string;
  qrCode?: string;
  pixKey?: string;
}

export interface PaymentGateway {
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  getPaymentStatus(externalId: string): Promise<string>;
  cancelPayment(externalId: string): Promise<boolean>;
  createSubscription(request: SubscriptionRequest): Promise<SubscriptionResponse>;
  cancelSubscription(externalId: string): Promise<boolean>;
}

export interface SubscriptionRequest {
  amount: Money;
  customerId: string;
  planName: string;
  billingCycle: string;
  description?: string;
}

export interface SubscriptionResponse {
  externalId: string;
  status: string;
  nextBillingDate: Date;
}