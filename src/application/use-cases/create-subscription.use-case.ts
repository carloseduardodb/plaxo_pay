import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Subscription, BillingCycle } from '@/domain/entities/subscription.entity';
import { Money } from '@/domain/value-objects/money.vo';
import { SubscriptionRepository } from '@/domain/repositories/subscription.repository';
import { PaymentGateway, SubscriptionRequest } from '@/domain/gateways/payment-gateway.interface';
import { SubscriptionCreatedEvent } from '@/domain/events/subscription.events';
import { EventService } from '@/infrastructure/events/event.service';
import { v4 as uuid } from 'uuid';

export interface CreateSubscriptionCommand {
  applicationId: string;
  planName: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  customerId: string;
  startDate?: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class CreateSubscriptionUseCase {
  constructor(
    @Inject('SubscriptionRepository') private readonly subscriptionRepository: SubscriptionRepository,
    @Inject('PaymentGateway') private readonly paymentGateway: PaymentGateway,
    private readonly eventEmitter: EventEmitter2,
    private readonly eventService: EventService
  ) {}

  async execute(command: CreateSubscriptionCommand): Promise<Subscription> {
    const money = new Money(command.amount, command.currency);
    const startDate = command.startDate || new Date();
    const nextBillingDate = this.calculateNextBillingDate(startDate, command.billingCycle);

    const gatewayRequest: SubscriptionRequest = {
      amount: money,
      customerId: command.customerId,
      planName: command.planName,
      billingCycle: command.billingCycle,
      description: `Subscription for ${command.planName}`
    };

    const gatewayResponse = await this.paymentGateway.createSubscription(gatewayRequest);

    const subscription = new Subscription(
      uuid(),
      command.applicationId,
      command.planName,
      money,
      command.billingCycle,
      undefined,
      startDate,
      nextBillingDate,
      command.customerId,
      command.metadata
    );

    const savedSubscription = await this.subscriptionRepository.save(subscription);

    await this.eventEmitter.emitAsync('subscription.created',
      new SubscriptionCreatedEvent(
        savedSubscription.id,
        savedSubscription.applicationId,
        savedSubscription.customerId,
        savedSubscription.planName,
        savedSubscription.amount.amount
      )
    );

    // Publish to KeyDB
    await this.eventService.publishSubscriptionEvent({
      type: 'subscription.created',
      subscriptionId: savedSubscription.id,
      applicationId: savedSubscription.applicationId,
      customerId: savedSubscription.customerId,
      amount: savedSubscription.amount.amount,
      timestamp: new Date().toISOString(),
    });

    return savedSubscription;
  }

  private calculateNextBillingDate(startDate: Date, cycle: BillingCycle): Date {
    const nextDate = new Date(startDate);
    switch (cycle) {
      case BillingCycle.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case BillingCycle.QUARTERLY:
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case BillingCycle.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    return nextDate;
  }
}