import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PaymentEntity } from './payment.entity';
import { SubscriptionEntity } from './subscription.entity';

@Entity('applications')
export class ApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  apiKey: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PaymentEntity, payment => payment.application)
  payments: PaymentEntity[];

  @OneToMany(() => SubscriptionEntity, subscription => subscription.application)
  subscriptions: SubscriptionEntity[];
}