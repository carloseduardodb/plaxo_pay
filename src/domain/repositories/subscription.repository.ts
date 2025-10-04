import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';

export interface SubscriptionRepository {
  save(subscription: Subscription): Promise<Subscription>;
  findById(id: string): Promise<Subscription | null>;
  findByApplicationId(applicationId: string, status?: SubscriptionStatus): Promise<Subscription[]>;
  findByCustomerId(customerId: string): Promise<Subscription[]>;
  findDueForRenewal(date: Date): Promise<Subscription[]>;
  update(subscription: Subscription): Promise<Subscription>;
}