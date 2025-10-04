import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { BillingCycle } from '@/domain/entities/subscription.entity';
import { setupTestApp, closeTestApp } from './test-setup';

describe('SubscriptionController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testApplicationId: string;

  beforeAll(async () => {
    app = await setupTestApp();
    
    // Login to get auth token
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
        name: 'Test Subscription App',
        apiKey: 'test-subscription-key',
      });
    
    testApplicationId = appResponse.body.id;
  }, 30000);

  afterAll(async () => {
    await closeTestApp();
  });

  describe('/subscriptions (POST)', () => {
    it('should create a new subscription', () => {
      const createSubscriptionDto = {
        applicationId: testApplicationId,
        planName: 'Basic Plan',
        amount: 29.90,
        currency: 'BRL',
        billingCycle: BillingCycle.MONTHLY,
        customerId: 'customer-123',
      };

      return request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createSubscriptionDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.planName).toBe(createSubscriptionDto.planName);
          expect(res.body.amount.amount).toBe(createSubscriptionDto.amount);
          expect(res.body.billingCycle).toBe(createSubscriptionDto.billingCycle);
        });
    });

    it('should return 401 without auth token', () => {
      const createSubscriptionDto = {
        applicationId: testApplicationId,
        planName: 'Basic Plan',
        amount: 29.90,
        billingCycle: BillingCycle.MONTHLY,
        customerId: 'customer-123',
      };

      return request(app.getHttpServer())
        .post('/subscriptions')
        .send(createSubscriptionDto)
        .expect(401);
    });
  });

  describe('/subscriptions/:id/cancel (PUT)', () => {
    it('should cancel subscription', async () => {
      // First create a subscription
      const createSubscriptionDto = {
        applicationId: testApplicationId,
        planName: 'Basic Plan',
        amount: 29.90,
        billingCycle: BillingCycle.MONTHLY,
        customerId: 'customer-123',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createSubscriptionDto);

      const subscriptionId = createResponse.body.id;

      // Then cancel it
      return request(app.getHttpServer())
        .put(`/subscriptions/${subscriptionId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('cancelled');
        });
    });
  });
});