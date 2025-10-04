import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { SubscriptionRepository } from '@/domain/repositories/subscription.repository';
import { Subscription, SubscriptionStatus } from '@/domain/entities/subscription.entity';
import { SubscriptionEntity } from '../entities/subscription.entity';
import { Money } from '@/domain/value-objects/money.vo';

@Injectable()
export class SubscriptionRepositoryImpl implements SubscriptionRepository {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly repository: Repository<SubscriptionEntity>
  ) {}

  async save(subscription: Subscription): Promise<Subscription> {
    const entity = this.toEntity(subscription);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Subscription | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByApplicationId(applicationId: string, status?: SubscriptionStatus): Promise<Subscription[]> {
    const where: any = { applicationId };
    if (status) where.status = status;
    
    const entities = await this.repository.find({ where });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByCustomerId(customerId: string): Promise<Subscription[]> {
    const entities = await this.repository.find({ where: { customerId } });
    return entities.map(entity => this.toDomain(entity));
  }

  async findDueForRenewal(date: Date): Promise<Subscription[]> {
    const entities = await this.repository.find({
      where: {
        nextBillingDate: LessThanOrEqual(date),
        status: SubscriptionStatus.ACTIVE
      }
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async update(subscription: Subscription): Promise<Subscription> {
    const entity = this.toEntity(subscription);
    const updated = await this.repository.save(entity);
    return this.toDomain(updated);
  }

  private toDomain(entity: SubscriptionEntity): Subscription {
    return new Subscription(
      entity.id,
      entity.applicationId,
      entity.planName,
      new Money(entity.amount, entity.currency),
      entity.billingCycle,
      entity.status,
      entity.startDate,
      entity.nextBillingDate,
      entity.customerId,
      entity.metadata,
      entity.createdAt,
      entity.updatedAt
    );
  }

  private toEntity(subscription: Subscription): SubscriptionEntity {
    const entity = new SubscriptionEntity();
    entity.id = subscription.id;
    entity.applicationId = subscription.applicationId;
    entity.planName = subscription.planName;
    entity.amount = subscription.amount.amount;
    entity.currency = subscription.amount.currency;
    entity.billingCycle = subscription.billingCycle;
    entity.status = subscription.status;
    entity.startDate = subscription.startDate;
    entity.nextBillingDate = subscription.nextBillingDate;
    entity.customerId = subscription.customerId;
    entity.metadata = subscription.metadata;
    entity.createdAt = subscription.createdAt;
    entity.updatedAt = subscription.updatedAt;
    return entity;
  }
}