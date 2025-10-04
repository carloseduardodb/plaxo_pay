import { BaseEntity } from './base.entity';
import { Money } from '../value-objects/money.vo';

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  PIX = 'pix',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer'
}

export class Payment extends BaseEntity {
  constructor(
    id: string,
    public readonly applicationId: string,
    public readonly externalId: string,
    public readonly amount: Money,
    public readonly method: PaymentMethod,
    public readonly status: PaymentStatus = PaymentStatus.PENDING,
    public readonly description?: string,
    public readonly metadata?: Record<string, any>,
    public readonly subscriptionId?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  approve(): Payment {
    return new Payment(
      this.id,
      this.applicationId,
      this.externalId,
      this.amount,
      this.method,
      PaymentStatus.APPROVED,
      this.description,
      this.metadata,
      this.subscriptionId,
      this.createdAt,
      new Date()
    );
  }

  reject(): Payment {
    return new Payment(
      this.id,
      this.applicationId,
      this.externalId,
      this.amount,
      this.method,
      PaymentStatus.REJECTED,
      this.description,
      this.metadata,
      this.subscriptionId,
      this.createdAt,
      new Date()
    );
  }

  cancel(): Payment {
    if (this.status !== PaymentStatus.PENDING) {
      throw new Error('Only pending payments can be cancelled');
    }
    return new Payment(
      this.id,
      this.applicationId,
      this.externalId,
      this.amount,
      this.method,
      PaymentStatus.CANCELLED,
      this.description,
      this.metadata,
      this.subscriptionId,
      this.createdAt,
      new Date()
    );
  }
}