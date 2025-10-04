import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { PaymentGateway, PaymentRequest, PaymentResponse, SubscriptionRequest, SubscriptionResponse } from '@/domain/gateways/payment-gateway.interface';
import { PaymentMethod } from '@/domain/entities/payment.entity';

@Injectable()
export class MercadoPagoGateway implements PaymentGateway {
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.client = axios.create({
      baseURL: 'https://api.mercadopago.com',
      headers: {
        'Authorization': `Bearer ${this.configService.get('MERCADO_PAGO_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const payload = this.buildPaymentPayload(request);
    
    try {
      const response = await this.client.post('/v1/payments', payload);
      
      return {
        externalId: response.data.id.toString(),
        status: this.mapStatus(response.data.status),
        paymentUrl: response.data.point_of_interaction?.transaction_data?.ticket_url,
        qrCode: response.data.point_of_interaction?.transaction_data?.qr_code,
        pixKey: response.data.point_of_interaction?.transaction_data?.qr_code_base64
      };
    } catch (error) {
      throw new Error(`MercadoPago payment creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPaymentStatus(externalId: string): Promise<string> {
    try {
      const response = await this.client.get(`/v1/payments/${externalId}`);
      return this.mapStatus(response.data.status);
    } catch (error) {
      throw new Error(`Failed to get payment status: ${error.response?.data?.message || error.message}`);
    }
  }

  async cancelPayment(externalId: string): Promise<boolean> {
    try {
      await this.client.put(`/v1/payments/${externalId}`, { status: 'cancelled' });
      return true;
    } catch (error) {
      return false;
    }
  }

  async createSubscription(request: SubscriptionRequest): Promise<SubscriptionResponse> {
    const payload = {
      reason: request.planName,
      auto_recurring: {
        frequency: 1,
        frequency_type: this.mapBillingCycle(request.billingCycle),
        transaction_amount: request.amount.amount,
        currency_id: request.amount.currency
      },
      payer_email: `customer-${request.customerId}@example.com`,
      back_url: 'https://your-app.com/subscription/callback'
    };

    try {
      const response = await this.client.post('/preapproval', payload);
      
      return {
        externalId: response.data.id,
        status: this.mapStatus(response.data.status),
        nextBillingDate: new Date(response.data.next_payment_date)
      };
    } catch (error) {
      throw new Error(`MercadoPago subscription creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async cancelSubscription(externalId: string): Promise<boolean> {
    try {
      await this.client.put(`/preapproval/${externalId}`, { status: 'cancelled' });
      return true;
    } catch (error) {
      return false;
    }
  }

  private buildPaymentPayload(request: PaymentRequest): any {
    const basePayload = {
      transaction_amount: request.amount.amount,
      description: request.description || 'Payment',
      payment_method_id: this.mapPaymentMethod(request.method),
      payer: {
        email: `customer-${request.customerId || 'anonymous'}@example.com`
      },
      metadata: request.metadata || {}
    };

    if (request.method === PaymentMethod.PIX) {
      return {
        ...basePayload,
        payment_method_id: 'pix'
      };
    }

    return basePayload;
  }

  private mapPaymentMethod(method: PaymentMethod): string {
    const mapping = {
      [PaymentMethod.PIX]: 'pix',
      [PaymentMethod.CREDIT_CARD]: 'visa',
      [PaymentMethod.DEBIT_CARD]: 'debvisa',
      [PaymentMethod.BANK_TRANSFER]: 'account_money'
    };
    return mapping[method] || 'pix';
  }

  private mapBillingCycle(cycle: string): string {
    const mapping = {
      'monthly': 'months',
      'quarterly': 'months',
      'yearly': 'years'
    };
    return mapping[cycle] || 'months';
  }

  private mapStatus(mpStatus: string): string {
    const mapping = {
      'pending': 'pending',
      'approved': 'approved',
      'authorized': 'approved',
      'in_process': 'pending',
      'in_mediation': 'pending',
      'rejected': 'rejected',
      'cancelled': 'cancelled',
      'refunded': 'refunded',
      'charged_back': 'refunded'
    };
    return mapping[mpStatus] || 'pending';
  }
}