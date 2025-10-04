import { DataSource } from 'typeorm';
import { SubscriptionEntity } from '../entities/subscription.entity';
import { ApplicationEntity } from '../entities/application.entity';
import { BillingCycle, SubscriptionStatus } from '../../../domain/entities/subscription.entity';
import { v4 as uuid } from 'uuid';

export class SubscriptionSeed {
  public static async run(dataSource: DataSource): Promise<void> {
    const subscriptionRepository = dataSource.getRepository(SubscriptionEntity);
    const applicationRepository = dataSource.getRepository(ApplicationEntity);

    const applications = await applicationRepository.find();
    if (applications.length === 0) {
      console.log('No applications found. Run application seed first.');
      return;
    }

    const subscriptions = [
      {
        id: uuid(),
        applicationId: applications[0].id,
        planName: 'Basic Plan',
        amount: 29.90,
        currency: 'BRL',
        billingCycle: BillingCycle.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date('2024-01-01'),
        nextBillingDate: new Date('2024-02-01'),
        customerId: 'customer_001',
        metadata: { features: ['basic_support', 'limited_storage'] },
      },
      {
        id: uuid(),
        applicationId: applications[1].id,
        planName: 'Pro Plan',
        amount: 99.90,
        currency: 'BRL',
        billingCycle: BillingCycle.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date('2024-01-15'),
        nextBillingDate: new Date('2024-02-15'),
        customerId: 'customer_002',
        metadata: { features: ['priority_support', 'unlimited_storage', 'advanced_analytics'] },
      },
      {
        id: uuid(),
        applicationId: applications[0].id,
        planName: 'Enterprise Plan',
        amount: 299.90,
        currency: 'BRL',
        billingCycle: BillingCycle.QUARTERLY,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date('2024-01-01'),
        nextBillingDate: new Date('2024-04-01'),
        customerId: 'customer_003',
        metadata: { features: ['dedicated_support', 'custom_integrations', 'sla_guarantee'] },
      },
    ];

    for (const subData of subscriptions) {
      const existingSub = await subscriptionRepository.findOne({ 
        where: { customerId: subData.customerId, planName: subData.planName } 
      });
      if (!existingSub) {
        const subscription = subscriptionRepository.create(subData);
        await subscriptionRepository.save(subscription);
        console.log(`Created subscription: ${subData.planName} for ${subData.customerId}`);
      }
    }
  }
}