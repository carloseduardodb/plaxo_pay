import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PaymentMethod } from '@/domain/entities/payment.entity';
import { BillingCycle } from '@/domain/entities/subscription.entity';
import { setupTestApp, closeTestApp } from './test-setup';

describe('Integration Tests (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testApplicationId: string;

  beforeAll(async () => {
    app = await setupTestApp();

    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'admin',
        password: 'admin123',
      });

    authToken = loginResponse.body.access_token;

    // Create test application
    const appResponse = await request(app.getHttpServer())
      .post('/applications')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Integration App',
        apiKey: 'test-integration-key',
      });
    
    testApplicationId = appResponse.body.id;
  }, 30000);

  afterAll(async () => {
    await closeTestApp();
  });

  describe('Complete subscription flow', () => {
    it('should create subscription and process recurring payment', async () => {
      const customerId = 'customer-integration';

      // 1. Create subscription
      const subscriptionResponse = await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          applicationId: testApplicationId,
          planName: 'Integration Test Plan',
          amount: 49.90,
          billingCycle: BillingCycle.MONTHLY,
          customerId,
        })
        .expect(201);

      const subscriptionId = subscriptionResponse.body.id;

      // 2. Create payment for subscription
      const paymentResponse = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          applicationId: testApplicationId,
          amount: 49.90,
          method: PaymentMethod.PIX,
          description: 'Subscription payment',
          customerId,
          subscriptionId,
        })
        .expect(201);

      // 3. Verify payment is linked to subscription
      expect(paymentResponse.body.subscriptionId).toBe(subscriptionId);

      // 4. Get payments by subscription
      const subscriptionPayments = await request(app.getHttpServer())
        .get(`/payments/subscription/${subscriptionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(subscriptionPayments.body).toHaveLength(1);
      expect(subscriptionPayments.body[0].id).toBe(paymentResponse.body.id);

      // 5. Cancel subscription
      await request(app.getHttpServer())
        .put(`/subscriptions/${subscriptionId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 6. Verify subscription is cancelled
      const cancelledSubscription = await request(app.getHttpServer())
        .get(`/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(cancelledSubscription.body.status).toBe('cancelled');
    });
  });

  describe('Payment flow with different methods', () => {
    it('should handle PIX and credit card payments', async () => {

      // PIX Payment
      const pixPayment = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          applicationId: testApplicationId,
          amount: 100.00,
          method: PaymentMethod.PIX,
          description: 'PIX payment test',
          customerId: 'customer-pix',
        })
        .expect(201);

      expect(pixPayment.body.method).toBe(PaymentMethod.PIX);

      // Credit Card Payment
      const cardPayment = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          applicationId: testApplicationId,
          amount: 200.00,
          method: PaymentMethod.CREDIT_CARD,
          description: 'Credit card payment test',
          customerId: 'customer-card',
        })
        .expect(201);

      expect(cardPayment.body.method).toBe(PaymentMethod.CREDIT_CARD);

      // Get all payments for application
      const allPayments = await request(app.getHttpServer())
        .get(`/payments/application/${testApplicationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(allPayments.body.length).toBeGreaterThanOrEqual(2);
      
      // Verify we have the PIX and credit card payments we just created
      const pixPaymentExists = allPayments.body.some(p => p.method === PaymentMethod.PIX && p.description === 'PIX payment test');
      const cardPaymentExists = allPayments.body.some(p => p.method === PaymentMethod.CREDIT_CARD && p.description === 'Credit card payment test');
      
      expect(pixPaymentExists).toBe(true);
      expect(cardPaymentExists).toBe(true);
    });
  });
});