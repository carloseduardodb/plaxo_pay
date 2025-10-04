import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentRepository } from '@/domain/repositories/payment.repository';
import { Payment, PaymentStatus } from '@/domain/entities/payment.entity';
import { PaymentEntity } from '../entities/payment.entity';
import { Money } from '@/domain/value-objects/money.vo';

@Injectable()
export class PaymentRepositoryImpl implements PaymentRepository {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly repository: Repository<PaymentEntity>
  ) {}

  async save(payment: Payment): Promise<Payment> {
    const entity = this.toEntity(payment);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Payment | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByExternalId(externalId: string): Promise<Payment | null> {
    const entity = await this.repository.findOne({ where: { externalId } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByApplicationId(applicationId: string, status?: PaymentStatus): Promise<Payment[]> {
    const where: any = { applicationId };
    if (status) where.status = status;
    
    const entities = await this.repository.find({ where });
    return entities.map(entity => this.toDomain(entity));
  }

  async findBySubscriptionId(subscriptionId: string): Promise<Payment[]> {
    const entities = await this.repository.find({ where: { subscriptionId } });
    return entities.map(entity => this.toDomain(entity));
  }

  async update(payment: Payment): Promise<Payment> {
    const entity = this.toEntity(payment);
    const updated = await this.repository.save(entity);
    return this.toDomain(updated);
  }

  private toDomain(entity: PaymentEntity): Payment {
    return new Payment(
      entity.id,
      entity.applicationId,
      entity.externalId,
      new Money(entity.amount, entity.currency),
      entity.method,
      entity.status,
      entity.description,
      entity.metadata,
      entity.subscriptionId,
      entity.createdAt,
      entity.updatedAt
    );
  }

  private toEntity(payment: Payment): PaymentEntity {
    const entity = new PaymentEntity();
    entity.id = payment.id;
    entity.applicationId = payment.applicationId;
    entity.externalId = payment.externalId;
    entity.amount = payment.amount.amount;
    entity.currency = payment.amount.currency;
    entity.method = payment.method;
    entity.status = payment.status;
    entity.description = payment.description;
    entity.metadata = payment.metadata;
    entity.subscriptionId = payment.subscriptionId;
    entity.createdAt = payment.createdAt;
    entity.updatedAt = payment.updatedAt;
    return entity;
  }
}