import { DataSource } from 'typeorm';
import { PaymentEntity } from '../entities/payment.entity';
import { ApplicationEntity } from '../entities/application.entity';
import { SubscriptionEntity } from '../entities/subscription.entity';
import { PaymentMethod, PaymentStatus } from '../../../domain/entities/payment.entity';
import { v4 as uuid } from 'uuid';

export class PaymentSeed {
  public static async run(dataSource: DataSource): Promise<void> {
    const paymentRepository = dataSource.getRepository(PaymentEntity);
    const applicationRepository = dataSource.getRepository(ApplicationEntity);
    const subscriptionRepository = dataSource.getRepository(SubscriptionEntity);

    const applications = await applicationRepository.find();
    const subscriptions = await subscriptionRepository.find();

    if (applications.length === 0) {
      console.log('No applications found. Run application seed first.');
      return;
    }

    const payments = [
      {
        id: uuid(),
        applicationId: applications[0].id,
        externalId: 'mp_payment_001',
        amount: 99.90,
        currency: 'BRL',
        method: PaymentMethod.PIX,
        status: PaymentStatus.APPROVED,
        description: 'Product purchase - Premium Package',
        metadata: { productId: 'prod_001', orderId: 'order_001' },
        subscriptionId: null,
      },
      {
        id: uuid(),
        applicationId: applications[0].id,
        externalId: 'mp_payment_002',
        amount: 29.90,
        currency: 'BRL',
        method: PaymentMethod.PIX,
        status: PaymentStatus.APPROVED,
        description: 'Subscription payment - Basic Plan',
        metadata: { subscriptionPayment: true },
        subscriptionId: subscriptions[0]?.id || null,
      },
      {
        id: uuid(),
        applicationId: applications[1].id,
        externalId: 'mp_payment_003',
        amount: 199.90,
        currency: 'BRL',
        method: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.PENDING,
        description: 'Service payment - Consulting',
        metadata: { serviceId: 'service_001' },
        subscriptionId: null,
      },
      {
        id: uuid(),
        applicationId: applications[1].id,
        externalId: 'mp_payment_004',
        amount: 99.90,
        currency: 'BRL',
        method: PaymentMethod.PIX,
        status: PaymentStatus.APPROVED,
        description: 'Subscription payment - Pro Plan',
        metadata: { subscriptionPayment: true },
        subscriptionId: subscriptions[1]?.id || null,
      },
      {
        id: uuid(),
        applicationId: applications[0].id,
        externalId: 'mp_payment_005',
        amount: 49.90,
        currency: 'BRL',
        method: PaymentMethod.PIX,
        status: PaymentStatus.REJECTED,
        description: 'Product purchase - Basic Package',
        metadata: { productId: 'prod_002', orderId: 'order_002', rejectionReason: 'insufficient_funds' },
        subscriptionId: null,
      },
    ];

    for (const paymentData of payments) {
      const existingPayment = await paymentRepository.findOne({ 
        where: { externalId: paymentData.externalId } 
      });
      if (!existingPayment) {
        const payment = paymentRepository.create(paymentData);
        await paymentRepository.save(payment);
        console.log(`Created payment: ${paymentData.externalId} - ${paymentData.status}`);
      }
    }
  }
}