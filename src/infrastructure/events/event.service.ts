import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

export interface PaymentEvent {
  type: 'payment.created' | 'payment.approved' | 'payment.rejected';
  paymentId: string;
  applicationId: string;
  customerId: string;
  amount: number;
  subscriptionId?: string;
  timestamp: string;
}

export interface SubscriptionEvent {
  type: 'subscription.created' | 'subscription.cancelled' | 'subscription.renewal.due';
  subscriptionId: string;
  applicationId: string;
  customerId: string;
  amount: number;
  timestamp: string;
}

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.KEYDB_HOST || 'localhost',
      port: parseInt(process.env.KEYDB_PORT || '6379'),
      password: process.env.KEYDB_PASSWORD || undefined,
      db: parseInt(process.env.KEYDB_DB || '0'),
      maxRetriesPerRequest: 3,
    });

    this.redis.on('connect', () => {
      this.logger.log('Connected to KeyDB');
    });

    this.redis.on('error', (error) => {
      this.logger.error('KeyDB connection error:', error);
    });
  }

  async publishPaymentEvent(event: PaymentEvent): Promise<void> {
    try {
      const channel = `payments.${event.applicationId}`;
      await this.redis.publish(channel, JSON.stringify(event));
      this.logger.log(`Published event ${event.type} to ${channel}`);
    } catch (error) {
      this.logger.error('Failed to publish payment event:', error);
    }
  }

  async publishSubscriptionEvent(event: SubscriptionEvent): Promise<void> {
    try {
      const channel = `subscriptions.${event.applicationId}`;
      await this.redis.publish(channel, JSON.stringify(event));
      this.logger.log(`Published event ${event.type} to ${channel}`);
    } catch (error) {
      this.logger.error('Failed to publish subscription event:', error);
    }
  }

  async onModuleDestroy() {
    await this.redis.disconnect();
  }
}