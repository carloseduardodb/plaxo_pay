import { Injectable, Inject } from '@nestjs/common';
import { SubscriptionRepository } from '@/domain/repositories/subscription.repository';
import { Subscription, SubscriptionStatus } from '@/domain/entities/subscription.entity';
import { EventService } from '@/infrastructure/events/event.service';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject('SubscriptionRepository') private readonly subscriptionRepository: SubscriptionRepository,
    private readonly eventService: EventService
  ) {}

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
    const result = await this.subscriptionRepository.update(cancelledSubscription);

    // Publish event
    await this.eventService.publishSubscriptionEvent({
      type: 'subscription.cancelled',
      subscriptionId: result.id,
      applicationId: result.applicationId,
      customerId: result.customerId,
      amount: result.amount.amount,
      timestamp: new Date().toISOString(),
    });

    return result;
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