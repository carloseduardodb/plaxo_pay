import { Injectable } from '@nestjs/common';
import { PaymentGateway } from '@/domain/gateways/payment-gateway.interface';
import { PaymentRequest, PaymentResponse, SubscriptionRequest, SubscriptionResponse } from '@/domain/gateways/payment-gateway.interface';

@Injectable()
export class MockPaymentGateway implements PaymentGateway {
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return {
      externalId: 'mock-payment-' + Date.now(),
      status: 'approved',
      paymentUrl: 'https://mock-payment-url.com',
      qrCode: request.method === 'pix' ? 'mock-qr-code' : undefined,
    };
  }

  async getPaymentStatus(externalId: string): Promise<string> {
    return 'approved';
  }

  async cancelPayment(externalId: string): Promise<boolean> {
    return true;
  }

  async createSubscription(request: SubscriptionRequest): Promise<SubscriptionResponse> {
    return {
      externalId: 'mock-subscription-' + Date.now(),
      status: 'active',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    };
  }

  async cancelSubscription(externalId: string): Promise<boolean> {
    return true;
  }
}