import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SubscriptionStatus, BillingCycle } from '../../../domain/entities/subscription.entity';
import { ApplicationEntity } from './application.entity';
import { PaymentEntity } from './payment.entity';

@Entity('subscriptions')
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  applicationId: string;

  @Column()
  planName: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'BRL' })
  currency: string;

  @Column({ type: 'enum', enum: BillingCycle })
  billingCycle: BillingCycle;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Column()
  startDate: Date;

  @Column()
  nextBillingDate: Date;

  @Column()
  customerId: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ApplicationEntity, application => application.subscriptions)
  @JoinColumn({ name: 'applicationId' })
  application: ApplicationEntity;

  @OneToMany(() => PaymentEntity, payment => payment.subscription)
  payments: PaymentEntity[];
}