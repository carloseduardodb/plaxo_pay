import { Injectable, Inject } from '@nestjs/common';
import { SubscriptionRepository } from '@/domain/repositories/subscription.repository';
import { Subscription, SubscriptionStatus } from '@/domain/entities/subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(@Inject('SubscriptionRepository') private readonly subscriptionRepository: SubscriptionRepository) {}

  async getSubscriptionById(id: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findById(id);
  }

  async getSubscriptionsByApplication(
    applicationId: string,
    status?: SubscriptionStatus
  ): Promise<Subscription[]> {
    return this.subscriptionRepository.findByApplicationId(applicationId, status);
  }

  async getSubscriptionsByCustomer(customerId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.findByCustomerId(customerId);
  }

  async getSubscriptionsDueForRenewal(date: Date = new Date()): Promise<Subscription[]> {
    return this.subscriptionRepository.findDueForRenewal(date);
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const cancelledSubscription = subscription.cancel();
    return this.subscriptionRepository.update(cancelledSubscription);
  }

  async suspendSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const suspendedSubscription = subscription.suspend();
    return this.subscriptionRepository.update(suspendedSubscription);
  }
}