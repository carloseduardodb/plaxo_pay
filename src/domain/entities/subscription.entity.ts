import { BaseEntity } from './base.entity';
import { Money } from '../value-objects/money.vo';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired'
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export class Subscription extends BaseEntity {
  constructor(
    id: string,
    public readonly applicationId: string,
    public readonly planName: string,
    public readonly amount: Money,
    public readonly billingCycle: BillingCycle,
    public readonly status: SubscriptionStatus = SubscriptionStatus.ACTIVE,
    public readonly startDate: Date,
    public readonly nextBillingDate: Date,
    public readonly customerId: string,
    public readonly metadata?: Record<string, any>,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  cancel(): Subscription {
    return new Subscription(
      this.id,
      this.applicationId,
      this.planName,
      this.amount,
      this.billingCycle,
      SubscriptionStatus.CANCELLED,
      this.startDate,
      this.nextBillingDate,
      this.customerId,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  suspend(): Subscription {
    return new Subscription(
      this.id,
      this.applicationId,
      this.planName,
      this.amount,
      this.billingCycle,
      SubscriptionStatus.SUSPENDED,
      this.startDate,
      this.nextBillingDate,
      this.customerId,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  calculateNextBillingDate(): Date {
    const current = new Date(this.nextBillingDate);
    switch (this.billingCycle) {
      case BillingCycle.MONTHLY:
        current.setMonth(current.getMonth() + 1);
        break;
      case BillingCycle.QUARTERLY:
        current.setMonth(current.getMonth() + 3);
        break;
      case BillingCycle.YEARLY:
        current.setFullYear(current.getFullYear() + 1);
        break;
    }
    return current;
  }
}