import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PaymentStatus, PaymentMethod } from '../../../domain/entities/payment.entity';
import { ApplicationEntity } from './application.entity';
import { SubscriptionEntity } from './subscription.entity';

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  applicationId: string;

  @Column()
  externalId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'BRL' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ nullable: true })
  description: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  subscriptionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ApplicationEntity, application => application.payments)
  @JoinColumn({ name: 'applicationId' })
  application: ApplicationEntity;

  @ManyToOne(() => SubscriptionEntity, subscription => subscription.payments, { nullable: true })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: SubscriptionEntity;
}